// Generate a brand's tokens.css from a design-tokens `tokens.json`, so the
// design-tokens library stays the single source of truth for colors & fonts.
//
// Patterns never use a brand's own token names (every design system names them
// differently). They use a fixed ROLE contract (--ss-*). brand.json maps each
// role to a path inside tokens.json; this module resolves those paths.

export const COLOR_ROLES = {
  bg:        'Main ground of most slides',
  bgAlt:     'Contrasting ground (dark spread / inverse slides)',
  text:      'Body text on bg',
  textMuted: 'Captions / secondary text on bg',
  heading:   'Headings on bg',
  accent:    'Decorative accent — rules, bars, panels (non-text)',
  accentText:'Accent for text-sized use on bg — numbers, links, quote marks',
  accentOnAlt:'Accent used on bgAlt (dark grounds usually need a brighter accent)',
  onAlt:     'Text on bgAlt',
  onAltMuted:'Secondary text on bgAlt',
  ctaBg:     'Filled CTA button background',
  ctaText:   'Filled CTA button text',
};

export const FONT_ROLES = { display: 'Headings', body: 'Body text & labels' };

// Common semantic names across design systems, tried in order when guessing a mapping.
const ROLE_CANDIDATES = {
  bg:         ['color.semantic.background'],
  bgAlt:      ['color.semantic.background-inverse', 'color.semantic.brand', 'color.semantic.surface-inverse'],
  text:       ['color.semantic.foreground', 'color.semantic.text-primary', 'color.semantic.text'],
  textMuted:  ['color.semantic.foreground-muted', 'color.semantic.text-muted', 'color.semantic.muted'],
  heading:    ['color.semantic.heading', 'color.semantic.brand', 'color.semantic.foreground', 'color.semantic.text-primary'],
  accent:     ['color.semantic.accent-foil', 'color.semantic.accent', 'color.semantic.primary'],
  accentText: ['color.semantic.accent-foil-text', 'color.semantic.accent-text', 'color.semantic.brand', 'color.semantic.accent'],
  accentOnAlt:['color.semantic.accent-on-dark', 'color.semantic.accent', 'color.semantic.primary'],
  onAlt:      ['color.semantic.foreground-inverse', 'color.semantic.text-inverted', 'color.semantic.background'],
  onAltMuted: ['color.semantic.foreground-inverse-muted', 'color.semantic.text-subtle', 'color.semantic.foreground-muted'],
  ctaBg:      ['color.semantic.accent', 'color.semantic.brand', 'color.semantic.primary'],
  ctaText:    ['color.semantic.text-primary', 'color.semantic.background', 'color.semantic.foreground'],
};
const FONT_CANDIDATES = {
  display: ['typography.fontFamily.display', 'typography.fontFamily.heading'],
  body:    ['typography.fontFamily.body', 'typography.fontFamily.sans'],
};

export function resolvePath(obj, path) {
  return path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), obj);
}

// A semantic color may be a plain hex or a {light, dark} pair; social posts use light.
function asColor(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && typeof value.light === 'string') return value.light;
  return undefined;
}

export function guessRoles(tokens) {
  const roles = {};
  const missing = [];
  for (const [role, candidates] of Object.entries(ROLE_CANDIDATES)) {
    const hit = candidates.find((p) => asColor(resolvePath(tokens, p)));
    if (hit) roles[role] = hit; else missing.push(role);
  }
  for (const [role, candidates] of Object.entries(FONT_CANDIDATES)) {
    const hit = candidates.find((p) => typeof resolvePath(tokens, p) === 'string');
    if (hit) roles[`font.${role}`] = hit; else missing.push(`font.${role}`);
  }
  return { roles, missing };
}

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

export function buildTokensCss(tokens, roles, sourceName) {
  const errors = [];
  const lines = [];
  for (const role of Object.keys(COLOR_ROLES)) {
    const path = roles[role];
    const value = path && asColor(resolvePath(tokens, path));
    if (!value) { errors.push(`color role "${role}" -> ${path || '(unmapped)'} does not resolve to a color`); continue; }
    lines.push(`  --ss-${kebab(role)}: ${value};`);
  }
  for (const role of Object.keys(FONT_ROLES)) {
    const path = roles[`font.${role}`];
    const value = path && resolvePath(tokens, path);
    if (typeof value !== 'string') { errors.push(`font role "${role}" -> ${path || '(unmapped)'} does not resolve to a font stack`); continue; }
    lines.push(`  --ss-font-${role}: ${value};`);
  }
  if (errors.length) {
    const err = new Error(`Cannot build tokens.css:\n- ${errors.join('\n- ')}\nFix the "roles" mapping in brand.json.`);
    err.details = errors;
    throw err;
  }
  return `/* GENERATED from design-tokens "${sourceName}" — do not edit by hand.\n   Change the design system, then run: social tokens <brand> */\n:root {\n${lines.join('\n')}\n}\n`;
}

// "Fraunces, Georgia, serif" -> "Fraunces" (the web font to load; the rest are fallbacks).
export function primaryFamily(stack) {
  return stack.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
}

// ---------- contrast (WCAG 2.x relative luminance) ----------

function hexToRgb(hex) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split('').map((ch) => ch + ch).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function luminance([r, g, b]) {
  const lin = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(fg, bg) {
  const a = hexToRgb(fg);
  const b = hexToRgb(bg);
  if (!a || !b) return null;
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Pairs the engine actually renders together, with the WCAG minimum for that use.
export const CONTRAST_PAIRS = [
  ['text', 'bg', 4.5, 'body text'],
  ['textMuted', 'bg', 4.5, 'captions/labels'],
  ['heading', 'bg', 3, 'headings (large text)'],
  ['accentText', 'bg', 3, 'accent numbers/links (large text)'],
  ['onAlt', 'bgAlt', 4.5, 'text on alt ground'],
  ['onAltMuted', 'bgAlt', 4.5, 'secondary text on alt ground'],
  ['accentOnAlt', 'bgAlt', 3, 'accent on alt ground'],
  ['ctaText', 'ctaBg', 4.5, 'CTA button label'],
];

export function checkContrast(tokens, roles) {
  const color = (role) => asColor(resolvePath(tokens, roles[role] || ''));
  const problems = [];
  for (const [fgRole, bgRole, min, use] of CONTRAST_PAIRS) {
    const ratio = contrastRatio(color(fgRole), color(bgRole));
    if (ratio !== null && ratio < min) {
      problems.push({ fgRole, bgRole, ratio: Math.round(ratio * 100) / 100, min, use });
    }
  }
  return problems;
}
