# Aturan Platform

**Terakhir diverifikasi: 2026-09-11** (lewat pencarian web, lihat Sumber di bawah).

Angka di file ini **cepat basi** — platform mengubah batas karakter, rasio, dan durasi tanpa pengumuman besar. Aturan pakai:

- Untuk draft biasa, pakai angka di sini.
- Untuk sesuatu yang kritis (kampanye berbayar, file yang akan dicetak/diproduksi mahal, deadline peluncuran), **verifikasi ulang lewat web search dulu** dan sebutkan ke user bahwa angkanya sudah dicek ulang.
- Kalau file ini sudah lebih dari ~6 bulan dari tanggal di atas, anggap semua angkanya perlu dicek ulang sebelum dipakai, lalu perbarui file ini + tanggalnya.
- Jangan pernah menyodorkan angka dari file ini seolah pasti benar tanpa menyebut tanggal verifikasinya kalau user menanyakan secara spesifik.

Dua jenis angka di bawah, bedakan saat menulis ke user:
- **Batas keras** — ditolak/terpotong oleh platform kalau dilanggar.
- **Rekomendasi** — tidak ditolak, tapi performa/keterbacaan turun kalau dilanggar.

---

## Instagram

| Format | Ukuran | Rasio | Catatan |
|---|---|---|---|
| Feed portrait | 1080×1350 | 4:5 | Format paling disarankan — ruang layar terbesar di feed |
| Feed square | 1080×1080 | 1:1 | |
| Feed landscape | 1080×566 | 1.91:1 | Jarang disarankan, kecil di feed mobile |
| Carousel | sama seperti feed | — | **Maks 20 slide** (batas keras). Semua slide harus rasio sama |
| Reels | 1080×1920 | 9:16 | |
| Story | 1080×1920 | 9:16 | |

- **Jebakan grid profil**: grid profil sekarang tampil **3:4**. Post 4:5 akan di-crop di grid — yang terlihat cuma area tengah **~1012×1350**. Jadi judul/elemen penting di slide pertama carousel wajib di area tengah, jangan mepet kiri-kanan.
- **Caption**: batas keras **2.200 karakter**. Cuma **~125 karakter pertama** yang tampil sebelum "…more" → hook wajib selesai dalam 125 karakter.
- **Hashtag**: batas keras **30**, rekomendasi **~5** yang relevan. Hashtag ikut dihitung ke batas caption.
- **Caption per slide**: carousel sekarang bisa punya caption berbeda di tiap slide — manfaatkan untuk carousel edukasi/langkah-langkah.

**Safe zone & ekspor — dari praktik produksi nyata, bukan spesifikasi resmi Instagram** (rekomendasi):
- **~150px bawah** tiap slide jangan diisi teks penting — tertutup antarmuka di tampilan grid profil.
- **~150×150px pojok kanan atas** slide pertama carousel jangan diisi teks/lencana — di situ muncul ikon multi-slide pada thumbnail grid.
- **Ekspor 2x** (mis. 2160×2700 untuk slide 1080×1350): Instagram mengompres ulang setiap upload, sumber 2x hasilnya jauh lebih tajam — terutama teks tipis. File tetap kecil untuk desain flat (~110-230 KB per slide PNG).
- **Jangan taruh gradasi halus tepat di garis sambungan** carousel yang dirancang menyambung antar slide — tiap slide dikompres terpisah, jadi gradasi di sambungan memunculkan pita warna yang tidak nyambung.

**Mosaic grid profil** (satu gambar besar dipecah jadi 3×2 atau 1×3 post di grid profil):
- Kanvas master: **3240×2700** (3×2) atau **3240×1350** (1×3 / pinned banner), lalu dipotong per 1080×1350.
- **Celah grid**: ada sekat 1-3px antar post di HP; huruf yang terpotong pas di garis 1080px (M, N, O) terlihat bolong. Solusinya **bleed slicing** — potong **1160px** (lebih 80px), lalu atur posisinya saat upload lewat *Edit Cover → Profile Grid* sampai sambungannya pas.
- **Urutan upload mundur**: post terbaru selalu tampil di kiri atas, jadi upload dimulai dari **kanan bawah** berakhir di **kiri atas**.
- Tiap potongan sebaiknya jadi carousel sendiri (cover mosaic + slide isi + slide ajakan), bukan gambar mati tanpa konteks.

## TikTok

| Format | Ukuran | Rasio |
|---|---|---|
| Video | 1080×1920 | 9:16 |

- **Caption**: batas keras **4.000 karakter**. Cuma **~80-100 karakter pertama** yang tampil di bawah video.
  - ⚠ Jebakan: sebagian tool penjadwal pihak ketiga masih membatasi di **2.200** (batas lama). Kalau user posting lewat tool, tanya tool apa, jangan asumsikan 4.000.
- **Durasi**: sampai **10 menit**, tapi **15-60 detik** masih yang paling dominan di platform.
- **Hook**: 1-3 detik pertama menentukan orang lanjut nonton atau scroll — ini rekomendasi paling penting untuk script TikTok.
- **Bio**: 80 karakter.
- **Safe zone** (rekomendasi, bukan spesifikasi resmi): hindari teks penting di ~20% bawah (caption & tombol), ~10% kanan (tombol like/comment/share), dan ~10% atas. Berlaku juga untuk Reels & Shorts.

