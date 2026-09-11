import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { allPatternFiles, loadPatternMeta } from '../lib/patterns.mjs';
import { outputPlan } from '../lib/render.mjs';
import { ENGINE_DIR } from '../lib/studio.mjs';

// ---------- pure: no browser needed ----------

const META = { cover: { span: 1 }, bridge: { span: 2 }, closing: { span: 1, cta: true } };

test('outputPlan numbers files continuously across a spanning slide', () => {
  const plan = outputPlan([{ pattern: 'cover' }, { pattern: 'bridge' }, { pattern: 'closing' }], META);
  assert.deepEqual(plan.map((p) => p.files), [['slide-01.png'], ['slide-02.png', 'slide-03.png'], ['slide-04.png']]);
});

test('outputPlan marks only the final output as last (swipe indicator hides there)', () => {
  const plan = outputPlan([{ pattern: 'cover' }, { pattern: 'bridge' }, { pattern: 'closing' }], META);
  assert.deepEqual(plan.map((p) => p.isLast), [false, false, true]);
  assert.equal(plan[0].total, 4);
});

// ---------- integration: real headless Chrome ----------

async function chromeAvailable() {
  try {
    const { chromium } = await import('playwright-core');
    const browser = await chromium.launch({ channel: 'chrome' });
    await browser.close();
    return true;
  } catch {
    return false;
  }
}
const HAS_CHROME = await chromeAvailable();
const skip = HAS_CHROME ? false : 'Chrome / playwright-core not available';

const TOKENS_CSS = `:root {
  --ss-bg:#FBF8F2; --ss-bg-alt:#7C3F2B; --ss-text:#231210; --ss-text-muted:#7C6C67; --ss-heading:#7C3F2B;
  --ss-accent:#E59524; --ss-accent-text:#7C3F2B; --ss-accent-on-alt:#E59524; --ss-on-alt:#FFFFFF;
  --ss-on-alt-muted:#E8DFD3; --ss-cta-bg:#E59524; --ss-cta-text:#231210;
  --ss-font-display: Georgia, serif; --ss-font-body: system-ui, sans-serif; }`;

function tempBrand() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ss-render-'));
  fs.writeFileSync(path.join(dir, 'tokens.css'), TOKENS_CSS);
  return dir;
}

function png(file) {
  const h = fs.readFileSync(file).subarray(0, 24);
  return { w: h.readUInt32BE(16), h: h.readUInt32BE(20) };
}

async function render(dir, slides, { fonts = [], scale = 1 } = {}) {
  const { renderDeck } = await import('../lib/render.mjs');
  const files = allPatternFiles(ENGINE_DIR, dir);
  return renderDeck({
    brandPath: dir,
    outDir: path.join(dir, 'out'),
    // No web fonts by default -> no network dependency, deterministic test.
    brand: { name: 't', wordmark: 'T', fonts },
    deck: { format: 'ig-carousel', slides },
    patternFiles: files,
    patternMeta: loadPatternMeta(files),
    scale,
  });
}

test('renders a deck with a spanning slide into correctly sized, numbered PNGs', { skip }, async () => {
  const dir = tempBrand();
  const res = await render(dir, [
    { pattern: 'cover', title: 'Satu' },
    { pattern: 'bridge', title: 'Dua', body: 'isi' },
    { pattern: 'closing', title: 'Tiga', cta: 'Mulai' },
  ]);
  assert.deepEqual(res.files.map((f) => path.basename(f)), ['slide-01.png', 'slide-02.png', 'slide-03.png', 'slide-04.png']);
  for (const f of res.files) assert.deepEqual(png(f), { w: 1080, h: 1350 });
  fs.rmSync(dir, { recursive: true, force: true });
});

test('scale 2 doubles the pixel size of every output', { skip }, async () => {
  const dir = tempBrand();
  const res = await render(dir, [{ pattern: 'cover', title: 'x' }], { scale: 2 });
  assert.deepEqual(png(res.files[0]), { w: 2160, h: 2700 });
  fs.rmSync(dir, { recursive: true, force: true });
});

test('re-rendering a shortened deck removes stale slides from the previous render', { skip }, async () => {
  const dir = tempBrand();
  await render(dir, [{ pattern: 'cover', title: 'a' }, { pattern: 'cover', title: 'b' }, { pattern: 'cover', title: 'c' }]);
  await render(dir, [{ pattern: 'cover', title: 'a' }]);
  assert.deepEqual(fs.readdirSync(path.join(dir, 'out')).sort(), ['slide-01.png']);
  fs.rmSync(dir, { recursive: true, force: true });
});

