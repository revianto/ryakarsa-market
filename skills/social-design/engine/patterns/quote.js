UC.register({
  name: 'quote',
  description: 'Kutipan/testimoni — HANYA kutipan asli dengan sumber yang jelas',
  required: ['quote'],
  optional: ['attribution', 'bg', 'link'],
  render(s) {
    return `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:calc(40 * var(--u))">
        <span class="ss-num" style="font-size:calc(160 * var(--u));height:calc(90 * var(--u))">&ldquo;</span>
        <p class="ss-italic">${UC.esc(s.quote)}</p>
        ${s.attribution ? `<div class="ss-hair-short"></div><span class="ss-label">${UC.esc(s.attribution)}</span>` : ''}
      </div>`;
  },
});
