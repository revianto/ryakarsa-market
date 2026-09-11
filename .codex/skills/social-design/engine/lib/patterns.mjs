// Pattern files are plain browser scripts that call UC.register({...}). To validate
// decks in Node (no browser), evaluate them in a sandbox with a fake UC that only
// records metadata — render functions are never executed here.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export function patternFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.js') && !f.startsWith('_'))
    .sort()
    .map((f) => path.join(dir, f));
}

export function loadPatternMeta(files) {
  const meta = {};
  for (const file of files) {
    const registry = {
      register(p) {
        if (!p || typeof p.name !== 'string' || typeof p.render !== 'function') {
          throw new Error(`${file}: UC.register needs { name, render }`);
        }
        meta[p.name] = {
          required: p.required || [],
          optional: p.optional || [],
          span: p.span || 1,
          cta: Boolean(p.cta),
          description: p.description || '',
          file,
        };
      },
    };
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), { UC: registry }, { filename: file });
  }
  return meta;
}

// Brand patterns are loaded after engine patterns, so a brand can override a
// built-in pattern by registering the same name.
export function allPatternFiles(engineDir, brandDir) {
  return [...patternFiles(path.join(engineDir, 'patterns')), ...patternFiles(path.join(brandDir, 'patterns'))];
}
