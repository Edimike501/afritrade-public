#!/usr/bin/env bash
# Reproduces what Render/Vercel do (production build + production start) for api, web (and admin if present),
# against a THROWAWAY local database, then runs the same smoke suite used on staging/production.
# Sandbox keys and local afritrade_smoke DB only. NEVER point this at live keys or a hosted database (RULES.md §9).
#
# Needs: `pnpm db:up` (Postgres + Redis from docker-compose.yml).
# Usage:
#   pnpm verify:prod          # full: lint, typecheck, unit tests, build, boot, DB reset+seed, smoke (incl. auth flow)
#   pnpm verify:prod --quick  # skip lint/typecheck/tests (CI already ran them); build + boot + smoke only
set -euo pipefail

QUICK=0
[[ "${1:-}" == "--quick" ]] && QUICK=1

API_PORT="${API_PORT:-4040}"
WEB_PORT="${WEB_PORT:-3030}"
ADMIN_PORT="${ADMIN_PORT:-3031}"
SHARED_PKG="${SHARED_PKG:-@afritrade/shared}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

LOG_DIR="$(mktemp -d)"
PIDS=()
APPS=()                       # frontends that exist in this repo
for a in web admin; do [[ -d "apps/$a" ]] && APPS+=("$a"); done
port_of() { [[ "$1" == web ]] && echo "$WEB_PORT" || echo "$ADMIN_PORT"; }

step() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✅ %s\033[0m\n' "$*"; }
fail() { printf '\033[1;31m❌ %s\033[0m\n' "$*"; exit 1; }

cleanup() {
  local code=$?
  for pid in "${PIDS[@]:-}"; do [[ -n "$pid" ]] && kill "$pid" 2>/dev/null || true; done
  if [[ $code -ne 0 ]]; then
    printf '\n\033[1;31m--- Process logs (%s) ---\033[0m\n' "$LOG_DIR"
    for f in "$LOG_DIR"/*.log; do [[ -f "$f" ]] && { echo "### $(basename "$f")"; tail -n 40 "$f"; }; done
  fi
  exit $code
}
trap cleanup EXIT

# ---------------------------------------------------------------- preflight
step "Preflight"
if [[ -f .nvmrc ]]; then
  want="$(tr -d 'v\r\n ' < .nvmrc | cut -d. -f1)"
  have="$(node -p 'process.versions.node.split(".")[0]')"
  if [[ "$want" != "$have" ]]; then
    nvm_match="$(ls -d "${NVM_DIR:-$HOME/.nvm}/versions/node/v${want}."* 2>/dev/null | sort -V | tail -n 1 || true)"
    if [[ -n "$nvm_match" && -x "$nvm_match/bin/node" ]]; then
      export PATH="$nvm_match/bin:$PATH"
      have="$(node -p 'process.versions.node.split(".")[0]')"
    fi
  fi
  [[ "$have" -ge "$want" ]] || fail "Node $have locally, but .nvmrc wants >= $want. Run: nvm use"
  ok "Node major version ($have) satisfies .nvmrc (>= $want)"
fi

tcp_up() { (exec 3<>"/dev/tcp/$1/$2") 2>/dev/null; }
tcp_up localhost 5432 || fail "Postgres is not reachable on :5432. Run: pnpm db:up"
tcp_up localhost 6379 || fail "Redis is not reachable on :6379. Run: pnpm db:up"

# Always regenerate so the smoke env can never drift from .env.example / env.validation.ts
bash scripts/ci/make-smoke-env.sh

if grep -Eq 'sk_live_|pk_live_|FLWSECK-' apps/*/.env.smoke; then fail "Live payment key found in a .env.smoke file. Sandbox keys only."; fi
grep -q '^PAYMENTS_MODE="simulated"' apps/api/.env.smoke || fail "PAYMENTS_MODE must be simulated for verify-prod"

# Destructive DB steps below: prove the target is a local throwaway database.
SMOKE_DB_URL="$(grep '^DATABASE_URL=' apps/api/.env.smoke | cut -d= -f2- | tr -d '"')"
node scripts/lib/db-guard.cjs "$SMOKE_DB_URL" || fail "Refusing to continue: smoke DB is not a local throwaway database"

for p in "$API_PORT" "$WEB_PORT" "$ADMIN_PORT"; do
  if lsof -iTCP:"$p" -sTCP:LISTEN >/dev/null 2>&1; then fail "Port $p already in use (stop 'pnpm dev' first)"; fi
done
ok "Preflight passed"

# ------------------------------------------------------------ install + checks
step "Install (frozen lockfile, same as Render/Vercel)"
pnpm install --frozen-lockfile
pnpm --filter api db:generate

if [[ $QUICK -eq 0 ]]; then
  step "Policy, lint, typecheck, unit tests"
  bash scripts/ci/policy-checks.sh
  pnpm -r lint
  pnpm -r typecheck
  pnpm -r test
fi

# ------------------------------------------------------------------- builds
step "Simulate fresh clone"
rm -rf packages/*/dist apps/api/dist apps/*/.next .turbo
pnpm --filter api db:generate

step "Build api (same as Render)"
pnpm turbo run build --filter=api --force

for app in "${APPS[@]}"; do
  step "Build $app (same as Vercel; NEXT_PUBLIC_* are baked in here)"
  ( set -a; source "apps/$app/.env.smoke"; set +a
    pnpm turbo run build --filter="$app" --force )
done

# --------------------------------------------------- shared package, both formats
step "Check $SHARED_PKG loads as CJS (api) and ESM (frontends)"
( cd apps/api && node -e "require('$SHARED_PKG')" ) || fail "$SHARED_PKG failed to load via require() from apps/api"
for app in "${APPS[@]}"; do
  ( cd "apps/$app" && node --input-type=module -e "import '$SHARED_PKG'" ) || fail "$SHARED_PKG failed to load via import from apps/$app"
done
ok "shared loads in both module systems"

# --------------------------------------------------- database: from zero, like a fresh environment
step "Database: replay ALL migrations from zero + seed (throwaway afritrade_smoke)"
( set -a; source apps/api/.env.smoke; set +a
  bash scripts/db/reset.sh
  pnpm --filter api seed )
ok "migrations replayed and seed completed"

# --------------------------------------------------------------------- boot
step "Boot compiled output (production mode, sandbox env)"
# API: exactly what Render runs (node dist/main.js), PORT supplied like Render does.
( cd apps/api && node --env-file=.env.smoke dist/main.js ) >"$LOG_DIR/api.log" 2>&1 &
PIDS+=($!)

for app in "${APPS[@]}"; do
  ( set -a; source "apps/$app/.env.smoke"; set +a
    cd "apps/$app"
    NODE_ENV=production exec pnpm exec next start -p "$(port_of "$app")" ) >"$LOG_DIR/$app.log" 2>&1 &
  PIDS+=($!)
done

# -------------------------------------------------------------------- probes
step "Probe (same suite as staging/production, plus the auth flow)"
export API_URL="http://localhost:${API_PORT}"
export WEB_URL="http://localhost:${WEB_PORT}"
[[ -d apps/admin ]] && export ADMIN_URL="http://localhost:${ADMIN_PORT}"
export EXPECTED_COMMIT="${GITHUB_SHA:-$(git rev-parse HEAD)}"
# Pages must match real routes. Override per run:  WEB_PAGES=/,/marketplace ADMIN_PAGES=/ pnpm verify:prod
node scripts/ci/smoke-test.mjs --env=local --auth

# Crash check: nothing should have died while probing
for pid in "${PIDS[@]}"; do kill -0 "$pid" 2>/dev/null || fail "A server process exited during probing"; done

echo
ok "api${APPS[*]:+, ${APPS[*]}} built from scratch, booted in production mode against a fresh DB, and passed every probe"
