# ryakarsa-market

Plugin skill marketing & branding untuk ZCode, Claude Code, **dan** Codex CLI — lima skill yang saling menyambung, saudara dari [`ryakarsa`](https://github.com/revianto/ryakarsa) (PRD & design).

| Skill | Fungsi |
|---|---|
| [`brand-kit`](#1-brand-kit--sumber-tunggal-brand) | produk (baru atau yang sudah jadi) → brand kit: voice, tagline, key messaging |
| [`campaign-plan`](#2-campaign-plan--rencana-kampanye-yang-realistis) | tujuan → kanal, funnel, pilar konten, kalender sesuai kapasitas nyata |
| [`content-post`](#3-content-post--konten-siap-posting) | ide → post siap tayang per platform, patuh batas tiap platform |
| [`landing-copy`](#4-landing-copy--copy-halaman-marketing) | tulis atau audit copy landing page |
| [`social-design`](#5-social-design--design-system-post-sosmed) | template visual post di dimensi persis, bisa langsung dirender jadi PNG |

**Tidak harus lewat `ryakarsa`.** Semua skill bisa jalan dari produk yang sudah jadi — URL yang tayang, codebase, akun sosmed yang aktif, atau materi brand yang kamu punya. Dokumen `ryakarsa` (PRD, design brief, design system) cuma bonus kalau kebetulan ada.

Platform yang didukung: **Instagram, TikTok, YouTube, X (Twitter), Threads, WhatsApp**.

```text
ryakarsa-market/
├── .zcode-plugin/plugin.json    # manifest ZCode
├── .claude-plugin/plugin.json   # manifest Claude Code
├── .codex/skills/               # cermin persis skills/ untuk Codex CLI
├── scripts/sync-and-push.sh     # sinkron ~/.agents/skills → repo, validasi + test, commit & push
└── skills/
    ├── brand-kit/SKILL.md
    ├── campaign-plan/SKILL.md
    ├── content-post/
    │   ├── SKILL.md
    │   └── references/platform-rules.md   # batas semua platform, satu sumber untuk seluruh pack
    ├── landing-copy/SKILL.md
    └── social-design/
        ├── SKILL.md
        └── scripts/
            ├── render_post.py            # HTML → PNG di dimensi persis (Chrome headless)
            ├── manage_library.py         # kelola library template post
            └── test_*.py                 # unit test
```

## Pasang di ZCode

1. **Settings → Plugin Management → Discover** → tombol **`+`** → **GitHub repository**.
2. Tempel: `https://github.com/revianto/ryakarsa-market` → **Add**.
3. Klik plugin **ryakarsa-market** → **Install** → **Enable**.

## Pasang di Claude Code

```
/plugin marketplace add https://github.com/revianto/ryakarsa-market
/plugin install ryakarsa-market@revianto/ryakarsa-market
```

Atau tanpa plugin: salin folder skill ke `~/.claude/skills/`:

```bash
cp -R skills/brand-kit skills/campaign-plan skills/content-post skills/landing-copy skills/social-design ~/.claude/skills/
```

## Pasang di Codex CLI

- **Per-project**: clone repo ini, jalankan Codex dari dalamnya — `.codex/skills/` langsung terbaca.
- **Semua project**:
  ```bash
  cp -R skills/brand-kit skills/campaign-plan skills/content-post skills/landing-copy skills/social-design ~/.codex/skills/
  ```

## Kebutuhan

- `social-design` mode **generate langsung** butuh **Google Chrome atau Chromium** (untuk render PNG). Tanpa Chrome, mode **ide saja** tetap jalan.
- Python 3 (sudah ada di macOS/Linux) untuk script `social-design`. Tidak ada dependency tambahan.

---

## Cara pakai

### 1. `brand-kit` — sumber tunggal brand

```
bikin brand kit untuk produk ini, websitenya https://...
```

Produk sudah tayang → mode **extract**: brand yang sudah ada didokumentasikan dari copy yang live, bukan diganti brand karangan. Kalau sumber-sumber saling bertentangan (website terasa mass-market tapi deck bilang premium), konfliknya ditandai, bukan dipilih diam-diam. Hasil: `BRAND-KIT.md`, dibaca oleh keempat skill lain.

### 2. `campaign-plan` — rencana kampanye yang realistis

```
bikin rencana kampanye launching 4 minggu, aku ngerjain sendiri
```

Pertanyaan terpentingnya soal **kapasitas** — rencana disesuaikan dengan jam yang benar-benar tersedia, bukan rencana ideal yang ditinggalkan di minggu kedua. Termasuk kanal yang **sengaja tidak dipakai** beserta alasannya. Hasil: `CAMPAIGN.md`.

### 3. `content-post` — konten siap posting

```
bikin carousel IG + versi thread X dari fitur baru ini
```

Batas tiap platform diterapkan dan jumlah karakternya ditampilkan (`hook 118/125`), hook diberi 2-3 alternatif, dan satu ide untuk beberapa platform selalu diadaptasi — tidak pernah cross-post mentah.

### 4. `landing-copy` — copy halaman marketing

```
audit copy landing page ini, kenapa nggak konversi
```

Mode **audit** untuk halaman yang sudah tayang (sebelum → sesudah per section, jadi bisa diterima sebagian), atau **tulis baru**. Testimoni, angka, dan logo klien tidak pernah dikarang — jadi placeholder yang mencolok. Hasil: `LANDING-COPY.md`.

### 5. `social-design` — design system post sosmed

```
generate carousel 5 slide dari teks ini, pakai design system rebrew
```

Warna & font diambil dari design system brand, dimensi persis per platform, safe zone & crop grid Instagram diperhitungkan. Mode **generate langsung** menghasilkan file PNG siap upload; mode **ide saja** menghasilkan konsep. Template yang bagus disimpan ke library untuk dipakai ulang.

## Maintenance

Sumber asli skill ada di `~/.agents/skills/`, bukan di repo ini. Setelah mengedit di sana:

```bash
./scripts/sync-and-push.sh
```

Script ini menolak push kalau frontmatter salah **atau unit test gagal**.

Angka batas platform di `platform-rules.md` cepat basi — file itu mencatat tanggal verifikasi terakhir, dan skill diinstruksikan memverifikasi ulang lewat web search kalau sudah lama atau untuk keperluan penting.
