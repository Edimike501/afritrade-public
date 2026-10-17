#!/usr/bin/env bash
# Drops everything and replays ALL migrations from zero on a throwaway DB.
# Guarded: only runs against local *_test / *_smoke / *_ci / *_shadow databases.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
: "${DATABASE_URL:?DATABASE_URL must be set}"
node scripts/lib/db-guard.cjs "$DATABASE_URL"

# Prisma 7 removed --skip-seed/--skip-generate (it no longer seeds/generates on reset); <=6 still has them.
help="$(pnpm --filter api exec prisma migrate reset --help 2>&1 || true)"
flags=(--force)
for f in --skip-seed --skip-generate; do
  grep -q -- "$f" <<<"$help" && flags+=("$f")
done
pnpm --filter api exec prisma migrate reset "${flags[@]}"
