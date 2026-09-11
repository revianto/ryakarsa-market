import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { loadPatternMeta, patternFiles } from '../lib/patterns.mjs';

const ENGINE_DIR = path.resolve(import.meta.dirname, '..');
const PATTERNS_DIR = path.join(ENGINE_DIR, 'patterns');

test('patternFiles finds every built-in pattern and skips the underscore template', () => {
  const files = patternFiles(PATTERNS_DIR).map((f) => path.basename(f));
  assert.ok(files.includes('cover.js'));
  assert.ok(files.includes('bridge.js'));
  assert.ok(!files.includes('_template.js'));
});

test('every built-in pattern registers with a name and a render function', () => {
  const meta = loadPatternMeta(patternFiles(PATTERNS_DIR));
  assert.ok(Object.keys(meta).length >= 7);
  for (const [name, m] of Object.entries(meta)) {
    assert.ok(Array.isArray(m.required), `${name}: required should be an array`);
    assert.ok(m.file.endsWith('.js'));
  }
});

test('bridge is the only built-in pattern that spans two output images', () => {
  const meta = loadPatternMeta(patternFiles(PATTERNS_DIR));
  assert.equal(meta.bridge.span, 2);
  assert.equal(meta.cover.span, 1);
});

test('closing is the only built-in pattern marked as carrying the CTA', () => {
  const meta = loadPatternMeta(patternFiles(PATTERNS_DIR));
  assert.equal(meta.closing.cta, true);
  assert.equal(meta.cover.cta, false);
});

test('a pattern file that registers without a render function fails loudly', () => {
  const dir = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'ss-pattern-'));
  const file = path.join(dir, 'broken.js');
  fs.writeFileSync(file, "UC.register({ name: 'broken' });");
  assert.throws(() => loadPatternMeta([file]), /needs \{ name, render \}/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('photo pattern requires only an image (title/body optional for a pure photo slide)', () => {
  const meta = loadPatternMeta(patternFiles(PATTERNS_DIR));
  // meta.photo.required is an Array from the vm sandbox realm (loadPatternMeta uses
  // vm.runInNewContext) — Array.from() normalizes it to this realm's Array before a
  // strict deepEqual, which otherwise fails on constructor identity despite equal content.
  assert.deepEqual(Array.from(meta.photo.required), ['image']);
  assert.equal(meta.photo.span, 1);
});

test('the bridge crossing panel carries no text at the seam (per the design rule)', () => {
  const src = fs.readFileSync(path.join(PATTERNS_DIR, 'bridge.js'), 'utf8');
  const panelDiv = src.match(/<div style="position:absolute;left:\$\{panelLeft\}[\s\S]*?<\/div>/)[0];
  assert.ok(!/esc\(s\./.test(panelDiv), 'crossing panel must not render slide text (half must stand on its own)');
});
