UC.register({
  name: 'closing',
  description: 'Slide terakhir — satu kalimat, satu tombol. Satu-satunya pola rata tengah & ber-CTA',
  required: ['title', 'cta'],
  optional: ['caption', 'bg'],
  cta: true,
  render(s) {
    return `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:calc(48 * var(--u))">
        <h2 class="ss-title">${UC.esc(s.title)}</h2>
        <div class="ss-hair-short"></div>
        <span class="ss-cta">${UC.esc(s.cta)}</span>
        ${s.caption ? `<span class="ss-caption">${UC.esc(s.caption)}</span>` : ''}
      </div>`;
  },
});
