---
name: brand-kit
description: Susun brand kit sebuah produk — nama & tagline, positioning, brand voice (sifat + contoh kalimat DO/DON'T), glosarium kata, key messaging, dan value proposition per persona — ke BRAND-KIT.md yang jadi sumber tunggal untuk semua skill marketing lain. Bekerja untuk produk BARU maupun produk yang SUDAH JADI dan tayang (mode extract — mendokumentasikan brand yang sudah ada dari website/app/sosmed yang live, bukan mengarang brand baru). Gunakan saat user minta "buat brand kit", "susun brand voice", "tentukan tagline", "cara ngomong brand kita gimana", "key message produk ini apa", "rapikan identitas brand", "brand guideline untuk tim konten", atau sebelum bikin konten/kampanye untuk produk yang belum punya panduan brand tertulis. Bukan untuk identitas VISUAL (warna/font/layout — itu design-brief/design-tokens di pack ryakarsa), bukan untuk konten per platform (content-post), dan bukan untuk rencana kampanye (campaign-plan).
---

# Brand Kit

Susun satu dokumen yang menjawab: **produk ini siapa, bicara dengan cara apa, dan pesan apa yang terus diulang** — supaya setiap post, caption, landing page, dan pesan WhatsApp terdengar dari brand yang sama, siapapun yang menulisnya.

`BRAND-KIT.md` adalah **hub** pack `ryakarsa-market`: `campaign-plan`, `content-post`, `landing-copy`, dan `social-design` membacanya sebagai input utama.

Bahasa: ikuti bahasa user dan bahasa produknya.

**Aturan emas:** jangan pernah mengarang klaim, angka, testimoni, penghargaan, atau jumlah pengguna ("dipercaya 10.000+ pasangan", "#1 di Indonesia"). Kalau belum ada datanya, tulis sebagai placeholder yang jelas — `[angka pengguna — isi dari data asli]` — dan masukkan ke Pertanyaan Terbuka. Brand kit yang berisi klaim karangan akan menyebar ke semua konten turunannya.

## Step 1 — Kumpulkan sumber

Produk tidak harus dibuat lewat `ryakarsa`. Cari yang tersedia, dari mana saja:

| Sumber | Contoh | Yang diambil |
|---|---|---|
| **Produk yang sudah jalan** | URL live (landing, about, pricing), codebase lokal (README, copy di komponen halaman), akun sosmed yang aktif | Copy yang **benar-benar tayang**: tagline, headline, cara menyebut fitur, harga, nada bicara |
| **Materi dari user** | Logo, brand guideline, deck, screenshot, contoh post lama, pesan WA ke pelanggan | Aturan resmi yang sudah diputuskan, pola yang sudah terbukti jalan |
| **Folder marketing / wiki bisnis** | Folder terpisah dari repo kode (mis. di Documents), vault Obsidian/Notion berisi positioning, kompetitor, riset, design system khusus sosmed | Keputusan brand & positioning yang sering **tidak pernah masuk repo kode** — tanyakan apakah ada, karena tempat ini jarang ketemu lewat scan working directory |
| **Dokumen `ryakarsa`** *(opsional, bonus)* | `PRD.md` section Positioning & Brand Tone, `DESIGN-BRIEF.md` | Positioning & tone yang sudah diputuskan saat perencanaan |
| **Wawancara** | — | Hanya untuk yang masih kosong setelah semua sumber di atas |

Cara membaca produk yang sudah jalan: URL → baca halaman lewat web fetch/browser (landing, about, pricing, FAQ); codebase → cari file halaman marketing dan copy di komponen (`pages/index`, `components/landing/*`, `README`); sosmed → minta user kirim link/screenshot beberapa post terakhir kalau tidak bisa diakses langsung.

Tanyakan ke user sumber mana yang ada (lewat **AskUserQuestion**, fallback daftar bernomor) — jangan asumsikan tidak ada hanya karena tidak ketemu di working directory. Jangan tanya ulang hal yang sudah jelas dari sumber.

## Step 2 — Tentukan mode

- **Extract** — *default kalau produk sudah tayang.* Dokumentasikan brand yang **sudah ada**: tagline yang dipakai, cara bicara di copy yang live, istilah yang konsisten dipakai. Tugasnya merapikan dan menuliskan, bukan mengganti. Kalau ada bagian yang lemah (voice tidak konsisten antar halaman, tagline generik), sampaikan sebagai **saran terpisah** — jangan diam-diam diganti di dokumen.
- **Generate** — produk baru (belum ada copy yang tayang), atau user **eksplisit** minta rebrand. Susun dari positioning & persona.

Kalau ragu (mis. produk sudah tayang tapi user bilang "bikinin brand kit"), tanya: "Mau dokumentasikan brand yang sudah jalan, atau memang mau dirombak?" Keduanya hasil yang sangat berbeda.

## Step 3 — Deteksi konflik antar sumber

Sebelum menulis, bandingkan sumber-sumber yang ada. Konflik yang sering terjadi:
- Dokumen bilang premium, website yang tayang terasa murah/mass-market (atau sebaliknya)
- Tagline di website beda dengan di bio Instagram
- Copy landing formal, caption sosmed sangat gaul
- Fitur yang dijanjikan di copy tidak ada di produk (atau fitur baru belum pernah disebut di copy)

**Jangan diam-diam memilih salah satu.** Tulis tiap konflik di bagian "Konflik & Pertanyaan Terbuka" dengan kedua versinya. Prinsip saat menimbang: **produk yang tayang = kenyataan, dokumen = niat.** Sarankan mana yang sebaiknya diikuti dan kenapa, tapi keputusannya milik user.

## Step 4 — Isi brand kit

Tulis ke `./BRAND-KIT.md` (atau path yang user sebut). Kalau file sudah ada, backup dulu ke `BRAND-KIT_old.md` — jangan menimpa diam-diam.

```markdown
# Brand Kit — <Nama Produk>

| | |
|---|---|
| Mode | Extract dari produk yang tayang / Generate |
| Sumber | <daftar sumber yang benar-benar dipakai> |
| Tanggal | <tanggal> |

## 1. Ringkasan
<!-- 2-3 kalimat: produk apa, untuk siapa, kenapa beda. Harus bisa dibaca orang baru dan langsung paham. -->

## 2. Nama & Tagline
<!-- Extract: nama & tagline yang dipakai sekarang + di mana saja muncul; catat kalau tidak konsisten antar kanal. -->
<!-- Generate: 3 opsi tagline, masing-masing + alasan dikaitkan ke positioning. Jangan klaim nama/handle/domain "tersedia" — kamu tidak bisa memverifikasinya; tulis "cek ketersediaan manual". -->

## 3. Positioning
<!-- Kelas: mass-market / mid / premium-eksklusif + alasannya. Untuk siapa (persona utama). -->
<!-- Kompetitor/pembanding + apa yang SENGAJA dibedakan — bukan daftar kompetitor tanpa sikap. -->

## 4. Brand Voice
<!-- 3-4 sifat, masing-masing dengan batasnya: "hangat, tapi tidak lebay", "percaya diri, tapi tidak sombong". Sifat tanpa batas tidak membantu penulis. -->

| Lakukan | Hindari |
|---|---|
| <contoh kalimat nyata yang sesuai voice> | <versi yang salah dari kalimat yang sama> |
<!-- Minimal 4 pasang. Pasangan ini bagian PALING berguna dari brand kit — penulis meniru contoh, bukan definisi abstrak. -->
<!-- Mode extract: ambil kalimat "Lakukan" dari copy yang benar-benar tayang. -->

## 5. Glosarium
<!-- Kata/istilah yang dipakai vs dihindari. Mis. "tamu" bukan "guest", "undangan" bukan "invitation", "paket" bukan "plan". Juga sapaan: kamu/Anda/kak? -->
<!-- Termasuk aturan tanda baca/tipografi naskah kalau brand punya (mis. tidak memakai tanda pisah panjang atau titik tengah). -->

### Cara menyampaikan promo
<!-- Bagaimana brand ini bicara saat ada diskon/promo tanpa merusak persepsinya. Promo berlebihan bisa "mendiskon" brand, bukan cuma harga — paling berisiko untuk brand premium/eksklusif. -->
<!-- Contoh aturan untuk brand premium: "tenang, bukan berteriak" — tanpa stempel diskon merah, countdown mendesak, atau badge SALE; promo disampaikan sebagai undangan/kesempatan, bukan obral. Brand mass-market boleh lebih lugas. -->
<!-- Mode extract: lihat bagaimana promo yang sudah pernah tayang disampaikan. Kalau belum pernah ada promo, tulis (perlu konfirmasi). -->

## 6. Key Messaging
<!-- 1 pesan utama (satu kalimat, diulang di mana-mana) + 3 pesan pendukung. -->
<!-- Setiap pesan WAJIB punya bukti: fitur, angka, atau fakta nyata yang mendukungnya. Pesan tanpa bukti ditandai (perlu bukti). -->

## 7. Value Proposition per Persona
<!-- Per persona: masalahnya → apa yang produk ini lakukan untuknya → hasil yang dia rasakan. Pakai bahasa persona itu, bukan bahasa internal. -->

## 8. Identitas Visual
<!-- JANGAN duplikasi sistem visual lengkap di sini. Kalau ada design system di skill design-tokens atau DESIGN-BRIEF.md, cukup rujuk namanya. Kalau tidak ada, catat hanya yang terlihat di produk: logo (lokasi file), 1-2 warna utama, font kalau jelas. -->

## 9. Konflik & Pertanyaan Terbuka
<!-- Semua konflik dari Step 3 (kedua versi + saranmu), placeholder angka/klaim yang perlu data asli, dan asumsi. -->
```

## Step 5 — Cek sebelum selesai

- **Uji tukar produk**: kalau nama produk di dokumen ini diganti produk lain dan isinya masih masuk akal, brand kit ini terlalu generik. Persempit — terutama voice & key messaging.
- **Uji kata kosong**: cari "berkualitas", "terpercaya", "inovatif", "terbaik", "solusi" tanpa bukti konkret di sebelahnya → ganti dengan fakta, atau buang.
- **Uji klaim**: setiap angka, penghargaan, testimoni — ada sumber aslinya? Kalau tidak, jadikan placeholder.
- **Uji mode extract**: kalau mode extract, apakah dokumen ini benar-benar menggambarkan brand yang tayang, atau diam-diam sudah kamu "perbaiki"? Perbaikan masuk ke saran, bukan ke isi.

Tutup dengan ringkasan ≤6 baris: path file, mode (extract/generate), sumber yang dipakai, jumlah konflik yang ditemukan, jumlah placeholder/klaim yang perlu data asli, dan saran langkah berikutnya.

## Handoff

- **Konten per platform** dari brand kit ini: `content-post`.
- **Rencana kampanye** (kanal, funnel, kalender): `campaign-plan`.
- **Copy landing page**: `landing-copy`.
- **Desain post sosmed**: `social-design`.
- **Identitas visual** (warna, font, layout) — di luar skill ini: `design-brief` / `design-tokens` di pack `ryakarsa` kalau terpasang.
- Belum ada produk sama sekali, masih ide: `prd` di pack `ryakarsa` untuk merumuskan produknya dulu.
