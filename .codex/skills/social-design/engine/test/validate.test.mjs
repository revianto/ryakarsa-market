import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { countWords, slideText, validateDeck } from '../lib/validate.mjs';

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

test('a deck with no slides array fails clearly instead of crashing', () => {
  const { errors } = validateDeck({ format: 'ig-carousel' }, PATTERNS);
  assert.match(errors[0], /no "slides" array/);
});
