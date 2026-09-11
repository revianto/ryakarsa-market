// Build the Google Fonts URL for a brand and describe what must be verified as
// loaded before a screenshot.
//
// brand.json fonts: [{ "family": "Fraunces", "weights": [700, 800], "italic": [400] }]

export function googleFontsUrl(fonts = []) {
  if (!fonts.length) return null;
  const families = fonts.map((f) => {
    const name = f.family.trim().replace(/ /g, '+');
    const upright = [...new Set((f.weights || [400]).map(Number))].sort((a, b) => a - b);
    const italic = [...new Set((f.italic || []).map(Number))].sort((a, b) => a - b);
    if (italic.length) {
      // Google requires tuples sorted: all ital=0 first, then ital=1.
      const tuples = [...upright.map((w) => `0,${w}`), ...italic.map((w) => `1,${w}`)];
      return `family=${name}:ital,wght@${tuples.join(';')}`;
    }
    return `family=${name}:wght@${upright.join(';')}`;
  });
  // display=block: while loading, text is invisible — that's fine because we
  // verify load before capture; with swap a fallback font could slip into a PNG.
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=block`;
}

// Every (family, weight, style) combination the renderer must confirm is loaded.
export function requiredFaces(fonts = []) {
  const faces = [];
  for (const f of fonts) {
    for (const w of f.weights || [400]) faces.push({ family: f.family, weight: Number(w), style: 'normal' });
    for (const w of f.italic || []) faces.push({ family: f.family, weight: Number(w), style: 'italic' });
  }
  return faces;
}
