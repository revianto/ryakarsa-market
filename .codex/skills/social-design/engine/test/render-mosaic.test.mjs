import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { allPatternFiles, loadPatternMeta } from '../lib/patterns.mjs';
import { getMosaicFormat } from '../lib/mosaic.mjs';
import { ENGINE_DIR } from '../lib/studio.mjs';

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ss-mosaic-'));
  fs.writeFileSync(path.join(dir, 'tokens.css'), TOKENS_CSS);
  return dir;
}

function png(file) {
  const h = fs.readFileSync(file).subarray(0, 24);
  return { w: h.readUInt32BE(16), h: h.readUInt32BE(20) };
}

async function renderMosaic(dir, cells, format = 'ig-mosaic-pinned-1x3') {
  const { renderMosaicDeck } = await import('../lib/render.mjs');
  const files = allPatternFiles(ENGINE_DIR, dir);
  return renderMosaicDeck({
    brandPath: dir,
    outDir: path.join(dir, 'out'),
    brand: { name: 't', wordmark: 'T', fonts: [] },
    deck: { format, cells },
    patternFiles: files,
    patternMeta: loadPatternMeta(files),
    scale: 1,
  });
}

test('renders a pinned-row mosaic into standard (1080x1350) and bleed (1160x1350) crops per cell', { skip }, async () => {
  const dir = tempBrand();
  const res = await renderMosaic(dir, [
    { pattern: 'cover', title: 'Satu' },
    { pattern: 'cover', title: 'Dua' },
    { pattern: 'cover', title: 'Tiga' },
  ]);
  assert.equal(res.files.length, 6); // 3 cells x (standard + bleed)
  for (const f of res.files) {
    const dims = png(f);
    if (f.includes('-bleed')) assert.deepEqual(dims, { w: 1160, h: 1350 });
    else assert.deepEqual(dims, { w: 1080, h: 1350 });
  }
  fs.rmSync(dir, { recursive: true, force: true });
});

test('upload order is bottom-right to top-left, reversed from reading order', { skip }, async () => {
  const dir = tempBrand();
  const res = await renderMosaic(dir, [
    { pattern: 'cover', title: 'a' },
    { pattern: 'cover', title: 'b' },
    { pattern: 'cover', title: 'c' },
  ]);
  assert.deepEqual(res.uploadOrder.map((c) => c.col), [2, 1, 0]);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('mosaic cells render with no wordmark/handle chrome — the grid is one continuous surface', { skip }, async () => {
  const { chromium } = await import('playwright-core');
  const { pathToFileURL } = await import('node:url');
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(path.join(ENGINE_DIR, 'shell.html')).href);
    await page.addStyleTag({ content: TOKENS_CSS });
    await page.addStyleTag({ path: path.join(ENGINE_DIR, 'base.css') });
    await page.addScriptTag({ path: path.join(ENGINE_DIR, 'core.js') });
    await page.addScriptTag({ path: path.join(ENGINE_DIR, 'patterns', 'cover.js') });
    const mosaic = getMosaicFormat('ig-mosaic-pinned-1x3');
    const ctx = {
      brand: { name: 't', wordmark: 'T', handle: '@t' }, type: { displayWeight: 700, bodyWeight: 400 }, assetBase: '',
      mosaic: { cols: mosaic.cols, rows: mosaic.rows, cellWidth: mosaic.cellWidth, cellHeight: mosaic.cellHeight,
        width: mosaic.width, height: mosaic.height, cellFormat: { width: 1080, height: 1350, margin: 80, safeTop: 0, safeBottom: 150 } },
    };
    const cells = [{ pattern: 'cover', title: 'x' }, { pattern: 'cover', title: 'y' }, { pattern: 'cover', title: 'z' }];
    await page.evaluate(({ cells, ctx }) => window.UC.renderMosaic(cells, ctx), { cells, ctx });
    assert.equal(await page.$$eval('.ss-wordmark', (els) => els.length), 0);
    assert.equal(await page.$$eval('.ss-swipe', (els) => els.length), 0);
    assert.equal(await page.$$eval('.ss-canvas', (els) => els.length), 3);
  } finally {
    await browser.close();
  }
});

test('a mosaic cell using a span>1 pattern is refused before launching the browser', async () => {
  const { renderMosaicDeck } = await import('../lib/render.mjs');
  const dir = tempBrand();
  const files = allPatternFiles(ENGINE_DIR, dir);
  await assert.rejects(
    renderMosaicDeck({
      brandPath: dir, outDir: path.join(dir, 'out'), brand: { name: 't', wordmark: 'T', fonts: [] },
      deck: { format: 'ig-mosaic-pinned-1x3', cells: [{ pattern: 'bridge', title: 'a' }, { pattern: 'cover', title: 'b' }, { pattern: 'cover', title: 'c' }] },
      patternFiles: files, patternMeta: loadPatternMeta(files),
    }),
    /Mosaic cells must be span-1.*bridge.*spans 2/,
  );
  fs.rmSync(dir, { recursive: true, force: true });
});
