// Where brand data lives. The engine code ships with the skill; brand data
// (brand.json, tokens.css, decks, custom patterns, outputs) lives in a separate
// "studio" folder that is its own private git repo, so it persists across
// sessions and is backed up.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ENGINE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function studioRoot(env = process.env) {
  return path.resolve(env.SOCIAL_STUDIO || path.join(os.homedir(), 'Documents', 'social-studio'));
}

// design-tokens is a sibling skill: <skills>/social-design/engine -> <skills>/design-tokens/library
export function designTokensLibrary(env = process.env) {
  return path.resolve(env.DESIGN_TOKENS_LIBRARY || path.join(ENGINE_DIR, '..', '..', 'design-tokens', 'library'));
}

export const brandDir = (studio, brand) => path.join(studio, 'brands', brand);

export function listBrands(studio) {
  const dir = path.join(studio, 'brands');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((b) => fs.existsSync(path.join(dir, b, 'brand.json'))).sort();
}

export function loadJson(file, what) {
  if (!fs.existsSync(file)) throw new Error(`${what} not found: ${file}`);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    throw new Error(`${what} is not valid JSON (${file}): ${e.message}`);
  }
}

export function loadBrand(studio, brand) {
  const dir = brandDir(studio, brand);
  if (!fs.existsSync(path.join(dir, 'brand.json'))) {
    const known = listBrands(studio);
    throw new Error(`Brand "${brand}" not found in ${studio}/brands. ${known.length ? `Known: ${known.join(', ')}` : 'No brands yet — run: social init-brand <name>'}`);
  }
  return { dir, config: loadJson(path.join(dir, 'brand.json'), 'brand.json') };
}

// Accepts a bare deck name ("launch") or a path to a .json file.
export function resolveDeck(brandPath, deckArg) {
  if (deckArg.endsWith('.json') && fs.existsSync(deckArg)) return path.resolve(deckArg);
  return path.join(brandPath, 'decks', `${deckArg.replace(/\.json$/, '')}.json`);
}

export function listDecks(brandPath) {
  const dir = path.join(brandPath, 'decks');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => f.replace(/\.json$/, ''));
}
