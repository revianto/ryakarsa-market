/* Satu kata dipecah huruf/suku katanya rata di beberapa slide sekaligus (mis.
   "N" / "E" / "W"), murni tipografi tanpa foto atau panel warna — beda dari
   "bridge" yang menyambungkan panel/foto. span disengaja 3 (bukan 2) karena
   referensi asalnya memang pecahan 3 kolom; pola lain boleh punya span
   berapa pun, mesin core.js/canvasVars sudah generik untuk N kolom. */
UC.register({
  name: 'word-split',
  description: 'Kata besar dipecah rata ke beberapa slide sekaligus (mis. "N"/"E"/"W") — murni tipografi',
  required: ['letters'],
  optional: ['bg'],
  span: 3,
  render(s, ctx) {
    const f = ctx.format;
    const cells = s.letters.slice(0, 3);
    return cells.map((letter, i) => `
      <div style="position:absolute;left:${i * f.width}px;top:0;width:${f.width}px;height:${f.height}px;
                  display:flex;align-items:center;justify-content:center">
        <span class="ss-cover" style="font-size:calc(220 * var(--u));line-height:1">${UC.esc(letter)}</span>
      </div>`).join('');
  },
});
