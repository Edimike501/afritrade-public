#!/usr/bin/env bash
# Generates apps/*/.env.smoke from each app's .env.example + smoke-only overrides.
# Single source of truth for BOTH local `pnpm verify:prod` and the CI `verify` job.
# Basing it on .env.example keeps it in sync with env.validation.ts (add a var there => it appears here).
# Sandbox values only. NEVER put real keys here.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

API_PORT="${API_PORT:-4040}"; WEB_PORT="${WEB_PORT:-3030}"; ADMIN_PORT="${ADMIN_PORT:-3031}"
DB_HOST="${SMOKE_DB_HOST:-localhost}"; REDIS_HOST="${SMOKE_REDIS_HOST:-localhost}"
COMMIT="${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo local-smoke)}"

# override <file> <KEY> <value>   (value is always double-quoted so bash `source` and node --env-file agree)
override() {
  local file="$1" key="$2" value="$3" tmp
  tmp="$(mktemp)"
  { grep -vE "^[[:space:]]*${key}=" "$file" 2>/dev/null || true; } >"$tmp"
  printf '%s="%s"\n' "$key" "$value" >>"$tmp"
  mv "$tmp" "$file"
}
base() { # base <app>  -> copies .env.example or starts empty
  local f="apps/$1/.env.smoke"
  if [[ -f "apps/$1/.env.example" ]]; then grep -vE '^[[:space:]]*$' "apps/$1/.env.example" >"$f"; else : >"$f"; fi
  echo "$f"
}
has_key() { grep -qE "^[[:space:]]*$2=" "$1"; }

# ---- api
f="$(base api)"
override "$f" NODE_ENV production
override "$f" PORT "$API_PORT"
override "$f" CORS_ORIGINS "http://localhost:${WEB_PORT},http://localhost:${ADMIN_PORT}"
override "$f" DATABASE_URL "postgresql://postgres:postgres@${DB_HOST}:5432/afritrade_smoke?schema=public"
override "$f" REDIS_URL "redis://${REDIS_HOST}:6379/2"
override "$f" PAYMENTS_MODE simulated
override "$f" STORAGE_MODE simulated
override "$f" RENDER_GIT_COMMIT "$COMMIT"
override "$f" SEED_ADMIN_EMAIL "admin@afritrade.test"
override "$f" SEED_ADMIN_PASSWORD "ChangeMe123!"
# every JWT secret the example declares gets a long dummy value
for key in $(grep -oE '^[[:space:]]*JWT_[A-Z_]*SECRET' "$f" | tr -d ' ' || true); do override "$f" "$key" "smoke-test-secret-minimum-32-characters-long-0000"; done
has_key "$f" JWT_ACCESS_SECRET || [[ -n "$(grep -E '^JWT_[A-Z_]*SECRET=' "$f" || true)" ]] || override "$f" JWT_ACCESS_SECRET "smoke-test-secret-minimum-32-characters-long-0000"
# dormant provider keys: sandbox dummies only if the example declares them
for pair in PAYSTACK_SECRET_KEY=sk_test_smoke_dummy PAYSTACK_PUBLIC_KEY=pk_test_smoke_dummy FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-smoke_dummy; do
  has_key "$f" "${pair%%=*}" && override "$f" "${pair%%=*}" "${pair#*=}"
done

# ---- web / admin (only if the app exists)
for app in web admin; do
  [[ -d "apps/$app" ]] || continue
  f="$(base "$app")"
  override "$f" NEXT_PUBLIC_API_URL "http://localhost:${API_PORT}"
  override "$f" NEXT_PUBLIC_APP_ENV smoke
  [[ "$app" == web ]] && override "$f" NEXT_PUBLIC_APP_URL "http://localhost:${WEB_PORT}"
  [[ "$app" == admin ]] && override "$f" NEXT_PUBLIC_APP_URL "http://localhost:${ADMIN_PORT}"
done

# sanity: every generated file must be shell-sourceable (verify-prod sources them)
for f in apps/*/.env.smoke; do
  bash -c "set -a; source '$f'" >/dev/null 2>&1 || { echo "❌ $f is not shell-sourceable (quote values in the matching .env.example)"; exit 1; }
done
echo "smoke env files written for: api$([[ -d apps/web ]] && echo ' web')$([[ -d apps/admin ]] && echo ' admin') (commit ${COMMIT:0:7})"
