UC.register({
  name: 'cover',
  description: 'Slide pertama / kail — judul besar, opsional subjudul',
  required: ['title'],
  optional: ['subtitle', 'bg', 'link'],
  render(s) {
    return `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:calc(40 * var(--u))">
        <h1 class="ss-cover">${UC.esc(s.title)}</h1>
        ${s.subtitle ? `<div class="ss-hair-short"></div><p class="ss-text">${UC.esc(s.subtitle)}</p>` : ''}
      </div>`;
  },
});
