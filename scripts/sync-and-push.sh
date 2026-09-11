#!/usr/bin/env bash
# Sinkronisasi skill dari ~/.agents/skills ke repo ini, lalu commit & push jika ada perubahan.
# Sumber kebenaran: ~/.agents/skills/<skill>. Salinan di repo ikut persis (rsync --delete).
# skills/ dipakai oleh manifest ZCode & Claude Code; .codex/skills/ adalah cermin persis
# dari skills/ untuk auto-discovery Codex CLI (project-level) — tidak ada manifest terpisah.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$HOME/.agents/skills"
SKILLS=(brand-kit campaign-plan content-post landing-copy social-design)

for s in "${SKILLS[@]}"; do
  if [ ! -d "$SRC/$s" ]; then
    echo "LEWATI: $s tidak ada di $SRC"
    continue
  fi
  # library/ = data pribadi (template post tersimpan milik user) — jangan ikut publik.
  # __pycache__/*.pyc = sisa menjalankan test, bukan bagian dari skill.
  # node_modules/ = dependency engine, dipasang lokal lewat npm install (package-lock ikut repo).
  rsync -a --delete \
    --exclude 'library/' --exclude '__pycache__/' --exclude '*.pyc' --exclude 'node_modules/' \
    "$SRC/$s/" "$REPO/skills/$s/"
done

cd "$REPO"

if git diff --quiet && [ -z "$(git status --porcelain)" ]; then
  echo "TIDAK ADA PERUBAHAN"
  exit 0
fi

# Validasi: frontmatter wajib benar sebelum boleh push
for f in skills/*/SKILL.md; do
  dir="$(basename "$(dirname "$f")")"
  grep -q "^name: $dir$" "$f" || { echo "VALIDASI GAGAL: $f — 'name' harus '$dir'"; exit 1; }
  grep -q "^description:" "$f" || { echo "VALIDASI GAGAL: $f — 'description' wajib ada"; exit 1; }
done

# Validasi: unit test script wajib lulus sebelum boleh push
for t in skills/*/scripts/test_*.py; do
  [ -e "$t" ] || continue
  ( cd "$(dirname "$t")" && python3 -m unittest "$(basename "$t" .py)" -q ) \
    || { echo "VALIDASI GAGAL: test $t tidak lulus"; exit 1; }
  find "$(dirname "$t")" -name '__pycache__' -type d -exec rm -rf {} +
done

# Validasi: test engine Node wajib lulus. Dijalankan di SUMBER (bukan salinan repo) karena
# hanya di sana node_modules terpasang — tanpa itu test render Chrome sungguhan ter-skip.
# Isinya identik dengan salinan repo (rsync di atas), kecuali node_modules.
for s in "${SKILLS[@]}"; do
  eng="$SRC/$s/engine"
  [ -f "$eng/package.json" ] || continue
  if [ ! -d "$eng/node_modules" ]; then
    echo "PERINGATAN: $eng/node_modules belum ada — test render Chrome akan ter-skip (jalankan: cd $eng && npm install)"
  fi
  ( cd "$eng" && npm test --silent >/dev/null 2>&1 ) \
    || { echo "VALIDASI GAGAL: test engine $s tidak lulus (cd $eng && npm test)"; exit 1; }
done

# Cerminkan skills/ ke .codex/skills/ supaya Codex CLI selalu ikut versi terbaru
rsync -a --delete skills/ .codex/skills/

git add -A
git commit -m "chore: sinkronisasi skill dari ~/.agents/skills"
git push origin main
echo "TERPUSH: $(git rev-parse --short HEAD)"
