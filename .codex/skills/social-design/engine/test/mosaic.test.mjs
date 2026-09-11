import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { bleedX, cellFormat, cellPosition, getMosaicFormat, uploadOrder } from '../lib/mosaic.mjs';

test('ig-mosaic-3x3 is a 3x3 grid of 9 posts (each cell a normal 1080x1350 portrait post)', () => {
  const m = getMosaicFormat('ig-mosaic-3x3');
  assert.equal(m.maxCells, 9);
  assert.equal(m.width, 3 * 1080);
  assert.equal(m.height, 3 * 1350);
});

test('ig-mosaic-pinned-1x3 is a single row of 3 posts', () => {
  const m = getMosaicFormat('ig-mosaic-pinned-1x3');
  assert.equal(m.maxCells, 3);
  assert.equal(m.width, 3240);
  assert.equal(m.height, 1350);
});

test('an unknown mosaic format fails loudly, listing known ones', () => {
  assert.throws(() => getMosaicFormat('ig-mosaic-nope'), /Unknown mosaic format.*ig-mosaic-3x3/);
});

test('cellFormat mirrors a normal single-post format (chrome/type scale behave identically)', () => {
  const m = getMosaicFormat('ig-mosaic-3x3');
  const cf = cellFormat(m);
  assert.equal(cf.width, 1080);
  assert.equal(cf.height, 1350);
  assert.equal(cf.maxSlides, 1);
});

test('cellPosition maps a reading-order index to its grid row/col and pixel offset', () => {
  const m = getMosaicFormat('ig-mosaic-3x3');
  assert.deepEqual(cellPosition(0, m), { row: 0, col: 0, x: 0, y: 0 });
  assert.deepEqual(cellPosition(2, m), { row: 0, col: 2, x: 2160, y: 0 });
  assert.deepEqual(cellPosition(3, m), { row: 1, col: 0, x: 0, y: 1350 });
  assert.deepEqual(cellPosition(8, m), { row: 2, col: 2, x: 2160, y: 2700 });
});

test('uploadOrder reverses reading order — Instagram inserts new posts top-left', () => {
  assert.deepEqual(uploadOrder(3), [2, 1, 0]);
  assert.deepEqual(uploadOrder(9), [8, 7, 6, 5, 4, 3, 2, 1, 0]);
});

test('bleedX gives edge columns the full 80px overlap on their one open side', () => {
  const m = getMosaicFormat('ig-mosaic-3x3');
  assert.equal(bleedX(0, m), 0); // leftmost: bleed only rightward, crop starts at 0
  assert.equal(bleedX(2, m), 3240 - 1160); // rightmost: crop ends exactly at master width
});

test('bleedX splits the overlap 40/40 for interior columns', () => {
  const m = getMosaicFormat('ig-mosaic-3x3');
  assert.equal(bleedX(1, m), 1 * 1080 - 40);
});

test('every bleed crop stays within the master canvas bounds', () => {
  const m = getMosaicFormat('ig-mosaic-3x3');
  for (let col = 0; col < m.cols; col += 1) {
    const x = bleedX(col, m);
    assert.ok(x >= 0, `col ${col}: bleed x ${x} is negative`);
    assert.ok(x + m.cellWidth + 80 <= m.width, `col ${col}: bleed crop overruns master width`);
  }
});
