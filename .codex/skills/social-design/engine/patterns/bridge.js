/* Connected layout across TWO output images. A panel crosses the seam at x = width;
   the title lives entirely on the left image and the body entirely on the right,
   so each half still makes sense on its own ("setengah harus berdiri sendiri").
   The crossing panel carries no text (text cut at the seam reads as broken) and no
   gradient (each image is compressed separately, so a seam gradient bands). */
UC.register({
  name: 'bridge',
  description: 'Dua slide menyambung: panel menyeberangi garis potong, judul di kiri, isi di kanan',
  required: ['title'],
  optional: ['body', 'bg'],
  span: 2,
  render(s, ctx) {
    const f = ctx.format;
    const u = f.width / 1080;
    // Same y as a title in the flow patterns: pad-top + header row (~31u) + header gap (56u),
    // so the title doesn't jump between slides of one carousel.
    const top = Math.max(f.margin, f.safeTop) + 87 * u;
    const panelLeft = f.width - 300 * u;  // 300u visible on the left image
    const panelWidth = 600 * u;           // 300u visible on the right image (>= 120px each side)
    return `
      <div style="position:absolute;left:${f.margin}px;top:${top}px;width:${f.width - f.margin * 2 - 320 * u}px">
        <h2 class="ss-title">${UC.esc(s.title)}</h2>
      </div>
      <div style="position:absolute;left:${panelLeft}px;top:${top + 380 * u}px;width:${panelWidth}px;height:${420 * u}px;
                  background:var(--c-accent)"></div>
      <div style="position:absolute;left:${f.width + 320 * u}px;top:${top}px;width:${f.width - f.margin - 320 * u}px">
        ${s.body ? `<p class="ss-text">${UC.esc(s.body)}</p>` : ''}
      </div>`;
  },
});
