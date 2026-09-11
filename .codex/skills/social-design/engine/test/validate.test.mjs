import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { countWords, isMosaicFormat, slideText, validateDeck, validateMosaicDeck } from '../lib/validate.mjs';

const PATTERNS = {
  cover: { required: ['title'] },
  'title-body': { required: ['title'] },
  bridge: { required: ['title'], span: 2 },
  closing: { required: ['title', 'cta'], cta: true },
};

const baseDeck = (slides, format = 'ig-carousel') => ({ format, slides });

test('countWords counts on whitespace and ignores extra spaces', () => {
  assert.equal(countWords('Kopi  seduhanmu   pahit?'), 3);
  assert.equal(countWords('   '), 0);
});

test('slideText collects every text field including list items', () => {
  const text = slideText({ title: 'A', body: 'B', items: [{ title: 'C', text: 'D' }, 'E'] });
  assert.equal(text, 'A B C D E');
});

test('missing required field is a clear per-slide error', () => {
  const { errors } = validateDeck(baseDeck([{ pattern: 'cover' }]), PATTERNS);
  assert.match(errors[0], /slide 1.*cover.*missing required field "title"/);
});

test('unknown pattern is reported with the available list', () => {
  const { errors } = validateDeck(baseDeck([{ pattern: 'ghost', title: 'x' }]), PATTERNS);
  assert.match(errors[0], /unknown pattern "ghost".*cover/);
});

test('word count over the brand limit is rejected with a split suggestion', () => {
  const title = Array.from({ length: 50 }, (_, i) => `kata${i}`).join(' ');
  const { errors } = validateDeck(baseDeck([{ pattern: 'cover', title }]), PATTERNS, { rules: { maxWords: 45 } });
  assert.match(errors[0], /50 words, max 45 — split it into 2 slides/);
});

test('span multiplies the word budget (a bridge pair gets 2x the single-slide limit)', () => {
  const title = Array.from({ length: 60 }, (_, i) => `kata${i}`).join(' ');
  const { errors } = validateDeck(baseDeck([{ pattern: 'bridge', title }]), PATTERNS, { rules: { maxWords: 45 } });
  assert.equal(errors.length, 0);
});

test('banned characters (brand rule) are flagged with the offending character', () => {
  const { errors } = validateDeck(
    baseDeck([{ pattern: 'cover', title: 'Rasa — yang beda' }]),
    PATTERNS,
    { rules: { bannedChars: ['—'] } },
  );
  assert.match(errors[0], /banned character "—"/);
});

test('missing image file is reported, present file is not', () => {
  const patterns = { 'image-text': { required: ['title'] } };
  const deck = baseDeck([{ pattern: 'image-text', title: 'x', image: 'assets/missing.jpg' }]);
  const { errors } = validateDeck(deck, patterns, {}, () => false);
  assert.match(errors[0], /image "assets\/missing\.jpg" not found/);
});

test('output count over the format max-slides is rejected', () => {
  const slides = Array.from({ length: 21 }, () => ({ pattern: 'cover', title: 'x' }));
  const { errors } = validateDeck(baseDeck(slides), PATTERNS);
  assert.match(errors[0], /21 images but ig-carousel allows at most 20/);
});

test('more than 2 connected (span>1) pairs is rejected', () => {
  const slides = Array.from({ length: 3 }, () => ({ pattern: 'bridge', title: 'x' }));
  const { errors } = validateDeck(baseDeck(slides), PATTERNS);
  assert.match(errors[0], /3 connected pairs — max 2/);
});

test('a deck ending without a CTA slide gets a warning, not an error', () => {
  const deck = baseDeck([{ pattern: 'cover', title: 'x' }, { pattern: 'title-body', title: 'y' }]);
  const { errors, warnings } = validateDeck(deck, PATTERNS);
  assert.equal(errors.length, 0);
  assert.match(warnings.join(' '), /no CTA/);
});

