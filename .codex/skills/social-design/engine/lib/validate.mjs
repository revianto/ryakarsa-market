// Deck validation — runs before every render so a broken deck fails with a clear
// message instead of producing plausible-looking but wrong PNGs.

import { FORMATS } from './formats.mjs';
import { MOSAIC_FORMATS, getMosaicFormat } from './mosaic.mjs';

const TEXT_FIELDS = ['title', 'subtitle', 'body', 'quote', 'attribution', 'label', 'value', 'cta', 'caption'];

export function slideText(slide) {
  const parts = [];
  for (const key of TEXT_FIELDS) if (typeof slide[key] === 'string') parts.push(slide[key]);
  if (Array.isArray(slide.items)) {
    for (const item of slide.items) {
      if (typeof item === 'string') parts.push(item);
      else if (item && typeof item === 'object') {
        for (const v of Object.values(item)) if (typeof v === 'string') parts.push(v);
      }
    }
  }
  return parts.join(' ');
}

export function countWords(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/**
 * @param deck      parsed deck JSON
 * @param patterns  { [name]: { required: string[], span?: number, cta?: boolean } }
 * @param brand     parsed brand.json
 * @param fileExists (path) => boolean — for image fields, relative to the brand dir
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateDeck(deck, patterns, brand = {}, fileExists = () => true) {
  const errors = [];
  const warnings = [];
  const rules = brand.rules || {};
  const maxWords = rules.maxWords ?? 45;
  const banned = rules.bannedChars || [];

  if (!deck || typeof deck !== 'object') return { errors: ['Deck is not a JSON object'], warnings };
  const format = FORMATS[deck.format];
  if (!format) errors.push(`Unknown format "${deck.format}". Known: ${Object.keys(FORMATS).join(', ')}`);
  if (!Array.isArray(deck.slides) || deck.slides.length === 0) {
    errors.push('Deck has no "slides" array');
    return { errors, warnings };
  }

  let outputCount = 0;
  let spanCount = 0;
  let ctaCount = 0;

  deck.slides.forEach((slide, i) => {
    const where = `slide ${i + 1}`;
    const spec = patterns[slide.pattern];
    if (!spec) {
      errors.push(`${where}: unknown pattern "${slide.pattern}". Available: ${Object.keys(patterns).sort().join(', ')}`);
      outputCount += 1;
      return;
    }
    for (const field of spec.required || []) {
      const v = slide[field];
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
        errors.push(`${where} (${slide.pattern}): missing required field "${field}"`);
      }
    }
    const span = spec.span || 1;
    outputCount += span;
    if (span > 1) spanCount += 1;
    if (spec.cta || slide.cta) ctaCount += 1;

    const text = slideText(slide);
    const words = countWords(text);
    const limit = maxWords * span;
    if (words > limit) {
      errors.push(`${where}: ${words} words, max ${limit} — split it into ${Math.ceil(words / maxWords)} slides`);
    }
    for (const ch of banned) {
      if (text.includes(ch)) errors.push(`${where}: contains banned character "${ch}" (brand rule)`);
    }
    if (typeof slide.image === 'string' && !fileExists(slide.image)) {
      errors.push(`${where}: image "${slide.image}" not found in the brand folder`);
    }
    if (slide.pattern === 'photo' && !slide.chromeOn) {
      warnings.push(`${where}: pattern "photo" has no "chromeOn" ("light"/"dark") — wordmark/handle color follows the brand token for this ground, which may not read over the actual photo`);
    }
  });

  if (format && outputCount > format.maxSlides) {
    errors.push(`${outputCount} images but ${deck.format} allows at most ${format.maxSlides}`);
  }
  if (spanCount > 2) errors.push(`${spanCount} connected pairs — max 2 per carousel`);
  if (ctaCount > 1) warnings.push(`${ctaCount} slides carry a CTA — one call to action per carousel converts better than several`);
  if (format && format.maxSlides > 1 && deck.slides.length > 1) {
    const last = deck.slides[deck.slides.length - 1];
    if (!(patterns[last.pattern]?.cta || last.cta)) warnings.push('Last slide has no CTA — carousels should end with one clear action');
  }
  return { errors, warnings };
}

export function isMosaicFormat(name) {
  return name in MOSAIC_FORMATS;
}

/**
 * A mosaic deck has a `cells` array (not `slides`) — one continuous master
 * canvas split into N grid posts. Each cell must be a normal span-1 slide;
 * the count must exactly match the format's grid (9 for 3x3, 3 for pinned row).
 */
export function validateMosaicDeck(deck, patterns, brand = {}, fileExists = () => true) {
  const errors = [];
  const warnings = [];
  const rules = brand.rules || {};
  const maxWords = rules.maxWords ?? 45;
  const banned = rules.bannedChars || [];

  if (!deck || typeof deck !== 'object') return { errors: ['Deck is not a JSON object'], warnings };
  let format;
  try { format = getMosaicFormat(deck.format); } catch (e) { errors.push(e.message); }
  if (!Array.isArray(deck.cells) || deck.cells.length === 0) {
    errors.push('Mosaic deck has no "cells" array');
    return { errors, warnings };
  }
  if (format && deck.cells.length !== format.maxCells) {
    errors.push(`${deck.format} needs exactly ${format.maxCells} cells (${format.cols}x${format.rows}), deck has ${deck.cells.length}`);
  }

  deck.cells.forEach((cell, i) => {
    const where = `cell ${i + 1}`;
    const spec = patterns[cell.pattern];
    if (!spec) {
      errors.push(`${where}: unknown pattern "${cell.pattern}". Available: ${Object.keys(patterns).sort().join(', ')}`);
      return;
    }
    const span = spec.span || 1;
    if (span > 1) errors.push(`${where}: pattern "${cell.pattern}" spans ${span} images — mosaic cells must be span-1`);
    for (const field of spec.required || []) {
      const v = cell[field];
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
        errors.push(`${where} (${cell.pattern}): missing required field "${field}"`);
      }
    }
    const text = slideText(cell);
    const words = countWords(text);
    if (words > maxWords) {
      errors.push(`${where}: ${words} words, max ${maxWords} — a grid tile is small, keep it shorter than a normal post`);
    }
    for (const ch of banned) {
      if (text.includes(ch)) errors.push(`${where}: contains banned character "${ch}" (brand rule)`);
    }
    if (typeof cell.image === 'string' && !fileExists(cell.image)) {
      errors.push(`${where}: image "${cell.image}" not found in the brand folder`);
    }
  });

  return { errors, warnings };
}
