#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -z "${VITE_API_URL:-}" ]]; then
  echo "ERROR: VITE_API_URL is required."
  echo "Example: VITE_API_URL='https://your-api.onrender.com' ./scripts/deploy-admin-netlify.sh"
  exit 1
fi

cd "$ROOT/admin"
echo "VITE_API_URL=$VITE_API_URL" > .env.production
npm install
npm run build

if [[ -z "${NETLIFY_AUTH_TOKEN:-}" ]]; then
  echo "Admin build completed at admin/dist."
  echo "NETLIFY_AUTH_TOKEN not set, so automatic upload was skipped."
  echo "Manual: drag admin/dist into Netlify or connect GitHub with admin/netlify.toml."
  exit 0
fi

if [[ -n "${NETLIFY_SITE_ID:-}" ]]; then
  npx netlify deploy --prod --dir=dist --site="$NETLIFY_SITE_ID" --auth="$NETLIFY_AUTH_TOKEN"
else
  npx netlify deploy --prod --dir=dist --auth="$NETLIFY_AUTH_TOKEN"
fi
