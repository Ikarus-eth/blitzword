#!/usr/bin/env bash
# Rebuild index.html from src/App.jsx. Run from anywhere.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
[ -d node_modules ] || npm install react@18 react-dom@18 esbuild jsdom --no-audit --no-fund
mkdir -p .build
cp src/App.jsx src/entry.jsx .build/
npx esbuild .build/entry.jsx --bundle --minify --target=safari15 --outfile=.build/bundle.js
python3 src/mkhtml.py .build/bundle.js index.html
echo "OK: index.html rebuilt ($(wc -c < index.html) bytes)"
