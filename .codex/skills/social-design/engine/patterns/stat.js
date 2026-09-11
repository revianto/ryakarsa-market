UC.register({
  name: 'stat',
  description: 'Satu angka besar + label — HANYA angka nyata yang ada sumbernya',
  required: ['value', 'label'],
  optional: ['body', 'bg', 'link'],
  render(s) {
    return `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:calc(28 * var(--u))">
        <span class="ss-num" style="font-size:calc(200 * var(--u))">${UC.esc(s.value)}</span>
        <span class="ss-ftitle">${UC.esc(s.label)}</span>
        ${s.body ? `<hr class="ss-hair"><p class="ss-text">${UC.esc(s.body)}</p>` : ''}
      </div>`;
  },
});
