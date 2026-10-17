#!/usr/bin/env bash
# wait-for-version.sh <health-url> <expected-sha> [timeout-seconds=600]
# Polls the API health endpoint until it reports the commit we just deployed.
# Free-tier hosts cold-start, so the default timeout is generous.
set -euo pipefail
url="${1:?health url}"; sha="${2:?expected sha}"; timeout="${3:-600}"
deadline=$(( $(date +%s) + timeout ))
last="(no response)"
while (( $(date +%s) < deadline )); do
  body="$(curl -fsS --max-time 20 "$url" 2>/dev/null || true)"
  if [[ -n "$body" ]]; then
    live="$(printf '%s' "$body" | node -e '
      let s=""; process.stdin.on("data",d=>s+=d).on("end",()=>{
        try { const j=JSON.parse(s); console.log(j?.data?.commit ?? j?.commit ?? j?.data?.version ?? j?.version ?? ""); }
        catch { console.log(""); }
      });')"
    last="${live:-"(health responded without a commit field)"}"
    if [[ -n "$live" && ( "$sha" == "$live"* || "$live" == "$sha"* ) ]]; then
      echo "✅ $url is serving $live"; exit 0
    fi
  fi
  echo "…waiting (live: $last, want: ${sha:0:7})"
  sleep 10
done
echo "::error::Timed out after ${timeout}s waiting for $url to serve ${sha:0:7} (last seen: $last)"
exit 1
