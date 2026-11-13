UC.register({
  name: 'closing',
  description: 'Slide terakhir — satu kalimat, satu tombol. Layout F-pattern: judul lebar kiri atas, caption lebih pendek di bawahnya, CTA di dasar kiri. Satu-satunya pola ber-CTA',
  required: ['title', 'cta'],
  optional: ['caption', 'bg'],
  cta: true,
  render(s) {
    return `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-start;align-items:flex-start;text-align:left;gap:calc(48 * var(--u))">
        <h2 class="ss-title">${UC.esc(s.title)}</h2>
        <div class="ss-hair-short"></div>
        <span class="ss-cta" style="margin-top:auto">${UC.esc(s.cta)}</span>
        ${s.caption ? `<span class="ss-caption" style="max-width:68%">${UC.esc(s.caption)}</span>` : ''}
      </div>`;
  },
});
