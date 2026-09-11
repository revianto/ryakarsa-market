UC.register({
  name: 'title-body',
  description: 'Pola paling umum — judul, garis rambut, paragraf',
  required: ['title'],
  optional: ['body', 'bg', 'link'],
  render(s) {
    return `
      <div style="display:flex;flex-direction:column;gap:calc(44 * var(--u))">
        <h2 class="ss-title">${UC.esc(s.title)}</h2>
        ${s.body ? `<hr class="ss-hair"><p class="ss-text">${UC.esc(s.body)}</p>` : ''}
      </div>`;
  },
});
