#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== The Gents Studio & Spa preflight =="
echo "Root: $ROOT"

echo "\n== Backend syntax/dependency check =="
cd "$ROOT/backend"
npm install
npm audit --omit=dev
npm run check

echo "\n== Admin build check =="
cd "$ROOT/admin"
npm install
npm audit
npm run build

echo "\n== Required files check =="
cd "$ROOT"
for f in \
  database/schema.sql \
  database/seed.sql \
  backend/package.json \
  backend/src/server.js \
  admin/package.json \
  mobile/package.json \
  render.yaml \
  admin/netlify.toml \
  LAUNCH_DEPLOYMENT_COMMANDS.md; do
  if [[ ! -f "$f" ]]; then
    echo "Missing: $f"
    exit 1
  fi
  echo "OK: $f"
done

echo "\nPreflight complete. Backend and admin are ready for deployment."
