#!/usr/bin/env bash
# Builds the zip that gets uploaded to Hostinger.
#
# Hostinger serves this site as plain files out of public_html - there is no
# build step and no Node. This script only decides what ships: the site itself
# plus .htaccess, and none of the docs, harness or Vercel config.
#
#   ./build-hostinger.sh          -> ../imawa-hostinger.zip
#
# Upload and extract per the "Deploying" section of CLAUDE.md.

set -euo pipefail
cd "$(dirname "$0")"

OUT="${1:-../imawa-hostinger.zip}"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

rsync -a \
  --exclude='.git' --exclude='.claude' --exclude='.gitignore' \
  --exclude='vercel.json' --exclude='CLAUDE.md' --exclude='HANDOFF.md' \
  --exclude='MEDIA-LINKS.md' --exclude='README.md' --exclude='prompt.md' \
  --exclude='design.md' --exclude='build-hostinger.sh' --exclude='.DS_Store' \
  ./ "$STAGE/"

# .htaccess is the one file the site cannot run without: it is what makes
# /about and /brand resolve. rsync copies dotfiles, but check rather than hope.
[ -f "$STAGE/.htaccess" ] || { echo "FATAL: .htaccess missing from the build" >&2; exit 1; }

# zip runs from inside the staging dir, so the destination has to be absolute
mkdir -p "$(dirname "$OUT")"
OUT_ABS="$(cd "$(dirname "$OUT")" && pwd)/$(basename "$OUT")"
rm -f "$OUT_ABS"
( cd "$STAGE" && zip -qr "$OUT_ABS" . )

echo "built  $OUT_ABS"
echo "size   $(du -h "$OUT_ABS" | cut -f1)"
echo
echo "root of the archive:"
unzip -Z1 "$OUT_ABS" | awk -F/ '{print $1}' | sort -u | sed 's/^/  /'
