#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is required."
  echo "Example: DATABASE_URL='postgresql://...' ./scripts/deploy-database.sh"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "ERROR: psql is not installed."
  echo "Install PostgreSQL client or run schema.sql + seed.sql manually in Supabase SQL Editor."
  exit 1
fi

echo "Applying database schema..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT/database/schema.sql"

echo "Seeding database..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT/database/seed.sql"

echo "Database deployed successfully."
