// Mosaic grid: N posts that together form one continuous image in the profile
// grid ("puzzle feed"). Distinct from `span` (bridge/word-split), which cuts
// ONE row horizontally — mosaic cuts a 2D grid (rows x cols) and adds the
// bleed-slice technique documented in content-post/references/platform-rules.md
// (Instagram's 1-3px grid gutter would otherwise clip letters like M/N/O).

export const MOSAIC_FORMATS = {
  'ig-mosaic-3x3':        { cols: 3, rows: 3, cellWidth: 1080, cellHeight: 1350, margin: 80, safeTop: 0, safeBottom: 150, safeRight: 0, scale: 2 },
  'ig-mosaic-pinned-1x3': { cols: 3, rows: 1, cellWidth: 1080, cellHeight: 1350, margin: 80, safeTop: 0, safeBottom: 150, safeRight: 0, scale: 2 },
};

export function getMosaicFormat(name) {
  const spec = MOSAIC_FORMATS[name];
  if (!spec) throw new Error(`Unknown mosaic format "${name}". Known: ${Object.keys(MOSAIC_FORMATS).join(', ')}`);
  return {
    name, ...spec,
    width: spec.cols * spec.cellWidth,
    height: spec.rows * spec.cellHeight,
    maxCells: spec.cols * spec.rows,
  };
}

// The single-post format each cell is rendered as (chrome, safe zones, type
// scale all behave exactly like a normal ig-feed post — a mosaic cell IS a
// normal post, just placed at a specific grid position).
export function cellFormat(mosaic) {
  return {
    name: `${mosaic.name}-cell`, width: mosaic.cellWidth, height: mosaic.cellHeight,
    margin: mosaic.margin, safeTop: mosaic.safeTop, safeBottom: mosaic.safeBottom,
    safeRight: mosaic.safeRight, scale: mosaic.scale, maxSlides: 1,
  };
}

export function cellPosition(index, mosaic) {
  const row = Math.floor(index / mosaic.cols);
  const col = index % mosaic.cols;
  return { row, col, x: col * mosaic.cellWidth, y: row * mosaic.cellHeight };
}

// Reading order is top-left -> bottom-right (how a human writes the deck and
// how the grid is READ). Instagram always inserts new posts at the top-left,
// so UPLOADING must go bottom-right -> top-left, or the grid ends up mirrored.
// This just reverses the reading-order index list; it doesn't reorder pixels.
export function uploadOrder(count) {
  return Array.from({ length: count }, (_, i) => count - 1 - i);
}

// Bleed crop per column: 1160px wide (cellWidth + 80) so a letter/shape that
// touches a cell's vertical edge doesn't get clipped by Instagram's 1-3px grid
// gutter. Edge columns get the full 80px extra on their one open side; interior
// columns split it 40/40. Only horizontal — the documented technique (and
// Instagram's cover-position dragger) is horizontal-only, so no vertical bleed.
export function bleedX(col, mosaic) {
  const overlap = 80;
  const master = mosaic.cols * mosaic.cellWidth;
  if (col === 0) return 0;
  if (col === mosaic.cols - 1) return master - (mosaic.cellWidth + overlap);
  return col * mosaic.cellWidth - overlap / 2;
}
