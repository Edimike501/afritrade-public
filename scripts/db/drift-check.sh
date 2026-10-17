#!/usr/bin/env bash
# Fails when prisma/schema.prisma contains changes that have no migration.
# Version-agnostic on purpose: `migrate diff` flags changed in Prisma 7, `migrate dev --create-only` did not.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
: "${DATABASE_URL:?DATABASE_URL must be set}"
MIG_DIR="apps/api/prisma/migrations"

bash scripts/db/reset.sh >/dev/null
pnpm --filter api exec prisma migrate dev --create-only --name ci_drift_check || true

created="$(ls -d "$MIG_DIR"/*_ci_drift_check 2>/dev/null || true)"
if [[ -n "$created" ]]; then
  echo
  echo "::error::schema.prisma has changes that are not covered by a migration. Run: pnpm migrate:dev -- --name <what_changed>"
  echo "----- missing SQL -----"
  cat "$created"/migration.sql
  rm -rf "$created"
  exit 1
fi
echo "✅ schema.prisma and migrations are in sync"
