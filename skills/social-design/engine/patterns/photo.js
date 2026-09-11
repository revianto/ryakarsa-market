/* Foto full-bleed dengan teks menimpa di atasnya (cover carousel, kutipan di atas foto).
   Beda dari "image-text" (foto & teks di area terpisah, tidak tumpang tindih) — pola ini
   untuk saat fotonya SENDIRI yang jadi latar penuh.

   Scrim gradasi hitam/putih transparan sengaja HARD-CODE (bukan token brand): keterbacaan
   teks di atas foto bergantung pada foto itu sendiri, bukan warna brand — scrim gelap+teks
   terang (atau sebaliknya) adalah konvensi yang bekerja independen dari foto & brand apapun.
   Ini pengecualian yang disengaja terhadap aturan "jangan hard-code warna". */
UC.register({
  name: 'photo',
  description: 'Foto penuh 1 kanvas dengan teks menimpa (scrim gradasi) — cover atau kutipan di atas foto',
  required: ['image'],
  optional: ['title', 'body', 'imageAlt', 'overlayPosition', 'scrim', 'link'],
  render(s, ctx) {
    const pos = s.overlayPosition === 'top' ? 'top' : 'bottom'; // default bottom, paling umum utk cover
    const scrim = s.scrim === 'light'
      ? 'linear-gradient(to ' + pos + ', rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 55%, rgba(255,255,255,0.92) 100%)'
      : 'linear-gradient(to ' + pos + ', rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.88) 100%)';
    const textColor = s.scrim === 'light' ? 'var(--ss-text)' : '#FFFFFF';
    const align = pos === 'top' ? 'flex-start' : 'flex-end';
    return `
      <div style="position:absolute;inset:0;z-index:0">${UC.image(ctx, s.image, s.imageAlt)}</div>
      <div style="position:absolute;inset:0;z-index:1;background:${scrim}"></div>
      <div style="position:relative;z-index:2;flex:1;display:flex;flex-direction:column;
                  justify-content:${align};gap:calc(24 * var(--u));color:${textColor}">
        ${s.title ? `<h2 class="ss-title" style="color:${textColor}">${UC.esc(s.title)}</h2>` : ''}
        ${s.body ? `<p class="ss-text" style="color:${textColor};opacity:0.92">${UC.esc(s.body)}</p>` : ''}
      </div>`;
  },
});
