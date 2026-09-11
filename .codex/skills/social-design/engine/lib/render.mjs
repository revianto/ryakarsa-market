// Render a validated deck to PNGs with headless Chrome (via playwright-core,
// using the Chrome already installed — no browser download).

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getFormat } from './formats.mjs';
import { googleFontsUrl, requiredFaces } from './fonts.mjs';
import { ENGINE_DIR } from './studio.mjs';

export function outputPlan(slides, patternMeta) {
  const total = slides.reduce((n, s) => n + (patternMeta[s.pattern]?.span || 1), 0);
  let index = 0;
  return slides.map((slide) => {
    const span = patternMeta[slide.pattern]?.span || 1;
    const files = Array.from({ length: span }, (_, k) => `slide-${String(index + k + 1).padStart(2, '0')}.png`);
    const entry = { slide, span, files, isLast: index + span === total, total };
    index += span;
    return entry;
  });
}

// Runs in the page. Verifies every required face is genuinely LOADED — not just
// "check() == true", which is also true when the family was never declared
// (e.g. the Google Fonts stylesheet failed to load offline).
async function verifyFontsAndImages(faces) {
  await document.fonts.ready;
  await Promise.all(faces.map((f) =>
    document.fonts.load(`${f.style === 'italic' ? 'italic ' : ''}${f.weight} 40px "${f.family}"`).catch(() => null)));
  const loaded = [...document.fonts].filter((ff) => ff.status === 'loaded');
  const covers = (ff, f) => {
    if (ff.family.replace(/['"]/g, '') !== f.family) return false;
    if ((ff.style === 'italic') !== (f.style === 'italic')) return false;
    const [lo, hi = lo] = String(ff.weight).split(/\s+/).map(Number);
    return f.weight >= lo && f.weight <= hi;
  };
  const missing = faces.filter((f) => !loaded.some((ff) => covers(ff, f)))
    .map((f) => `${f.family} ${f.weight}${f.style === 'italic' ? ' italic' : ''}`);

  const imgs = [...document.images];
  await Promise.all(imgs.map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
  const brokenImages = imgs.filter((img) => !img.naturalWidth).map((img) => img.getAttribute('src'));
  return { missing, brokenImages };
}

export async function renderDeck({ brandPath, brand, deck, patternFiles, patternMeta, outDir, scale, log = () => {} }) {
  const format = getFormat(deck.format);
  const pxScale = scale ?? brand.formats?.[deck.format]?.scale ?? format.scale;
  const tokensCss = path.join(brandPath, 'tokens.css');
  if (!fs.existsSync(tokensCss)) throw new Error(`Missing ${tokensCss} — run: social tokens ${brand.name}`);

  const { chromium } = await import('playwright-core');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome' });
  } catch (e) {
    throw new Error(`Could not start Google Chrome (${e.message.split('\n')[0]}). Install Chrome, or use "ide saja" mode.`);
  }

  const written = [];
  try {
    const page = await browser.newPage({ viewport: { width: format.width, height: format.height }, deviceScaleFactor: pxScale });
    await page.goto(pathToFileURL(path.join(ENGINE_DIR, 'shell.html')).href);
    const fontsUrl = googleFontsUrl(brand.fonts);
    let fontsSheetError = null;
    if (fontsUrl) {
      // If the stylesheet fails (offline, unknown family -> HTTP 400), Playwright throws a
      // bare "page.addStyleTag: Event". Swallow it here: the face verification below then
      // reports exactly which fonts are missing, with an actionable message.
      try { await page.addStyleTag({ url: fontsUrl }); } catch { fontsSheetError = fontsUrl; }
    }
    await page.addStyleTag({ path: path.join(ENGINE_DIR, 'base.css') });
    await page.addStyleTag({ path: tokensCss });
    const brandCss = path.join(brandPath, 'brand.css');
    if (fs.existsSync(brandCss)) await page.addStyleTag({ path: brandCss });
    await page.addScriptTag({ path: path.join(ENGINE_DIR, 'core.js') });
    for (const file of patternFiles) await page.addScriptTag({ path: file });

    fs.mkdirSync(outDir, { recursive: true });
    // A shortened deck must not leave stale slides from a previous render behind.
    for (const f of fs.readdirSync(outDir)) if (/^slide-\d+\.png$/.test(f)) fs.unlinkSync(path.join(outDir, f));
    const faces = requiredFaces(brand.fonts);
    const baseCtx = {
      format,
      brand: { name: brand.name, wordmark: brand.wordmark, handle: brand.handle },
      chrome: { swipeLabel: 'Geser', showHandle: true, ...(brand.chrome || {}) },
      type: { displayWeight: 700, bodyWeight: 400, ...(brand.type || {}) },
      assetBase: pathToFileURL(brandPath).href + '/',
    };

    for (const entry of outputPlan(deck.slides, patternMeta)) {
      await page.setViewportSize({ width: format.width * entry.span, height: format.height });
      const ctx = { ...baseCtx, showSwipe: entry.total > 1 && !entry.isLast };
      await page.evaluate(({ slide, ctx }) => window.UC.renderSlide(slide, ctx), { slide: entry.slide, ctx });

      const { missing, brokenImages } = await page.evaluate(verifyFontsAndImages, faces);
      if (missing.length) {
        const why = fontsSheetError
          ? 'The Google Fonts stylesheet failed to load — offline, or a family name is misspelled / not on Google Fonts.'
          : 'Offline, or that weight/style is not published for this family on Google Fonts?';
        throw new Error(`Font not loaded: ${missing.join(', ')}. ${why} Refusing to render with a fallback font.`);
      }
      if (brokenImages.length) throw new Error(`Image failed to load: ${brokenImages.join(', ')}`);

      for (let k = 0; k < entry.span; k += 1) {
        const file = path.join(outDir, entry.files[k]);
        await page.screenshot({ path: file, clip: { x: k * format.width, y: 0, width: format.width, height: format.height } });
        written.push(file);
        log(`OK   ${file}`);
      }
    }
  } finally {
    await browser.close();
  }
  return { files: written, scale: pxScale, format };
}
