#!/usr/bin/env bash
# Creates the extra local databases if they don't exist (works on an existing volume too).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
for db in afritrade afritrade_test afritrade_smoke; do
  if ! docker compose exec -T postgres psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$db'" | grep -q 1; then
    docker compose exec -T postgres createdb -U postgres "$db"
    echo "created database $db"
  fi
done
