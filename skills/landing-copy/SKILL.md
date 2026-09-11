---
name: landing-copy
description: Tulis atau audit copy halaman marketing/landing page — headline & subheadline (dengan alternatif + alasan), benefit (bukan daftar fitur), CTA per section, jawaban keberatan/FAQ, dan social proof — ke LANDING-COPY.md. Dua mode — audit & perbaiki copy halaman yang SUDAH tayang, atau tulis baru untuk halaman yang belum ada. Gunakan saat user minta "tulis copy landing page", "bikinin headline", "copy website kurang menjual", "rapikan copy halaman ini", "copy untuk halaman pricing/about/produk", "audit copy website", "kenapa landing page tidak konversi". Bukan untuk post sosmed (content-post), bukan untuk desain/layout halaman (design-brief di pack ryakarsa, atau uiux-guide), dan bukan untuk brand voice (brand-kit).
---

# Landing Copy

Tulis copy halaman yang membuat orang **paham dalam 5 detik** apa ini, untuk siapa, dan kenapa harus peduli — lalu tahu persis harus klik apa.

Bahasa: ikuti bahasa user dan audiens produknya.

**Aturan emas:** landing page adalah tempat paling menggoda untuk mengarang — dan paling berbahaya, karena klaim di halaman publik bisa dituntut. **Jangan pernah mengarang** testimoni, nama/foto pelanggan, logo klien, jumlah pengguna, rating, penghargaan, liputan media, atau garansi. Semua yang belum ada datanya jadi placeholder yang mencolok — `[TESTIMONI ASLI — nama, peran, kutipan]` — dan didaftar di akhir. Lebih baik section social proof kosong daripada berisi karangan.

## Step 1 — Kumpulkan sumber & tentukan mode

- **Halaman sudah tayang** (URL atau file halaman di codebase) → **mode audit**: baca copy yang ada apa adanya, nilai, lalu perbaiki. Jangan tulis ulang dari nol — yang sudah jalan mungkin punya bagian yang bekerja baik.
- **Halaman belum ada** → **mode tulis baru**.
- **`BRAND-KIT.md`** → voice, glosarium, key messaging, value prop per persona. Sumber utama.
- **`DESIGN-BRIEF.md`** *(opsional, dari pack `ryakarsa`)* → blok konten yang sudah diputuskan (CTA, testimoni, pricing, FAQ, dll) dan urutannya. Kalau ada, copy ikut struktur itu; kalau tidak, usulkan struktur sendiri di Step 3.
- Tidak ada `BRAND-KIT.md` → baca copy yang tayang untuk menangkap voice yang sudah ada; sarankan `brand-kit` di akhir.

## Step 2 — Mode audit: nilai dulu, baru ubah

Untuk halaman yang sudah tayang, audit dengan pertanyaan konkret dan kutip bagian aslinya:

- **Uji 5 detik** — dari headline + subheadline saja, apakah jelas: ini apa, untuk siapa, apa manfaatnya?
- **Fitur vs manfaat** — apakah copy menjelaskan *apa yang produk lakukan* ("fitur RSVP online") atau *apa yang user dapat* ("tahu siapa yang datang tanpa menelepon satu per satu")?
- **Satu aksi utama** — apakah jelas CTA mana yang utama, atau ada 4 tombol yang bersaing?
- **Keberatan dijawab?** — alasan orang ragu (harga, keamanan data, "ribet nggak?") dijawab di halaman, atau dibiarkan?
- **Klaim tanpa bukti** — "terbaik", "terpercaya", "#1" tanpa angka/sumber?
- **Konsistensi** — istilah & sapaan sama dengan glosarium brand kit? Headline sesuai key messaging?

Sajikan temuan dulu (**yang sudah bagus juga disebut** — supaya tidak ikut diubah), baru perbaikannya.

## Step 3 — Tulis copy

Per section, dalam urutan halaman:

- **Headline** — beri **3 alternatif dengan pendekatan berbeda** (manfaat langsung / masalah yang diselesaikan / pembeda dari cara lama), masing-masing dengan alasan satu baris. Headline paling menentukan, jadi user perlu pilihan di sini.
- **Subheadline** — melengkapi headline: untuk siapa + bagaimana, 1-2 kalimat.
- **CTA utama** — kata kerja + hasil ("Buat Undangan Gratis", bukan "Submit"/"Klik di sini"). Plus teks pengurang risiko di dekatnya kalau relevan ("tanpa kartu kredit", "gratis 14 hari") — hanya kalau memang benar.
- **Benefit** — 3-4 manfaat, masing-masing: judul manfaat (hasil untuk user) + penjelasan singkat + fitur yang mewujudkannya. Manfaat dulu, fitur sebagai bukti — bukan sebaliknya.
- **Cara kerja** — kalau produknya butuh dijelaskan: 3 langkah, masing-masing satu kalimat.
- **Social proof** — hanya dari data asli. Kalau belum ada: placeholder + saran data apa yang layak dikumpulkan dulu.
- **FAQ / jawaban keberatan** — dari keberatan nyata (tanya user, atau ambil dari pertanyaan pelanggan yang sering masuk), bukan pertanyaan basa-basi. Jawaban singkat & jujur.
- **CTA penutup** — ulangi aksi utama untuk yang sudah scroll sampai bawah.

## Step 4 — Cek sebelum selesai

- **Uji 5 detik** lagi pada headline pilihan.
- **Uji tukar produk** — kalau nama produk diganti kompetitor dan copy-nya tetap masuk akal, terlalu generik. Persempit dengan hal yang hanya benar untuk produk ini.
- **Uji kata kosong** — "solusi", "inovatif", "seamless", "terbaik", "berkualitas" tanpa bukti → ganti dengan fakta konkret atau buang.
- **Uji klaim** — setiap angka/testimoni/logo ada sumbernya, atau sudah jadi placeholder?
- **Voice & glosarium** — sesuai `BRAND-KIT.md`?

## Output

Tulis ke `./LANDING-COPY.md` (atau path yang user sebut). Kalau sudah ada, backup dulu ke `LANDING-COPY_old.md`.

Mode audit: tampilkan **sebelum → sesudah** per section, plus alasan singkat tiap perubahan — supaya user bisa menerima sebagian dan menolak sebagian. Jangan langsung menimpa file halaman di codebase kecuali diminta; kalau diminta menerapkan, ubah hanya teksnya, jangan struktur/komponennya.

Tutup dengan ringkasan ≤6 baris: path file, mode, headline yang direkomendasikan, jumlah placeholder yang perlu data asli (sebutkan yang paling mendesak), dan temuan terbesar (mode audit).

## Handoff

- **Layout/desain halamannya**: `design-brief` (arah visual) dan `uiux-guide` (aturan teknis) di pack `ryakarsa`.
- **Belum ada brand voice / key messaging**: `brand-kit`.
- **Mendatangkan orang ke halaman ini**: `campaign-plan` + `content-post`.