test('a deck ending with the cta pattern has no such warning', () => {
  const deck = baseDeck([{ pattern: 'cover', title: 'x' }, { pattern: 'closing', title: 'y', cta: 'Go' }]);
  const { warnings } = validateDeck(deck, PATTERNS);
  assert.ok(!warnings.some((w) => /no CTA/.test(w)));
});

test('more than one CTA slide is a warning (one call to action per carousel)', () => {
  const deck = baseDeck([
    { pattern: 'closing', title: 'a', cta: 'Go' },
    { pattern: 'closing', title: 'b', cta: 'Go again' },
  ]);
  const { warnings } = validateDeck(deck, PATTERNS);
  assert.match(warnings.join(' '), /2 slides carry a CTA/);
});

test('a photo slide without chromeOn gets a warning (chrome legibility depends on the actual photo)', () => {
  const patterns = { photo: { required: ['image'] } };
  const deck = baseDeck([{ pattern: 'photo', image: 'x.jpg' }]);
  const { warnings } = validateDeck(deck, patterns, {}, () => true);
  assert.match(warnings.join(' '), /chromeOn/);
});

test('a photo slide with chromeOn set has no such warning', () => {
  const patterns = { photo: { required: ['image'] } };
  const deck = baseDeck([{ pattern: 'photo', image: 'x.jpg', chromeOn: 'light' }]);
  const { warnings } = validateDeck(deck, patterns, {}, () => true);
  assert.ok(!warnings.some((w) => /chromeOn/.test(w)));
});

test('a deck with no slides array fails clearly instead of crashing', () => {
  const { errors } = validateDeck({ format: 'ig-carousel' }, PATTERNS);
  assert.match(errors[0], /no "slides" array/);
});

// ---------- mosaic decks ----------

test('isMosaicFormat distinguishes grid formats from normal post formats', () => {
  assert.equal(isMosaicFormat('ig-mosaic-3x3'), true);
  assert.equal(isMosaicFormat('ig-carousel'), false);
});

test('a mosaic deck needs exactly the cell count its grid format requires', () => {
  const deck = { format: 'ig-mosaic-3x3', cells: [{ pattern: 'cover', title: 'x' }] };
  const { errors } = validateMosaicDeck(deck, PATTERNS);
  assert.match(errors[0], /ig-mosaic-3x3 needs exactly 9 cells \(3x3\), deck has 1/);
});

test('a pinned row deck with exactly 3 cells passes the count check', () => {
  const deck = { format: 'ig-mosaic-pinned-1x3', cells: Array.from({ length: 3 }, () => ({ pattern: 'cover', title: 'x' })) };
  const { errors } = validateMosaicDeck(deck, PATTERNS);
  assert.ok(!errors.some((e) => /needs exactly/.test(e)));
});

test('a span>1 pattern in a mosaic cell is rejected — cells must stand alone', () => {
  const deck = { format: 'ig-mosaic-pinned-1x3', cells: [
    { pattern: 'bridge', title: 'a' }, { pattern: 'cover', title: 'b' }, { pattern: 'cover', title: 'c' },
  ] };
  const { errors } = validateMosaicDeck(deck, PATTERNS);
  assert.match(errors.join(' '), /cell 1.*bridge.*spans 2.*must be span-1/);
});

test('an unknown mosaic format is reported, not thrown', () => {
  const deck = { format: 'ig-mosaic-nope', cells: [{ pattern: 'cover', title: 'x' }] };
  const { errors } = validateMosaicDeck(deck, PATTERNS);
  assert.match(errors.join(' '), /Unknown mosaic format/);
});

test('a mosaic deck has no "no CTA" or "connected pairs" warnings — those are carousel-only concerns', () => {
  const deck = { format: 'ig-mosaic-pinned-1x3', cells: Array.from({ length: 3 }, () => ({ pattern: 'cover', title: 'x' })) };
  const { warnings } = validateMosaicDeck(deck, PATTERNS);
  assert.equal(warnings.length, 0);
});
