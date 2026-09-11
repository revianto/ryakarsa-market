import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { googleFontsUrl, requiredFaces } from '../lib/fonts.mjs';

test('googleFontsUrl builds a wght tuple list per family', () => {
  const url = googleFontsUrl([{ family: 'Fraunces', weights: [700, 800] }]);
  assert.match(url, /family=Fraunces:wght@700;800/);
  assert.match(url, /display=block/);
});

test('googleFontsUrl orders italic tuples after upright ones (Google API requirement)', () => {
  const url = googleFontsUrl([{ family: 'Fraunces', weights: [700], italic: [400] }]);
  assert.match(url, /family=Fraunces:ital,wght@0,700;1,400/);
});

test('googleFontsUrl returns null for a brand with no web fonts declared', () => {
  assert.equal(googleFontsUrl([]), null);
  assert.equal(googleFontsUrl(undefined), null);
});

test('requiredFaces expands weights and italics into individual face checks', () => {
  const faces = requiredFaces([{ family: 'Fraunces', weights: [700, 800], italic: [400] }]);
  assert.deepEqual(faces, [
    { family: 'Fraunces', weight: 700, style: 'normal' },
    { family: 'Fraunces', weight: 800, style: 'normal' },
    { family: 'Fraunces', weight: 400, style: 'italic' },
  ]);
});
