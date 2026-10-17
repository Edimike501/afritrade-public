#!/usr/bin/env bash
# Mechanical enforcement of RULES.md / AGENTS.md. Fast (git grep), runs in pre-push and CI.
# Escape hatch for a justified exception: add `// policy-allow: <reason>` on the same line.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

FAILED=0
fail() { printf '\033[1;31m❌ %s\033[0m\n' "$1"; FAILED=1; }
ok()   { printf '\033[1;32m✅ %s\033[0m\n' "$1"; }
warnmsg() { printf '\033[1;33m⚠️  %s\033[0m\n' "$1"; }

SRC=(':(glob)apps/**/src/**/*.ts' ':(glob)apps/**/src/**/*.tsx' ':(glob)packages/**/src/**/*.ts' ':(glob)packages/**/src/**/*.tsx'
     ':(exclude,glob)**/*.spec.*' ':(exclude,glob)**/*.int-spec.*' ':(exclude,glob)**/*.test.*' ':(exclude,glob)**/test/**')

scan() { # scan <label> <regex> <pathspec...>  -> fails if any non-allowed hit
  local label="$1" re="$2"; shift 2
  local hits
  hits="$(git grep --untracked -nE -e "$re" -- "$@" 2>/dev/null | grep -v 'policy-allow' || true)"
  if [[ -n "$hits" ]]; then fail "$label"; echo "$hits" | sed 's/^/     /'; else ok "$label"; fi
}

# RULES §18 / AGENTS: tokens never in Web Storage
scan "No localStorage/sessionStorage in app code (RULES §18)" '\b(localStorage|sessionStorage)\b' "${SRC[@]}"

# RULES §19 / AGENTS: components never fetch directly
scan "No direct fetching in .tsx components (RULES §19)" '(\bapi\.(get|post|put|patch|delete)\(|\bfetch\(|\buseAsync\b)' \
  ':(glob)apps/**/src/**/*.tsx' ':(glob)packages/ui/src/**/*.tsx' ':(exclude,glob)**/*.spec.*' ':(exclude,glob)**/*.test.*'

# RULES §10/§13: error codes are domain codes, never class names / generic strings
scan "No exception class names or generic strings as error codes (RULES §11)" \
  '(code:\s*exception\.name|code:\s*["'"'"'](ERROR|BAD_REQUEST|FAILED|error|failed)["'"'"']|code:\s*["'"'"'][A-Za-z]+Exception["'"'"'])' \
  ':(glob)apps/api/src/**/*.ts' ':(glob)packages/shared/src/**/*.ts' ':(exclude,glob)**/*.spec.*'

# AGENTS: new endpoints use Zod DTOs, not class-validator
scan "No class-validator decorators (RULES §10a)" 'from ["'"'"']class-validator["'"'"']' ':(glob)apps/api/src/**/*.ts'

# AGENTS: every NestJS module has its own spec
missing=""
for d in apps/api/src/modules/*/; do
  [[ -d "$d" ]] || continue
  if ! find "$d" -name '*.spec.ts' -print -quit | grep -q .; then missing+=" ${d%/}"; fi
done
if [[ -n "$missing" ]]; then fail "Every NestJS module needs a .spec.ts (AGENTS.md). Missing in:"; for m in $missing; do echo "     $m"; done; else ok "Every NestJS module has a spec"; fi

# Secrets / env hygiene
tracked_env="$(git ls-files | grep -E '(^|/)\.env($|\.)' | grep -Ev '\.env(\..+)?\.example$' || true)"
if [[ -n "$tracked_env" ]]; then fail "Env files are tracked by git:"; echo "$tracked_env" | sed 's/^/     /'; else ok "No env files tracked"; fi
scan "No live payment keys in the repo" '(sk_live_|pk_live_)' ':(glob)**' ':(exclude,glob)scripts/**' ':(exclude,glob)docs/**' ':(exclude,glob).github/**'

# RULES §1 (heuristic => warning only): float math on money
if git grep --untracked -nE -e 'Number\([^)]*(amount|price|total)[^)]*\)\s*\*|Math\.round\(Number\(' -- "${SRC[@]}" 2>/dev/null | grep -v policy-allow | grep -q .; then
  warnmsg "Possible float money arithmetic (RULES §1). Review:"
  git grep --untracked -nE -e 'Number\([^)]*(amount|price|total)[^)]*\)\s*\*|Math\.round\(Number\(' -- "${SRC[@]}" | grep -v policy-allow | sed 's/^/     /'
fi

exit $FAILED
