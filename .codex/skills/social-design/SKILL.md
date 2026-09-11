---
name: social-design
description: Design system khusus post sosial media dengan engine render lokal per brand — naskah (deck JSON) + pola layout reusable + token brand dari design-tokens, dirender jadi PNG di dimensi pixel persis tiap platform (carousel & feed Instagram, Story/Reels cover, thumbnail YouTube & Shorts, cover TikTok, gambar X/Threads, status WhatsApp). Tiap brand punya folder di studio (git privat) sehingga warna, font, koordinat elemen, pola, dan riwayat konten tersimpan lintas sesi — tidak mulai dari nol. Bisa mengikuti referensi visual yang dikirim user (screenshot/mockup/link) — struktur & layout referensi dinilai dan direplikasi sebagai pola baru, tapi warna/font tetap dari token brand sendiri, bukan ditiru dari referensi. Dua mode — "ide saja" (konsep layout, teks per slide) atau "generate langsung" (render PNG siap upload). Validator otomatis menolak deck yang melanggar batas kata, jumlah slide, atau kontras sebelum render. Gunakan saat user minta "desain post IG", "bikin carousel", "template feed", "thumbnail YouTube", "cover Reels/TikTok", "gambar untuk post ini", "design system sosmed", "bikin visualnya sekalian", "generate post-nya", "render deck", "tambah brand baru untuk konten", "bikin kayak referensi/contoh ini". Bukan untuk menulis caption/script (content-post), bukan untuk identitas visual brand dari nol (design-brief/design-tokens di pack ryakarsa), dan bukan untuk desain halaman web.
---

# Social Design

Post sosmed yang **konsisten per brand** dan **pas dengan platform** — dibuat lewat engine render lokal, supaya post ke-50 terlihat satu keluarga dengan post pertama, dan tidak ada yang terpotong, terlalu kecil dibaca, atau tertutup tombol platform.

Bahasa: ikuti bahasa user.

**Aturan emas:** jangan pernah mengarang foto produk, foto pelanggan, logo klien, testimoni, atau angka. Pola `image-text` otomatis menampilkan placeholder `[FOTO — ...]` kalau tidak ada foto; pola `stat` dan `quote` hanya untuk angka/kutipan yang benar-benar ada sumbernya. Ilustrasi/tekstur/ornamen boleh digenerate (lihat Aset); foto yang mewakili produk atau orang sungguhan tidak boleh.

## Arsitektur: engine vs. studio

| | Lokasi | Isi | Git |
|---|---|---|---|
| **Engine** (kode) | `engine/` di skill ini | CLI, validator, renderer, pola bawaan, CSS dasar | repo `ryakarsa-market` |
| **Studio** (data) | `$SOCIAL_STUDIO`, default `~/Documents/social-studio` | satu folder per brand | repo privat sendiri |

```
<studio>/brands/<brand>/
├── brand.json      wordmark, handle, design system sumber, pemetaan warna ke peran, font & bobot, aturan brand
├── tokens.css      DIGENERATE dari design-tokens — jangan edit tangan
├── brand.css       (opsional) penyesuaian gaya khusus brand ini
├── patterns/       (opsional) pola khusus brand — menimpa pola engine bernama sama
├── assets/         foto & gambar asli yang dipakai deck
├── decks/          naskah — riwayat semua konten brand ini
└── output/         PNG hasil render (gitignored, bisa dibuat ulang kapan saja)
```

Kenapa dipisah: kode engine generik untuk semua brand dan boleh publik; data brand itu milik user, harus ter-backup, dan bertahan lintas sesi.

**Perintah** (dari folder mana saja): `node <path-skill>/engine/cli.mjs <perintah>` — di bawah ditulis `social <perintah>`.

**Setup sekali** kalau `engine/node_modules` belum ada: `cd engine && npm install` (hanya `playwright-core` ~13 MB — memakai Google Chrome yang sudah terpasang, tidak mengunduh browser).

## Step 1 — Cek yang sudah ada

