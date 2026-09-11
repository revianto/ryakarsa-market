UC.register({
  name: 'image-text',
  description: 'Foto (dari folder brand) + judul + paragraf. Tanpa foto -> placeholder, bukan foto karangan',
  required: ['title'],
  optional: ['image', 'imageAlt', 'body', 'bg', 'link'],
  render(s, ctx) {
    return `
      <div style="flex:1;display:flex;flex-direction:column;gap:calc(40 * var(--u));min-height:0">
        <div class="ss-frame" style="flex:1;min-height:0">${UC.image(ctx, s.image, s.imageAlt)}</div>
        <h2 class="ss-title" style="flex:none">${UC.esc(s.title)}</h2>
        ${s.body ? `<p class="ss-caption" style="flex:none">${UC.esc(s.body)}</p>` : ''}
      </div>`;
  },
});
