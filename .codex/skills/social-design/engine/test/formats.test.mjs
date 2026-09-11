import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { FORMATS, getFormat } from '../lib/formats.mjs';

test('getFormat returns the spec merged with its name', () => {
  const f = getFormat('ig-carousel');
  assert.equal(f.name, 'ig-carousel');
  assert.equal(f.width, 1080);
  assert.equal(f.height, 1350);
});

test('getFormat rejects an unknown format with the list of known ones', () => {
  assert.throws(() => getFormat('pinterest-pin'), /Unknown format.*pinterest-pin.*ig-carousel/s);
});

test('YouTube thumbnail defaults to 1x (2 MB cap)', () => {
  assert.equal(FORMATS['yt-thumbnail'].scale, 1);
});

test('Instagram carousel defaults to 2x (recompression survives sharper)', () => {
  assert.equal(FORMATS['ig-carousel'].scale, 2);
});