1. **Brand sudah punya sistem produksi sendiri di luar studio?** Beberapa brand punya engine/sistem carousel sendiri di folder marketingnya (naskah + pola + script render). **Kalau ada, pakai sistem itu** — jangan membuat brand tandingan di studio, dua sistem untuk brand yang sama pasti lama-lama berbeda. Memindahkannya ke studio adalah keputusan eksplisit user, bukan inisiatif sendiri.
2. **`social brands`** — brand-nya sudah ada di studio? Pakai. Lihat deck lamanya (`social decks <brand>`) untuk menjaga gaya konten konsisten.
3. **Feed yang sudah jalan** (produk existing) — minta screenshot beberapa post terakhir. Kalau gayanya sudah mapan, ikuti (atur lewat `brand.css`/pola brand), jangan diganti gaya baru hanya karena bisa.
4. **Teks** — dari `content-post` kalau ada. Kalau belum dan post-nya butuh banyak teks, sarankan tulis dulu di sana; desain yang menunggu copy lebih cepat daripada copy yang dipaksa masuk desain.

## Step 1b — Referensi visual dari user

Kalau user mengirim referensi (screenshot carousel kompetitor, mockup, link post orang lain, "kayak gini tapi buat produk kita") — **jangan diabaikan, tapi juga jangan ditiru mentah-mentah.** Sama seperti `design-brief`, referensi dinilai, bukan diterima atau dibuang begitu saja.

1. **Amati strukturnya, bukan gayanya**: urutan elemen, hierarki (mana yang besar/kecil, mana yang duluan dibaca), pola tata letak (teks rata kiri vs tengah, foto di mana, ada elemen menyambung antar slide atau tidak), jumlah slide dan ritmenya. **Warna dan font referensi TIDAK dipakai** — itu tugas token brand (Step 3), bukan referensi orang lain; brand yang konsisten tidak boleh berubah warna cuma karena mencontoh satu post.
2. **Cek dulu apakah pola bawaan sudah cukup mirip** (`social patterns <brand>`). Kalau strukturnya sama dengan salah satu pola yang ada (mis. referensinya "judul besar + paragraf" = `title-body`), pakai itu — jangan bikin pola baru untuk sesuatu yang sudah ada.
3. **Kalau strukturnya genuinely baru**, buat pola baru khusus brand ini (`<brand>/patterns/<nama>.js`, salin `_template.js`) yang mereplikasi *tata letak* referensi — posisi elemen, proporsi, hierarki — tapi tetap pakai kelas `base.css` dan variabel `--c-*`/`--ss-*` supaya otomatis ikut token brand. Beri vonis eksplisit ke user, seperti di `design-brief`:
   - **Cocok penuh** — struktur diambil apa adanya.
   - **Cocok sebagian** (paling sering) — sebutkan bagian mana yang diambil dan bagian mana yang sengaja tidak (mis. "layout 2 kolomnya dipakai, tapi elemen badge diskon merahnya tidak — brand ini tidak memakai warna alert untuk promo").
   - **Tidak cocok** — jelaskan kenapa (mis. referensi itu untuk format Reels 9:16, sedangkan yang diminta carousel 4:5), tawarkan pola terdekat yang ada.
4. Render satu slide contoh dengan pola baru itu dan tunjukkan ke user sebelum dipakai untuk deck penuh — pola hasil interpretasi referensi lebih sering butuh satu ronde penyesuaian dibanding pola bawaan.

## Step 2 — Tentukan mode

Tanyakan lewat **AskUserQuestion** kalau belum jelas (fallback daftar bernomor):

- **Ide saja** — konsep: format, susunan per slide (pola + teks), aset yang dibutuhkan. Bisa langsung ditulis sebagai deck JSON supaya tinggal dirender nanti.
- **Generate langsung** — PNG siap upload lewat engine. Foto produk/orang asli tetap harus disediakan user (taruh di `assets/`).

## Step 3 — Brand baru (sekali per brand)

Engine membutuhkan design system brand di skill `design-tokens` (pack `ryakarsa`). Belum ada → buat dulu lewat `design-tokens` (ekstrak dari kode/website yang sudah jalan) atau `design-brief` (dari nol). Jangan mengarang palet di sini.

```bash
social init-brand rebrew --design-system rebrew --wordmark "ReBrew" --handle "@rebrew"
```

`init-brand` menebak pemetaan warna brand ke **peran** yang dipakai semua pola (`bg`, `bgAlt`, `text`, `heading`, `accent`, `accentText`, `accentOnAlt`, `onAlt`, `onAltMuted`, `ctaBg`, `ctaText`, font `display`/`body`), membuat `tokens.css`, lalu **mengecek kontras WCAG tiap pasangan yang benar-benar dirender bersama**. Tebakan itu titik awal, bukan keputusan:

