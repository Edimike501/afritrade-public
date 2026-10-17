#!/usr/bin/env bash
# Deploy a Next.js workspace (apps/web or apps/admin) to Vercel via prebuilt artifacts.
# Usage: bash scripts/ci/vercel-deploy.sh <app_dir> <preview|production> [stable_url]
set -euo pipefail

APP_DIR="${1:?app_dir required (e.g. apps/web)}"
TARGET="${2:?target required (preview or production)}"
STABLE_URL="${3:-${STABLE_URL:-}}"
APP_NAME="$(basename "$APP_DIR")"

VERCEL="npx --yes vercel@63.1.2"

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "::error::VERCEL_TOKEN secret is not set in GitHub Actions."
  exit 1
fi

ORG_ID="${VERCEL_ORG_ID:-}"
PROJECT_ID="${VERCEL_PROJECT_ID:-}"

if [[ -z "$ORG_ID" || -z "$PROJECT_ID" ]]; then
  echo "::error::Both VERCEL_ORG_ID (${ORG_ID:-missing}) and VERCEL_PROJECT_ID (${PROJECT_ID:-missing}) must be configured for $APP_DIR. Please configure VERCEL_ORG_ID, VERCEL_PROJECT_ID_WEB, and VERCEL_PROJECT_ID_ADMIN in GitHub Repository Variables."
  exit 1
fi

echo "Using Vercel context for $APP_DIR: orgId=$ORG_ID projectId=$PROJECT_ID"

# Write .vercel/project.json and unset VERCEL_ORG_ID/VERCEL_PROJECT_ID from env so
# Vercel CLI uses the local project link (which activates skipOwnerLookup in `pull`
# and skipRemoteLookup in `deploy --prebuilt`, avoiding `/v2/user` calls).
mkdir -p "$APP_DIR/.vercel"
printf '{"orgId":"%s","projectId":"%s","projectName":"afritrade-%s"}\n' "$ORG_ID" "$PROJECT_ID" "$APP_NAME" > "$APP_DIR/.vercel/project.json"
unset VERCEL_ORG_ID VERCEL_PROJECT_ID

SCOPE_ARGS=()
[[ "$ORG_ID" == team_* ]] && SCOPE_ARGS=(--scope "$ORG_ID")

PROD_ARGS=()
[[ "$TARGET" == "production" ]] && PROD_ARGS=(--prod)

$VERCEL pull --yes --environment="$TARGET" "${SCOPE_ARGS[@]}" --token="$VERCEL_TOKEN" --cwd "$APP_DIR"

export NEXT_PUBLIC_APP_ENV="${NEXT_PUBLIC_APP_ENV:-$([ "$TARGET" == "production" ] && echo "production" || echo "staging")}"

# Warn and strip [SENSITIVE] placeholders so process environment values set in workflow are used instead
ENV_FILE="$APP_DIR/.vercel/.env.${TARGET}.local"
if [[ -f "$ENV_FILE" ]] && grep -q '\[SENSITIVE\]' "$ENV_FILE"; then
  echo "::warning::These vars are Sensitive and cannot be pulled; the build would bake in '[SENSITIVE]':"
  grep '\[SENSITIVE\]' "$ENV_FILE" | cut -d= -f1
  # Drop them so values from the process environment (set in the workflow) are used instead
  sed -i.bak '/\[SENSITIVE\]/d' "$ENV_FILE" 2>/dev/null || sed -i '/\[SENSITIVE\]/d' "$ENV_FILE"
  rm -f "${ENV_FILE}.bak"
fi

if [[ -f "$ENV_FILE" ]] && ! grep -q '^NEXT_PUBLIC_APP_ENV=' "$ENV_FILE"; then
  echo "NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV}" >> "$ENV_FILE"
fi

# Normalize .vercel/project.json with explicit repoRoot and rootDirectory so both
# `vercel build` and `vercel deploy --prebuilt` resolve filePathMap relative to the
# monorepo root while reading prebuilt output from $APP_DIR/.vercel/output.
node -e '
  const fs = require("fs");
  const [p, orgId, projectId, appName, repoRoot, appDir] = process.argv.slice(1);
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  data.orgId = data.orgId || orgId;
  data.projectId = data.projectId || projectId;
  data.projectName = data.projectName || `afritrade-${appName}`;
  data.repoRoot = repoRoot;
  data.projectRootDirectory = appDir;
  data.settings = data.settings || {};
  data.settings.rootDirectory = appDir;
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
' "$APP_DIR/.vercel/project.json" "$ORG_ID" "$PROJECT_ID" "$APP_NAME" "$PWD" "$APP_DIR"

$VERCEL build --yes "${PROD_ARGS[@]}" "${SCOPE_ARGS[@]}" --token="$VERCEL_TOKEN" --cwd "$APP_DIR"

URL="$($VERCEL deploy --prebuilt --yes "${PROD_ARGS[@]}" "${SCOPE_ARGS[@]}" --token="$VERCEL_TOKEN" --cwd "$APP_DIR" | tail -n1)"
echo "Deployed $APP_NAME URL: $URL"

if [[ -n "$STABLE_URL" && "$TARGET" == "preview" ]]; then
  TEAM_QUERY=""
  [[ "$ORG_ID" == team_* ]] && TEAM_QUERY="?teamId=$ORG_ID"
  # Ensure Vercel Authentication (SSO protection) does not gate the public staging alias with a 302 redirect
  curl -fsS -X PATCH "https://api.vercel.com/v9/projects/${PROJECT_ID}${TEAM_QUERY}" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"ssoProtection":null}' >/dev/null || true

  ALIAS_HOST="${STABLE_URL#https://}"
  ALIAS_HOST="${ALIAS_HOST#http://}"
  ALIAS_HOST="${ALIAS_HOST%/}"
  if ! $VERCEL alias set "$URL" "$ALIAS_HOST" "${SCOPE_ARGS[@]}" --token="$VERCEL_TOKEN" --cwd "$APP_DIR"; then
    echo "Fallback: assigning alias $ALIAS_HOST via Vercel REST API..."
    DEPLOY_HOST="${URL#https://}"
    DEPLOY_HOST="${DEPLOY_HOST#http://}"
    DEPLOY_HOST="${DEPLOY_HOST%/}"
    curl -fsS -X POST "https://api.vercel.com/v2/deployments/${DEPLOY_HOST}/aliases${TEAM_QUERY}" \
      -H "Authorization: Bearer $VERCEL_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"alias\":\"$ALIAS_HOST\"}"
    echo ""
  fi
fi
