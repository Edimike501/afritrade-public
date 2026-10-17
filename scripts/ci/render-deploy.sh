#!/usr/bin/env bash
# scripts/ci/render-deploy.sh <deploy-hook-url> <commit-sha> [max-retries=3]
# Triggers Render service deployment for a specific commit SHA with retries and detailed diagnostics.
set -euo pipefail

hook_url="${1:-}"
sha="${2:-}"
max_retries="${3:-3}"

if [[ -z "$hook_url" ]]; then
  echo "::error::Deploy hook URL is empty. Ensure the Render deploy hook secret is configured in repository secrets."
  exit 1
fi

if [[ -z "$sha" ]]; then
  echo "::error::Commit SHA is empty."
  exit 1
fi

# Trim accidental whitespace, trailing slash, or surrounding quotes
hook_url="$(echo "$hook_url" | tr -d '\r\n' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/\/$//')"

# Determine query parameter separator
if [[ "$hook_url" == *"?"* ]]; then
  target_url="${hook_url}&ref=${sha}"
else
  target_url="${hook_url}?ref=${sha}"
fi

echo "Triggering Render deploy for commit: ${sha:0:7}"

attempt=1
while (( attempt <= max_retries )); do
  echo "Calling deploy hook (attempt $attempt of $max_retries)..."

  tmp_body="$(mktemp)"
  http_code="$(curl -s -o "$tmp_body" -w "%{http_code}" -X POST "$target_url" || echo "000")"
  response_body="$(cat "$tmp_body" 2>/dev/null || true)"
  rm -f "$tmp_body"

  if [[ "$http_code" =~ ^2[0-9]{2}$ ]]; then
    echo "✅ Render deploy successfully queued (HTTP $http_code)."
    if [[ -n "$response_body" ]]; then
      echo "Render response: $response_body"
    fi
    exit 0
  fi

  echo "⚠️ Attempt $attempt failed (HTTP $http_code)."
  if [[ -n "$response_body" ]]; then
    echo "Server response: $response_body"
  else
    echo "Server returned an empty response body."
  fi

  if (( attempt < max_retries )); then
    sleep_sec=$(( attempt * 5 ))
    echo "Waiting ${sleep_sec}s before retry..."
    sleep "$sleep_sec"
  fi

  attempt=$(( attempt + 1 ))
done

echo "::error::Failed to trigger Render deploy after $max_retries attempts (last HTTP status: $http_code)."
if [[ "$http_code" == "500" ]]; then
  echo "::error::Common causes for Render HTTP 500:"
  echo "  1. The target commit does not exist on the Git branch configured for this service in Render (e.g. service configured for 'main' while deploying a 'staging' commit)."
  echo "  2. The Render service is suspended (inactive free tier or manually suspended)."
  echo "  3. The deploy hook key has expired or was regenerated in Render."
fi

exit 1