- **Ada "Contrast problems"?** Wajib dibetulkan sebelum render. Ganti pemetaan peran di `brand.json` ke warna lain **dari design system yang sama** (hitung kontrasnya, jangan dikira), lalu `social tokens <brand>`. Contoh nyata: teks sekunder di latar gelap tertebak ke warna 2.76:1 → dipetakan ulang ke warna krem lain di palet yang sama (6.12:1).
- **`accent` vs `accentText`**: aksen dekoratif (garis, bar, panel) dan aksen untuk teks (angka, link) sengaja dipisah — warna aksen yang cantik untuk garis sering terlalu pucat untuk teks.
- **Font**: cek `fonts` di `brand.json` — bobot yang dicantumkan harus benar-benar tersedia di Google Fonts untuk family itu.
- **`handle`**: jangan diisi tebakan. Kosong = tidak tampil.
- **`rules`**: `maxWords` (default 45/slide) dan `bannedChars` (mis. brand yang melarang tanda pisah panjang).

Ganti design system di `design-tokens` kapan saja → `social tokens <brand>` → `social render <brand> --all`: semua deck lama ikut berganti warna.

## Step 4 — Tulis deck

```bash
social patterns rebrew     # pola yang tersedia untuk brand ini + field wajib tiap pola
```

Deck = `<studio>/brands/<brand>/decks/<nama>.json`:

```json
{
  "format": "ig-carousel",
  "slides": [
    { "pattern": "cover", "title": "Kail: sebut masalahnya, bukan fiturnya.", "subtitle": "..." },
    { "pattern": "title-body", "title": "...", "body": "..." },
    { "pattern": "numbered", "title": "...", "items": [{ "title": "...", "text": "..." }] },
    { "pattern": "bridge", "bg": "alt", "title": "...", "body": "..." },
    { "pattern": "closing", "title": "...", "cta": "Mulai Sekarang" }
  ]
}
```

Pola bawaan — teks murni: `cover`, `title-body`, `numbered`, `stat`, `quote`, `closing` (satu-satunya ber-CTA), `bridge` (dua slide menyambung). Kombinasi teks+gambar: `image-text` (foto & teks di area terpisah, bertumpuk vertikal — untuk foto yang perlu dilihat utuh) dan `photo` (foto full-bleed 1 kanvas penuh dengan teks **menimpa** di atasnya lewat scrim gradasi — untuk cover/kutipan gaya editorial). Field umum: `bg: "alt"` untuk ground kontras, `link` untuk tautan bergaris di kanan bawah, `image` (path relatif ke folder brand, mis. `assets/foto.jpg`).

**Pola `photo` butuh `chromeOn: "light"|"dark"`** — keterbacaan wordmark/handle di atas foto bergantung pada foto itu sendiri, bukan token brand untuk ground ini, jadi validator memperingatkan kalau field ini kosong. Pilih berdasar area foto yang ditempati header (kiri-atas): foto gelap di situ → `"light"` (chrome jadi putih); foto terang → `"dark"`.

Susun urutan slide dengan ketukan narasi di `content-post` (kail → bukti masalah → cerita → cara kerja → bukti pilar → jaminan → ajakan).

## Step 5 — Validasi & render

```bash
social render rebrew seduh-v60      # validasi dulu otomatis; gagal validasi = tidak ada yang dirender
social render rebrew --all          # render ulang semua deck brand ini
```

Skala default per format (2x untuk Instagram, 1x untuk thumbnail YouTube yang dibatasi 2 MB); timpa dengan `--scale 1|2|3` kalau perlu. Hasil ke `<brand>/output/<deck>/slide-NN.png` — PNG lama dari render sebelumnya dibersihkan dulu.

**Lihat hasilnya sebelum diserahkan** — minimal slide pertama, terakhir, dan setiap pasangan `bridge` (Read tool pada PNG). Engine menjamin ukuran, font termuat, dan gambar termuat; yang tidak bisa dijamin engine: teks terlalu panjang yang tetap lolos batas kata tapi meluap, dan apakah desainnya memang bagus.

Setelah beres, **commit deck-nya di repo studio** — deck adalah riwayat konten brand (output tidak perlu, bisa dirender ulang).

## Yang dijaga engine otomatis vs. yang tetap harus kamu nilai

