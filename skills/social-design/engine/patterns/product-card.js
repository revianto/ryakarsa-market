/* Kartu produk ringkas: foto di atas, label kategori kecil, judul, deskripsi
   pendek, lalu baris meta (spesifikasi/keunggulan singkat dengan bullet).
   Diturunkan dari referensi user (grid produk toko tanaman) — struktur diambil,
   warna tetap dari token brand. Perluasan kecil dari "image-text": tambahan
   baris meta yang tidak ada di sana. */
UC.register({
  name: 'product-card',
  description: 'Foto produk + label kategori + judul + desc pendek + baris meta (spesifikasi singkat)',
  required: ['title'],
  optional: ['image', 'imageAlt', 'label', 'body', 'meta', 'bg', 'link'],
  render(s, ctx) {
    const metaRows = (s.meta || []).map((m) => `
      <div style="display:flex;align-items:center;gap:calc(14 * var(--u))">
        <span style="width:calc(20 * var(--u));height:calc(20 * var(--u));border-radius:50%;
                     border:calc(2 * var(--u)) solid var(--c-accent);flex:none"></span>
        <span class="ss-caption">${UC.esc(m)}</span>
      </div>`).join('');
    return `
      <div style="display:flex;flex-direction:column;gap:calc(32 * var(--u));min-height:0;height:100%">
        <div class="ss-frame" style="flex:1;min-height:0">${UC.image(ctx, s.image, s.imageAlt)}</div>
        <div style="display:flex;flex-direction:column;gap:calc(16 * var(--u));flex:none">
          ${s.label ? `<span class="ss-label" style="color:var(--c-accent-text)">${UC.esc(s.label)}</span>` : ''}
          <h3 class="ss-ftitle">${UC.esc(s.title)}</h3>
          ${s.body ? `<p class="ss-caption">${UC.esc(s.body)}</p>` : ''}
          ${metaRows ? `<div style="display:flex;flex-direction:column;gap:calc(10 * var(--u));margin-top:calc(6 * var(--u))">${metaRows}</div>` : ''}
        </div>
      </div>`;
  },
});
