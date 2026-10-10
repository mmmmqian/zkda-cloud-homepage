#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"

mkdir -p "$DIST"

# ChatGPT Sites serves dist/. Keep it as a deterministic mirror of public source.
rsync -a --delete "$ROOT/assets/" "$DIST/assets/"
rsync -a --delete "$ROOT/css/" "$DIST/css/"
rsync -a --delete "$ROOT/js/" "$DIST/js/"
rsync -a --delete "$ROOT/pages/" "$DIST/pages/"
cp "$ROOT/index.html" "$DIST/index.html"

# Remove macOS AppleDouble artifacts if they were introduced by an archive copy.
find "$DIST" -name '._*' -type f -delete

echo "dist synchronized from public source"
