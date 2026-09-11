import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { buildTokensCss, checkContrast, contrastRatio, guessRoles, primaryFamily, resolvePath } from '../lib/tokens.mjs';

const sampleTokens = {
  color: {
    semantic: {
      background: '#FBF8F2',
      'text-primary': '#231210',
      'text-muted': '#7C6C67',
      brand: '#7C3F2B',
      accent: '#E59524',
      'text-inverted': '#FFFFFF',
      'text-subtle': '#A29490',
    },
  },
  typography: {
    fontFamily: { display: 'Fraunces, Georgia, serif', body: 'Plus Jakarta Sans, system-ui, sans-serif' },
  },
};

test('resolvePath walks a dotted path through nested objects', () => {
  assert.equal(resolvePath(sampleTokens, 'color.semantic.background'), '#FBF8F2');
  assert.equal(resolvePath(sampleTokens, 'color.semantic.nope'), undefined);
  assert.equal(resolvePath(sampleTokens, 'a.b.c'), undefined);
});

test('primaryFamily takes the first font in a CSS stack', () => {
  assert.equal(primaryFamily('Fraunces, Georgia, serif'), 'Fraunces');
  assert.equal(primaryFamily('"Plus Jakarta Sans", system-ui'), 'Plus Jakarta Sans');
});

test('guessRoles finds common semantic names and reports what it could not map', () => {
  const { roles, missing } = guessRoles(sampleTokens);
  assert.equal(roles.bg, 'color.semantic.background');
  assert.equal(roles.text, 'color.semantic.text-primary');
  assert.equal(roles['font.display'], 'typography.fontFamily.display');
  assert.ok(missing.includes('ctaText') === false || typeof roles.ctaText === 'string');
});

test('buildTokensCss emits one --ss-* custom property per role', () => {
  const { roles } = guessRoles(sampleTokens);
  const css = buildTokensCss(sampleTokens, roles, 'sample');
  assert.match(css, /--ss-bg: #FBF8F2;/);
  assert.match(css, /--ss-font-display: Fraunces, Georgia, serif;/);
});

test('buildTokensCss refuses to write a file when a role does not resolve', () => {
  assert.throws(() => buildTokensCss(sampleTokens, { bg: 'color.semantic.does-not-exist' }, 'sample'),
    /color role "bg".*does not resolve/);
});

test('a {light, dark} color pair resolves to its light value', () => {
  const tokens = { color: { semantic: { background: { light: '#FFF', dark: '#000' } } } };
  const allRoles = Object.fromEntries(
    ['bg', 'bgAlt', 'text', 'textMuted', 'heading', 'accent', 'accentText', 'accentOnAlt', 'onAlt', 'onAltMuted', 'ctaBg', 'ctaText']
      .map((r) => [r, 'color.semantic.background']),
  );
  const withFonts = { ...tokens, typography: { fontFamily: { display: 'A', body: 'B' } } };
  const css = buildTokensCss(withFonts, { ...allRoles, 'font.display': 'typography.fontFamily.display', 'font.body': 'typography.fontFamily.body' }, 't');
  assert.match(css, /--ss-bg: #FFF;/);
  assert.match(css, /--ss-bg-alt: #FFF;/);
});

test('contrastRatio matches known WCAG reference values', () => {
  assert.equal(contrastRatio('#000000', '#FFFFFF'), 21);
  assert.equal(contrastRatio('#FFFFFF', '#FFFFFF'), 1);
});

test('contrastRatio is symmetric regardless of fg/bg order', () => {
  assert.equal(contrastRatio('#7C3F2B', '#FBF8F2'), contrastRatio('#FBF8F2', '#7C3F2B'));
});

test('checkContrast flags a pair below its WCAG minimum with the actual ratio', () => {
  const tokens = { color: { semantic: { muted: '#A29490', dark: '#7C3F2B' } } };
  const roles = { onAltMuted: 'color.semantic.muted', bgAlt: 'color.semantic.dark' };
  const problems = checkContrast(tokens, roles);
  const hit = problems.find((p) => p.fgRole === 'onAltMuted');
  assert.ok(hit, 'expected onAltMuted/bgAlt to be flagged');
  assert.ok(hit.ratio < 4.5);
});

test('checkContrast passes a compliant pair silently', () => {
  const tokens = { color: { semantic: { text: '#231210', bg: '#FBF8F2' } } };
  const roles = { text: 'color.semantic.text', bg: 'color.semantic.bg' };
  const problems = checkContrast(tokens, roles).filter((p) => p.fgRole === 'text');
  assert.equal(problems.length, 0);
});
