UC.register({
  name: 'numbered',
  description: 'Daftar bernomor 2-4 poin (cara kerja, langkah) — hanya kalau isinya memang berurutan',
  required: ['title', 'items'],
  optional: ['bg', 'link'],
  render(s) {
    const rows = s.items.map((it, i) => {
      const t = typeof it === 'string' ? { title: it } : it;
      return `
        <div style="display:grid;grid-template-columns:calc(96 * var(--u)) 1fr;gap:calc(28 * var(--u));align-items:start;
                    padding:calc(30 * var(--u)) 0;border-top:calc(2 * var(--u)) solid var(--c-hair)">
          <span class="ss-num" style="font-size:calc(64 * var(--u))">${String(i + 1).padStart(2, '0')}</span>
          <div style="display:flex;flex-direction:column;gap:calc(10 * var(--u))">
            <span class="ss-ftitle">${UC.esc(t.title)}</span>
            ${t.text ? `<span class="ss-caption">${UC.esc(t.text)}</span>` : ''}
          </div>
        </div>`;
    }).join('');
    return `<h2 class="ss-title" style="margin-bottom:calc(40 * var(--u))">${UC.esc(s.title)}</h2><div>${rows}</div>`;
  },
});