**Otomatis** (validator/renderer — gagal keras kalau dilanggar):
- Dimensi persis per format + safe zone platform (konten berhenti di atas area yang tertutup UI).
- Koordinat elemen berulang terkunci (wordmark, handle, penanda geser — hilang otomatis di slide terakhir).
- Maks kata per slide, maks slide per format, maks 2 pasangan menyambung, field wajib tiap pola, karakter terlarang brand, file gambar ada.
- Kontras tiap pasangan warna (saat `init-brand`/`tokens`).
- Font **benar-benar termuat** sebelum screenshot — kalau offline atau nama font salah, render gagal dengan pesan jelas, bukan diam-diam memakai font fallback atau teks hilang.
- Peringatan (tidak menggagalkan): lebih dari satu CTA, slide terakhir tanpa CTA.

**Tetap penilaianmu**:
- Satu titik fokus per slide; urutan narasi yang membuat orang terus menggeser.
- **Setengah harus berdiri sendiri** di pasangan `bridge`: judul di gambar kiri dan isi di gambar kanan masing-masing harus masuk akal tanpa pasangannya (pola `bridge` sudah menjaga panel penyeberang tanpa teks dan tanpa gradasi).
- Crop grid Instagram 3:4 — kail slide pertama di area tengah.
- Kejujuran isi: angka dan kutipan harus ada sumbernya.

Dimensi & aturan platform sumbernya satu: `../content-post/references/platform-rules.md` (bertanggal — cek ulang kalau sudah lama). Kalau platform mengubah ukuran, perbarui file itu **dan** `engine/lib/formats.mjs`.

## Menambah pola

- **Dari referensi visual user** → lihat Step 1b. Ini jalur paling sering untuk pola baru — user jarang minta pola abstrak, biasanya mengirim contoh.
- **Khusus satu brand** → `<brand>/patterns/<nama>.js` (salin `engine/patterns/_template.js`). Bernama sama dengan pola engine = menimpanya untuk brand itu saja.
- **Berguna untuk semua brand** → `engine/patterns/`, lalu sync repo `ryakarsa-market`.
- Aturan pola: pakai kelas di `engine/base.css` dan variabel warna `--c-*` — **jangan hard-code warna**, supaya token brand apapun berlaku (kecuali kasus seperti scrim foto di pola `photo`, yang didokumentasikan eksplisit alasannya). Deklarasikan `required` (dicek validator), `span: 2` untuk pola menyambung, `cta: true` untuk pola ajakan.
- Jangan pernah menulis HTML satu-off untuk satu carousel tertentu — kalau terasa perlu, itu tanda ada pola yang belum ada.

## Teknik di luar engine

**Mosaic grid profil** (satu gambar besar dipecah 3×2 / 1×3 post): belum didukung engine. Ikuti aturan di `platform-rules.md` bagian Instagram (kanvas master, bleed slicing 1160px, urutan upload mundur dari kanan bawah) — kesalahan urutan upload tidak bisa diperbaiki tanpa menghapus post.

**Render satu file HTML lepas / tanpa Node** (mis. skill dipakai di lingkungan tanpa Node): `scripts/render_post.py` — Python + Chrome CLI, tanpa install apapun.

```bash
python3 scripts/render_post.py post.html out.png --size 1080x1350 --scale 2
```

Kelemahannya dibanding engine: menunggu font berbasis waktu (bukan verifikasi), tidak ada validator, tidak ada token brand/koordinat terkunci. Jangan dipakai untuk konten rutin sebuah brand.

## Aset visual

- **Ilustrasi, tekstur, ornamen, latar** — boleh digenerate lewat MCP Recraft (konektor OAuth lebih dulu; `recraft-api` hanya cadangan saat kredit habis), sesuai tingkat ornamen brand. Simpan ke `<brand>/assets/`.
- **Foto produk, orang, screenshot aplikasi** — tidak digenerate; placeholder + minta user.
- **Logo transparan** (PNG/SVG tanpa kotak latar).
- **Cek hasil generate** sebelum dipakai: ukuran, format file sesungguhnya, kecocokan gaya.

## Handoff

- **Teks/caption post-nya**: `content-post`.
- **Warna & font brand belum ada**: `design-brief` → `design-tokens` di pack `ryakarsa`.
- **Post apa saja yang perlu dibuat & kapan**: `campaign-plan`.
- **Brand voice untuk teks di dalam gambar**: `brand-kit`.
