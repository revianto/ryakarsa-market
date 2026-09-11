---
name: social-design
description: Design system khusus post sosial media — template visual reusable per format (carousel & feed Instagram, Story/Reels cover, thumbnail YouTube & Shorts, cover TikTok, gambar X/Threads, status WhatsApp) yang memakai warna & font brand, di dimensi pixel persis tiap platform. Dua mode — "ide saja" (konsep layout, teks per slide, arah visual) atau "generate langsung" (render jadi file PNG siap upload lewat Chrome headless). Untuk produk yang feed-nya sudah punya gaya mapan, gaya itu diekstrak dan diikuti. Gunakan saat user minta "desain post IG", "bikin carousel", "template feed", "thumbnail YouTube", "cover Reels/TikTok", "gambar untuk post ini", "design system sosmed", "bikin visualnya sekalian", "generate post-nya". Bukan untuk menulis caption/script (content-post), bukan untuk identitas visual brand dari nol (design-brief/design-tokens di pack ryakarsa), dan bukan untuk desain halaman web.
---

# Social Design

Template visual post yang **konsisten dengan brand** dan **pas dengan platform** — supaya setiap post terlihat dari brand yang sama, dan tidak ada yang terpotong, terlalu kecil dibaca, atau tertutup tombol platform.

Bahasa: ikuti bahasa user.

**Aturan emas:** jangan pernah mengarang foto produk, foto pelanggan, logo klien, atau screenshot aplikasi. Kalau post butuh foto asli, pakai placeholder yang jelas (kotak berlabel `[FOTO PRODUK — ...]`) dan sebutkan di akhir. Ilustrasi/tekstur/ornamen boleh digenerate (lihat Aset di bawah); foto yang mewakili produk atau orang sungguhan tidak boleh.

## Step 1 — Kumpulkan sumber

- **Warna & font brand** — cek skill `design-tokens` (`manage_library.py list`) untuk design system produk ini, atau token di codebase-nya (`tailwind.config.*`, CSS variables). Jangan mengarang palet baru kalau sumbernya ada.
- **Feed yang sudah jalan** *(produk existing)* — minta link akun atau screenshot beberapa post terakhir. **Kalau feed-nya sudah punya gaya mapan, ekstrak dan ikuti gaya itu** (tata letak, perlakuan foto, gaya tipografi, elemen berulang) — jangan diganti gaya baru hanya karena bisa. Kalau ada yang lemah (teks terlalu kecil, tidak konsisten antar post), sampaikan sebagai saran terpisah.
- **`BRAND-KIT.md`** → tone untuk teks di dalam gambar.
- **Teks post** — dari `content-post` kalau ada (teks per slide carousel, judul thumbnail). Kalau belum ada dan post-nya butuh banyak teks, sarankan tulis dulu lewat `content-post` — desain yang menunggu copy lebih cepat daripada copy yang dipaksa masuk desain.

## Step 2 — Tentukan mode

Tanyakan lewat **AskUserQuestion** kalau belum jelas (fallback daftar bernomor):

- **Ide saja** — keluaran berupa konsep: format & dimensi, susunan per slide (teks + posisi + arah visual), palet yang dipakai, dan aset apa yang dibutuhkan. Cocok kalau user mau mendesainnya sendiri di Canva/Figma, atau baru mengeksplorasi arah.
- **Generate langsung** — keluaran berupa **file PNG di dimensi persis, siap upload**, dirender dari template HTML lewat `scripts/render_post.py`. Batasnya: teks, bentuk, warna, tipografi, dan ilustrasi yang digenerate bisa langsung jadi; **foto produk/orang asli tetap perlu disediakan user.**

## Step 3 — Aturan desain post

Baca dimensi & batas dari `../content-post/references/platform-rules.md` (satu sumber untuk seluruh pack — jangan tulis ulang angkanya di sini). Cek tanggal verifikasinya seperti yang dijelaskan di file itu.