// Regression guard: an unloadable font must FAIL with an actionable message — never
// silently render with a fallback, and never surface Playwright's bare
// "page.addStyleTag: Event".
test('an unloadable web font fails loudly with an actionable message', { skip }, async () => {
  const dir = tempBrand();
  await assert.rejects(
    render(dir, [{ pattern: 'cover', title: 'x' }], { fonts: [{ family: 'DefinitelyNotARealFont123', weights: [400] }] }),
    (err) => {
      assert.match(err.message, /Font not loaded: DefinitelyNotARealFont123 400/);
      assert.match(err.message, /Refusing to render with a fallback font/);
      assert.doesNotMatch(err.message, /addStyleTag: Event/);
      return true;
    },
  );
  assert.ok(!fs.existsSync(path.join(dir, 'out', 'slide-01.png')), 'no PNG may be written when fonts are missing');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('chromeOn actually recolors the wordmark and handle, not just an ancestor style', { skip }, async () => {
  // Mirrors renderDeck's real loading sequence (goto the shell's file:// origin, then
  // addStyleTag/addScriptTag by path) rather than setContent + <script src="file://">,
  // which Chrome refuses to load from an about:blank document.
  const { chromium } = await import('playwright-core');
  const { pathToFileURL } = await import('node:url');
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
    await page.goto(pathToFileURL(path.join(ENGINE_DIR, 'shell.html')).href);
    await page.addStyleTag({ content: TOKENS_CSS });
    await page.addStyleTag({ path: path.join(ENGINE_DIR, 'base.css') });
    await page.addScriptTag({ path: path.join(ENGINE_DIR, 'core.js') });
    await page.addScriptTag({ content: "UC.register({ name: 'blank', required: [], render: () => '' });" });
    const ctx = { format: (await import('../lib/formats.mjs')).getFormat('ig-carousel'),
      brand: { name: 't', wordmark: 'T', handle: '@t' }, chrome: { swipeLabel: 'Geser', showHandle: true },
      type: { displayWeight: 700, bodyWeight: 400 }, assetBase: '', showSwipe: true };
    const colorOf = (sel) => page.$eval(sel, (el) => getComputedStyle(el).color);

    await page.evaluate(({ slide, ctx }) => UC.renderSlide(slide, ctx), { slide: { pattern: 'blank' }, ctx });
    const withoutOverride = await colorOf('.ss-wordmark');

    await page.evaluate(({ slide, ctx }) => UC.renderSlide(slide, ctx), { slide: { pattern: 'blank', chromeOn: 'light' }, ctx });
    assert.equal(await colorOf('.ss-wordmark'), 'rgb(255, 255, 255)');
    assert.equal(await colorOf('.ss-handle'), 'rgb(255, 255, 255)');
    assert.notEqual(await colorOf('.ss-wordmark'), withoutOverride);
  } finally {
    await browser.close();
  }
});

test('a full-bleed pattern (inset:0 absolute layers) never buries the wordmark', { skip }, async () => {
  // Regression: .ss-head used to be a static (non-positioned) block, so ANY absolutely
  // positioned pattern content painted above it regardless of DOM order or z-index —
  // .ss-foot happened to survive only because it was already position:absolute itself.
  // document.elementFromPoint proves what a viewer actually sees, not just that the
  // wordmark node exists with the right CSS color (which it did even while hidden).
  const { chromium } = await import('playwright-core');
  const { pathToFileURL } = await import('node:url');
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
    await page.goto(pathToFileURL(path.join(ENGINE_DIR, 'shell.html')).href);
    await page.addStyleTag({ content: TOKENS_CSS });
    await page.addStyleTag({ path: path.join(ENGINE_DIR, 'base.css') });
    await page.addScriptTag({ path: path.join(ENGINE_DIR, 'core.js') });
    await page.addScriptTag({
      content: `UC.register({ name: 'fullbleed', required: [], render: () =>
        '<div style="position:absolute;inset:0;z-index:0;background:#000"></div>' +
        '<div style="position:absolute;inset:0;z-index:2"></div>' });`,
    });
    const ctx = { format: (await import('../lib/formats.mjs')).getFormat('ig-carousel'),
      brand: { name: 't', wordmark: 'T', handle: '@t' }, chrome: { swipeLabel: 'Geser', showHandle: true },
      type: { displayWeight: 700, bodyWeight: 400 }, assetBase: '', showSwipe: true };
    await page.evaluate(({ slide, ctx }) => UC.renderSlide(slide, ctx), { slide: { pattern: 'fullbleed', chromeOn: 'light' }, ctx });

    const wordmarkIsHit = await page.evaluate(() => {
      const el = document.querySelector('.ss-wordmark');
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return el.contains(hit) || hit === el;
    });
    assert.ok(wordmarkIsHit, 'a full-bleed pattern layer is on top at the wordmark\'s own coordinates — it is visually buried');

    const footerIsHit = await page.evaluate(() => {
      const el = document.querySelector('.ss-swipe');
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return el.contains(hit) || hit === el;
    });
    assert.ok(footerIsHit, 'footer (swipe indicator) must also stay on top');
  } finally {
    await browser.close();
  }
});

test('word-split (span 3) renders three correctly sized, numbered PNGs', { skip }, async () => {
  const dir = tempBrand();
  const res = await render(dir, [{ pattern: 'word-split', letters: ['N', 'E', 'W'] }]);
  assert.equal(res.files.length, 3);
  for (const f of res.files) assert.deepEqual(png(f), { w: 1080, h: 1350 });
  fs.rmSync(dir, { recursive: true, force: true });
});

test('a missing tokens.css fails before launching the browser', async () => {
  const { renderDeck } = await import('../lib/render.mjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ss-render-'));
  await assert.rejects(
    renderDeck({ brandPath: dir, outDir: dir, brand: { name: 'nope' }, deck: { format: 'ig-carousel', slides: [] },
      patternFiles: [], patternMeta: {} }),
    /Missing .*tokens\.css — run: social tokens nope/,
  );
  fs.rmSync(dir, { recursive: true, force: true });
});