## YouTube

| Format | Ukuran | Rasio | Catatan |
|---|---|---|---|
| Thumbnail video | 1280×720 | 16:9 | JPG/PNG, **< 2 MB** (batas keras) |
| Shorts | 1080×1920 | 9:16 | **Maks 3 menit** (naik dari 60 detik sejak Okt 2024) |
| Thumbnail Shorts | 1080×1920 | 9:16 | Custom thumbnail Shorts didukung sejak 2024 |

- **Judul**: batas keras **100 karakter**. Yang terlihat di feed Shorts cuma **~40 karakter pertama** — letakkan kata kunci & hook di depan.
- **Deskripsi**: batas keras **5.000 karakter**.
- **Thumbnail**: harus terbaca di ukuran kecil (tampil ~ukuran perangko di mobile) — teks maks 3-5 kata, kontras tinggi.

## X (Twitter)

- **Post**: batas keras **280 karakter** (akun gratis). X Premium sampai **25.000**. Jangan asumsikan user punya Premium — tanya dulu kalau draft-nya panjang.
- **Gambar**: rekomendasi **1600×900** (16:9). Batas file **5 MB** untuk gambar diam.
- **Link**: dipendekkan otomatis oleh X (tetap memakan sebagian kuota karakter).
- **Thread**: untuk konten panjang di akun gratis, pecah jadi thread — tiap post tetap wajib bisa berdiri sendiri, jangan potong di tengah kalimat.

## Threads (milik Meta)

- **Post**: batas keras **500 karakter**, termasuk spasi, tanda baca, dan emoji.
- ⚠ **URL dihitung panjang penuh** — Threads TIDAK memendekkan link seperti X. Link panjang bisa menghabiskan sebagian besar kuota.
- **Text attachment**: sejak akhir 2025 bisa melampirkan teks sampai **10.000 karakter** ke sebuah post — pakai untuk konten panjang alih-alih memecah jadi banyak post.
- Tone: lebih santai & percakapan dibanding X; cross-post mentah dari X sering terasa kaku.

## WhatsApp

| Format | Ukuran | Rasio | Catatan |
|---|---|---|---|
| Status | 1080×1920 | 9:16 | Video maks **90 detik** |

- **Broadcast/pesan bisnis** — aturan paling penting bukan ukuran, tapi **izin**:
  - Kirim hanya ke kontak yang sudah **opt-in** (pernah menghubungi/menyimpan nomor bisnis). Broadcast ke yang belum menyimpan nomor tidak akan sampai, dan spam berisiko akun dibatasi.
  - Lewat WhatsApp Business API: pesan di luar **jendela 24 jam** sejak interaksi terakhir pelanggan wajib pakai **template yang sudah disetujui** — pesan teks bebas akan gagal terkirim.
- **Gaya**: WA itu kanal personal — pesan terasa seperti dari orang, bukan brosur. Singkat, satu tujuan per pesan, CTA jelas (balas/klik link), hindari blok teks panjang.

---

## Aturan lintas platform

- **Jangan cross-post mentah.** Konten yang sama wajib disesuaikan per platform: rasio, panjang caption, gaya bahasa, dan posisi hook berbeda-beda. Cross-post mentah yang paling sering salah: landscape di feed IG (kecil), caption IG 2.200 karakter dipaksa ke X (terpotong), link panjang di Threads (menghabiskan kuota).
- **Teks di dalam gambar harus terbaca di HP.** Skala yang terbukti jalan di carousel 1080px (dari sistem produksi nyata): cover ~82px, judul slide ~58px, judul poin ~41px, isi **~30px**, keterangan ~26px, dan label ~21px **hanya** untuk teks pendek huruf kapital berjarak (tombol, "GESER", navigasi) — bukan untuk kalimat. Uji dengan membayangkan gambar di layar selebar ~6 cm.
- **Maks ~45 kata per slide.** Kalau sebuah judul butuh dua kata sambung, itu tanda harus dipecah jadi dua slide.
- **Hook di depan, selalu.** Setiap platform memotong teks di titik berbeda (IG ~125, TikTok ~80-100, judul Shorts ~40). Apapun platformnya, kalimat pertama wajib bisa berdiri sendiri.

## Sumber (verifikasi 2026-09-11)

- Instagram: socialrails.com (carousel 20 slide), carouselpost.io (grid 3:4 & crop 1012×1350), outfy.com/posttruncate.com (caption & hashtag)
- TikTok: bulkpublish.com, typecount.com (caption 4.000 + jebakan tool lama 2.200), fybamedia.com (durasi)
- YouTube: piktochart.com (Shorts 3 menit), rightblogger.com (thumbnail), shortsync.app (judul/deskripsi)
- X: tweetarchivist.com, sendcove.app (karakter & gambar)
- Threads: ferryman.io, kleoapp.io (500 karakter, text attachment 10.000, URL penuh)
- WhatsApp: green-api.com (status 90 detik), moda.app (ukuran status)
- Safe zone grid IG (150px), ekspor 2x, mosaic/bleed slicing, skala tipografi carousel: praktik produksi nyata dari sistem carousel user (bukan dokumentasi resmi Instagram — perlakukan sebagai rekomendasi yang sudah teruji, bukan batas keras)