- **Dimensi persis** — `html` dan `body` template di-set tepat ke ukuran platform (mis. 1080×1350), `overflow: hidden`.
- **Safe zone** — Reels/TikTok/Shorts/Story: jangan taruh teks penting di ~20% bawah, ~10% kanan, ~10% atas (tertutup UI platform).
- **Crop grid Instagram** — grid profil tampil 3:4, post 4:5 hanya terlihat ~1012×1350 di tengah. Judul slide pertama carousel wajib di area tengah.
- **Terbaca di HP** — pada kanvas lebar 1080px, teks isi minimal ~32px, judul 60px+. Kontras teks vs latar minimal 4.5:1 (hitung dari hex, jangan dikira).
- **Satu titik fokus per slide** — satu judul, satu ide. Slide yang berisi segalanya tidak terbaca di feed yang di-scroll cepat.
- **Carousel = satu sistem** — posisi judul, margin, dan elemen berulang sama di semua slide; slide pertama beda (hook), slide terakhir beda (CTA), sisanya konsisten.
- **Token brand sebagai CSS custom property** di atas template (`--brand-primary`, `--font-display`, dst.), supaya satu template bisa dipakai ulang atau ditukar brand-nya.
- **Slot teks bertanda** — elemen yang isinya berganti tiap post diberi `data-slot="headline"`, `data-slot="body"`, dst., supaya teks baru tinggal diganti tanpa membongkar layout.
- **Font** — muat dari Google Fonts (`<link>` di `<head>`) dengan fallback yang jelas. Script render sudah memberi waktu font termuat; tanpa itu, teks bisa **hilang total** dari PNG.

## Step 4 — Library template

Template yang layak dipakai ulang disimpan di `library/` supaya post berikutnya tidak mulai dari nol. **Cek library dulu** sebelum membuat template baru (`list --brand <produk> --format <format>`).

```bash
# Daftarkan template (file HTML-nya tulis dulu ke library/<format>/<nama>.html)
python scripts/manage_library.py add --name rebrew-carousel-cover --brand rebrew \
  --format ig-carousel --size 1080x1350 --file ig-carousel/rebrew-carousel-cover.html \
  --description "Cover carousel edukasi, judul besar tengah, aksen caramel" --tags cover,edukasi

python scripts/manage_library.py list --brand rebrew              # template milik satu brand
python scripts/manage_library.py list --format yt-thumbnail
python scripts/manage_library.py get --name rebrew-carousel-cover
python scripts/manage_library.py update --name ... --description "..."
python scripts/manage_library.py remove --name ...                 # konfirmasi dulu ke user
```

Format standar: `ig-feed`, `ig-carousel`, `ig-story`, `ig-reels-cover`, `tiktok-cover`, `yt-thumbnail`, `yt-shorts-cover`, `x-image`, `threads-image`, `wa-status`. **Beri prefix nama brand** di nama template (`rebrew-...`, `undangoo-...`) — library ini menampung template banyak brand sekaligus.

Jangan edit `library/index.json` dengan tangan — selalu lewat script. File HTML template boleh diedit langsung.

## Step 5 — Render (mode generate langsung)

1. Salin template ke folder kerja, isi slot teks, simpan tiap slide sebagai file HTML terpisah.
2. Render:
   ```bash
   python scripts/render_post.py slide1.html slide2.html slide3.html --out-dir social/2026-09-11-promo --size 1080x1350
   ```
   Script memverifikasi ukuran PNG hasilnya — kalau tidak persis, dia gagal dengan pesan jelas, bukan diam-diam menghasilkan file yang salah ukuran.
3. **Lihat hasilnya sebelum diserahkan** — buka minimal slide pertama dan terakhir (Read tool pada file PNG). Ukuran yang benar tidak menjamin isinya benar: font bisa gagal termuat, teks bisa meluap keluar area, gambar eksternal bisa gagal dimuat. Periksa, perbaiki, render ulang.
4. Simpan hasil ke `social/<YYYY-MM-DD>-<topik>/` di project (atau path yang user sebut). Kalau user ingin melihat semua slide berdampingan, boleh sekalian publish satu Artifact pratinjau — tapi file PNG tetap jadi hasil utama karena itulah yang diupload.

Kalau Chrome tidak terpasang, script berhenti dengan pesan jelas — tawarkan mode "ide saja" sebagai gantinya.

## Aset visual

- **Ilustrasi, tekstur, ornamen, latar** — boleh digenerate lewat MCP Recraft kalau terpasang (pakai konektor OAuth Recraft lebih dulu; `recraft-api` hanya cadangan saat kreditnya habis). Sesuaikan gaya dengan tingkat ornamen brand-nya (polos/sedang/kaya — lihat `design-brief` kalau pernah dibuat).
- **Foto produk, orang, screenshot aplikasi** — tidak digenerate. Placeholder + minta user menyediakan.
- **Cek hasil generate sebelum dipakai** — ukuran, format file sesungguhnya (kadang hasil generate bukan format yang namanya klaim), dan kecocokan gaya.

## Handoff

- **Teks/caption post-nya**: `content-post`.
- **Warna & font brand belum ada**: `design-brief` → `design-tokens` di pack `ryakarsa`.
- **Post apa saja yang perlu dibuat & kapan**: `campaign-plan`.
- **Brand voice untuk teks di dalam gambar**: `brand-kit`.
