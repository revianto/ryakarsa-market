#!/usr/bin/env node
// social — CLI for the social-design engine.
//
//   social brands                                   list brands in the studio
//   social init-brand <name> --design-system <ds>   create a brand from a design-tokens entry
//       [--wordmark "Name"] [--handle @x] [--format ig-carousel]
//   social tokens <brand>                           regenerate tokens.css from design-tokens
//   social patterns [brand]                         list patterns + required fields
//   social decks <brand>                            list decks
//   social validate <brand> <deck>                  check a deck without rendering
//   social render <brand> <deck|--all> [--scale N]  validate, then render PNGs
//
// Studio location: $SOCIAL_STUDIO or ~/Documents/social-studio.

import fs from 'node:fs';
import path from 'node:path';
import { FORMATS } from './lib/formats.mjs';
import { MOSAIC_FORMATS } from './lib/mosaic.mjs';
import { allPatternFiles, loadPatternMeta } from './lib/patterns.mjs';
import { renderDeck, renderMosaicDeck } from './lib/render.mjs';
import {
  ENGINE_DIR, brandDir, designTokensLibrary, listBrands, listDecks, loadBrand, loadJson, resolveDeck, studioRoot,
} from './lib/studio.mjs';
import { buildTokensCss, checkContrast, guessRoles, primaryFamily } from './lib/tokens.mjs';
import { isMosaicFormat, validateDeck, validateMosaicDeck } from './lib/validate.mjs';

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) flags[key] = true;
      else { flags[key] = next; i += 1; }
    } else positional.push(a);
  }
  return { positional, flags };
}

class UsageError extends Error {}
const need = (v, msg) => { if (!v || v === true) throw new UsageError(msg); return v; };

function loadDesignTokens(name) {
  const file = path.join(designTokensLibrary(), name, 'tokens.json');
  return loadJson(file, `design-tokens "${name}"`);
}

function writeTokensCss(studio, brandName) {
  const { dir, config } = loadBrand(studio, brandName);
  const ds = need(config.designSystem, `brand.json of "${brandName}" has no "designSystem"`);
  const tokens = loadDesignTokens(ds);
  const css = buildTokensCss(tokens, config.roles || {}, ds);
  fs.writeFileSync(path.join(dir, 'tokens.css'), css);
  return { file: path.join(dir, 'tokens.css'), contrast: checkContrast(tokens, config.roles || {}) };
}

function reportTokens({ file, contrast }) {
  console.log(`Wrote ${file}`);
  if (!contrast.length) return console.log('Contrast: all role pairs pass WCAG AA.');
  console.log('\nContrast problems (fix the mapping in brand.json "roles", then: social tokens <brand>):');
  for (const p of contrast) {
    console.log(`  - ${p.fgRole} on ${p.bgRole}: ${p.ratio}:1, needs ${p.min}:1 for ${p.use}`);
  }
}

function patternsFor(studio, brandName) {
  const bdir = brandName ? brandDir(studio, brandName) : path.join(studio, '__none__');
  const files = allPatternFiles(ENGINE_DIR, bdir);
  return { files, meta: loadPatternMeta(files) };
}

function validateBrandDeck(studio, brandName, deckArg) {
  const { dir, config } = loadBrand(studio, brandName);
  const deckFile = resolveDeck(dir, deckArg);
  const deck = loadJson(deckFile, `deck "${deckArg}"`);
  const { files, meta } = patternsFor(studio, brandName);
  const mosaic = isMosaicFormat(deck.format);
  const validate = mosaic ? validateMosaicDeck : validateDeck;
  const result = validate(deck, meta, config, (rel) => fs.existsSync(path.join(dir, rel)));
  return { dir, config, deck, deckFile, files, meta, mosaic, ...result };
}

function printIssues(label, { errors, warnings }) {
  for (const w of warnings) console.log(`WARN ${label}: ${w}`);
  for (const e of errors) console.error(`FAIL ${label}: ${e}`);
}

const commands = {
  brands(_, __, studio) {
    const brands = listBrands(studio);
    if (!brands.length) return console.log(`No brands in ${studio}. Create one: social init-brand <name> --design-system <ds>`);
    for (const b of brands) {
      const { config, dir } = loadBrand(studio, b);
      console.log(`- ${b}  (design system: ${config.designSystem || '?'}, ${listDecks(dir).length} deck)`);
    }
  },

  'init-brand'({ positional, flags }, _, studio) {
    const name = need(positional[0], 'Usage: social init-brand <name> --design-system <ds>');
    const ds = need(flags['design-system'], 'Missing --design-system <name> (an entry in the design-tokens library)');
    const dir = brandDir(studio, name);
    if (fs.existsSync(path.join(dir, 'brand.json'))) throw new Error(`Brand "${name}" already exists: ${dir}`);

    const tokens = loadDesignTokens(ds);
    const { roles, missing } = guessRoles(tokens);
    const display = tokens.typography?.fontFamily?.display || tokens.typography?.fontFamily?.heading;
    const body = tokens.typography?.fontFamily?.body || tokens.typography?.fontFamily?.sans;
    const fonts = [];
    if (display) fonts.push({ family: primaryFamily(display), weights: [700], italic: [400] });
    if (body && (!display || primaryFamily(body) !== primaryFamily(display))) fonts.push({ family: primaryFamily(body), weights: [400, 600] });

    const brand = {
      name,
      wordmark: typeof flags.wordmark === 'string' ? flags.wordmark : name,
      handle: typeof flags.handle === 'string' ? flags.handle : '',
      designSystem: ds,
      defaults: { format: typeof flags.format === 'string' ? flags.format : 'ig-carousel' },
      roles,
      fonts,
      type: { displayWeight: 700, bodyWeight: 400 },
      chrome: { swipeLabel: 'Geser', showHandle: true },
      rules: { maxWords: 45, bannedChars: [] },
    };
    for (const sub of ['decks', 'patterns', 'assets', 'output']) fs.mkdirSync(path.join(dir, sub), { recursive: true });
    fs.writeFileSync(path.join(dir, 'brand.json'), `${JSON.stringify(brand, null, 2)}\n`);
    console.log(`Created ${dir}/brand.json`);
    if (missing.length) {
      console.log(`\nCould not guess these roles from "${ds}" — map them in brand.json "roles", then run: social tokens ${name}`);
      for (const m of missing) console.log(`  - ${m}`);
      return;
    }
    reportTokens(writeTokensCss(studio, name));
    console.log('\nReview brand.json (roles, fonts & weights, handle) — the guesses are a starting point, not decisions.');
  },

  tokens({ positional }, _, studio) {
    const name = need(positional[0], 'Usage: social tokens <brand>');
    reportTokens(writeTokensCss(studio, name));
  },

  patterns({ positional }, _, studio) {
    const { meta } = patternsFor(studio, positional[0]);
    for (const [name, m] of Object.entries(meta).sort()) {
      const origin = m.file.startsWith(ENGINE_DIR) ? 'engine' : 'brand';
      console.log(`- ${name}${m.span > 1 ? ` [span ${m.span}]` : ''}${m.cta ? ' [cta]' : ''}  (${origin})`);
      if (m.description) console.log(`    ${m.description}`);
      console.log(`    required: ${m.required.join(', ') || '-'}   optional: ${m.optional.join(', ') || '-'}`);
    }
  },

  decks({ positional }, _, studio) {
    const name = need(positional[0], 'Usage: social decks <brand>');
    const { dir } = loadBrand(studio, name);
    const decks = listDecks(dir);
    console.log(decks.length ? decks.map((d) => `- ${d}`).join('\n') : `No decks yet in ${dir}/decks`);
  },

  validate({ positional }, _, studio) {
    const [brand, deck] = positional;
    need(brand && deck, 'Usage: social validate <brand> <deck>');
    const r = validateBrandDeck(studio, brand, deck);
    printIssues(deck, r);
    if (r.errors.length) return 1;
    const count = r.mosaic ? r.deck.cells.length : r.deck.slides.length;
    console.log(`OK   ${deck}: ${count} ${r.mosaic ? 'cell' : 'slide'}(s), format ${r.deck.format}`);
    return 0;
  },

  async render({ positional, flags }, _, studio) {
    const [brand, deckArg] = [positional[0], positional[1] || (flags.all ? '--all' : undefined)];
    need(brand && deckArg, 'Usage: social render <brand> <deck|--all> [--scale N]');
    const scale = flags.scale ? Number(flags.scale) : undefined;
    if (scale !== undefined && ![1, 2, 3].includes(scale)) throw new UsageError('--scale must be 1, 2 or 3');
    const { dir } = loadBrand(studio, brand);
    const decks = deckArg === '--all' ? listDecks(dir) : [deckArg];
    let failed = 0;
    for (const d of decks) {
      const r = validateBrandDeck(studio, brand, d);
      printIssues(d, r);
      if (r.errors.length) { failed += 1; continue; }
      const outDir = path.join(dir, 'output', path.basename(r.deckFile, '.json'));
      const renderFn = r.mosaic ? renderMosaicDeck : renderDeck;
      const res = await renderFn({
        brandPath: dir, brand: r.config, deck: r.deck, patternFiles: r.files, patternMeta: r.meta,
        outDir, scale, log: (m) => console.log(m),
      });
      console.log(`DONE ${d}: ${res.files.length} PNG at ${res.scale}x -> ${outDir}`);
    }
    return failed ? 1 : 0;
  },
};

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd || !commands[cmd]) {
    console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 14).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
    console.log(`Formats: ${Object.keys(FORMATS).join(', ')}`);
    console.log(`Mosaic formats (deck uses "cells" instead of "slides"): ${Object.keys(MOSAIC_FORMATS).join(', ')}`);
    return cmd ? 1 : 0;
  }
  return commands[cmd](parseArgs(rest), cmd, studioRoot());
}

main().then((code) => process.exit(code || 0)).catch((e) => {
  console.error(e instanceof UsageError ? e.message : `Error: ${e.message}`);
  process.exit(1);
});
