# Scripts Architecture & Reference Guide

This document provides a comprehensive technical reference for every script in the `scripts/` directory of the AfriTrade Connect monorepo. It details their roles across local development, continuous integration (CI), database lifecycle management, and production release verification.

---

## 1. Architecture Overview

The `scripts/` directory provides automated safety rails, reproducible release rehearsals, policy enforcement, and database safeguards.

```mermaid
graph TD
    subgraph DeveloperWorkflows["Developer & Git Hooks"]
        Dev["Developer Workflow"] -->|pnpm clean| Clean["clean.mjs"]
        Dev -->|pnpm db:up| EnsureDB["ensure-dbs.sh"]
        Dev -->|pnpm prepush / git commit| PolicyHook["policy-checks.sh"]
        Dev -->|pnpm prepush| MigCheckHook["check-migrations.mjs"]
        Dev -->|pnpm verify:prod| VerifyProd["verify-prod.sh"]
    end

    subgraph ReleaseRehearsal["Production Verification Pipeline (verify-prod.sh)"]
        VerifyProd --> Preflight["Preflight & Safety Checks"]
        Preflight --> DBGuard["db-guard.cjs"]
        Preflight --> MakeSmokeEnv["make-smoke-env.sh"]
        VerifyProd --> Build["Turbo Build (API, Web, Admin)"]
        VerifyProd --> DBReset["reset.sh"]
        DBReset --> DBGuard
        VerifyProd --> Boot["Production Boot (dist/main.js & next start)"]
        VerifyProd --> SmokeTest["smoke-test.mjs --auth"]
    end

    subgraph CIWorkflows["GitHub Actions CI/CD"]
        CI["CI Runner"] --> PolicyCheckCI["policy-checks.sh"]
        CI --> DriftCheckCI["drift-check.sh"]
        CI --> MigCheckCI["check-migrations.mjs"]
        CI --> WaitForVer["wait-for-version.sh"]
        CI --> SmokeRemote["smoke-test.mjs (Staging / Production)"]
    end
```

---

## 2. Directory Structure

```text
scripts/
├── clean.mjs                 # Monorepo build artifact and dependency cleaner
├── verify-prod.sh            # Complete local production build, boot, and smoke probe
├── ci/
│   ├── check-migrations.mjs  # Migration safety, immutability, and expand-only validator
│   ├── make-smoke-env.sh     # Generates apps/*/.env.smoke with dummy sandbox keys
│   ├── policy-checks.sh      # Static analysis scanner enforcing RULES.md / AGENTS.md
│   ├── smoke-test.mjs        # Production and local health, security, and auth probe
│   └── wait-for-version.sh   # Health endpoint poller for zero-downtime CD deployments
├── db/
│   ├── drift-check.sh        # Detects unmigrated changes in prisma/schema.prisma
│   ├── ensure-dbs.sh         # Idempotently creates local Postgres databases
│   ├── reset.sh              # Safely wipes and replays migrations on throwaway DBs
│   └── row-counts.mjs        # Snapshot & comparison tool verifying zero data loss
└── lib/
    └── db-guard.cjs          # Safety barrier preventing destructive actions on real DBs
```

---

## 3. Root Scripts

### 3.1 [`scripts/clean.mjs`](scripts/clean.mjs)

- **Command:** `pnpm clean`
- **Flags:**
  - `-y` / `--yes`: Skip interactive confirmation prompts.
  - `--turbo`: Clean only `.turbo` cache folders.
  - `--node-modules`: Clean only `node_modules` folders.
  - `--dry-run`: Log what would be removed without deleting files.

#### Purpose & Logic

Scans the entire monorepo to remove stale build outputs, caches, and dependency trees without traversing `.git` or `.agents`.

```mermaid
flowchart LR
    Start([pnpm clean]) --> Step1["1. Auto-remove dist/ and .next/"]
    Step1 --> Step2{"2. Found .turbo?<br>Confirm deletion"}
    Step2 -- Yes --> DelTurbo["Delete .turbo directories"]
    Step2 -- No --> Step3{"3. Found node_modules?<br>Confirm deletion"}
    DelTurbo --> Step3
    Step3 -- Yes --> DelNM["Delete node_modules directories"]
    Step3 -- No --> Done([Complete])
    DelNM --> Done
```

#### Example Usage

```bash
# Preview what would be deleted
pnpm clean -- --dry-run

# Wipe everything non-interactively
pnpm clean -y

# Clear build outputs and Turborepo cache only
pnpm clean --turbo -y
```

---

### 3.2 [`scripts/verify-prod.sh`](scripts/verify-prod.sh)

- **Command:** `pnpm verify:prod` (full flow) or `pnpm verify:prod --quick` (skips lint/typecheck/unit tests).
- **Requirements:** Local Docker services running (`pnpm db:up`).

#### Purpose & Logic

Reproduces the exact production build and deployment behavior of cloud hosts (Render for NestJS API, Vercel for Next.js frontends) locally against a throwaway database (`afritrade_smoke`).

```mermaid
sequenceDiagram
    autonumber
    participant V as verify-prod.sh
    participant G as db-guard.cjs
    participant B as turbo build
    participant DB as Postgres (afritrade_smoke)
    participant S as Production Processes
    participant P as smoke-test.mjs

    V->>G: Verify DB URL is local & ends in _smoke
    G-->>V: Approved
    V->>B: Compile apps with .env.smoke (baking NEXT_PUBLIC_*)
    V->>DB: Replay migrations from zero & seed
    V->>S: Boot API (node dist/main.js) & Web (next start)
    V->>P: Execute smoke test suite (--auth)
    P-->>V: All probes passed
    V->>S: Kill background server processes & exit 0
```

#### Key Safeguards

1. **Node Version Verification:** Compares local Node version against `.nvmrc`.
2. **Database Protection:** Calls `db-guard.cjs` on `DATABASE_URL` before running any destructive DB operations.
3. **No Live Secrets:** Checks `.env.smoke` to ensure no live payment keys (`sk_live_`, `FLWSECK-`) are present.
4. **Port Availability:** Asserts ports `4040`, `3030`, and `3031` are free before booting.
5. **Dual Module Loading Test:** Ensures `@afritrade/shared` can be loaded via CommonJS `require()` by NestJS and via ESM `import` by Next.js.

---

## 4. CI Scripts (`scripts/ci/`)

### 4.1 [`scripts/ci/check-migrations.mjs`](scripts/ci/check-migrations.mjs)

- **Command:** `node scripts/ci/check-migrations.mjs` (invoked by `pnpm db:check` and CI).
- **Environment Variables:** `BASE_REF` (default: `origin/staging` or `origin/main`), `GITHUB_ACTIONS`.

#### Purpose & Logic

Enforces database migration safety and zero-downtime expand/contract rules:

1. **Format Validation:** Migration directories must strictly match `^\d{14}_[a-z0-9_]+$` (14-digit timestamp + snake_case) with non-empty `migration.sql`.
2. **Immutability Check:** Uses `git diff` against the merge-base of `BASE_REF`. Any modification or deletion of an already-merged migration fails the build.
3. **Destructive SQL Detection:** Detects breaking queries that lock tables or drop data:
   - `DROP TABLE`, `DROP COLUMN`, `DROP TYPE`, `DROP SCHEMA`
   - `ALTER COLUMN ... TYPE`
   - `SET NOT NULL` on existing columns
   - `RENAME`
   - `TRUNCATE`, `DELETE FROM`
   - `ADD COLUMN ... NOT NULL` without `DEFAULT`

#### Safe Migration Override

If a destructive change is intentional (e.g. contracting an unused column in a multi-phase deploy), you must include a reason comment with at least 10 characters:

```sql
-- safe-migration: column deprecated in v1.2 and verified unused by running instances
ALTER TABLE "users" DROP COLUMN "legacy_field";
```

---

### 4.2 [`scripts/ci/make-smoke-env.sh`](scripts/ci/make-smoke-env.sh)

- **Command:** `bash scripts/ci/make-smoke-env.sh`
- **Output:** `apps/api/.env.smoke`, `apps/web/.env.smoke`, `apps/admin/.env.smoke`

#### Purpose & Logic

Reads each application's `.env.example` file and generates `.env.smoke` with guaranteed dummy sandbox credentials:

- **Database:** `postgresql://postgres:postgres@localhost:5432/afritrade_smoke?schema=public`
- **Redis:** `redis://localhost:6379/2` (isolated database index 2)
- **Payments Mode:** `simulated`
- **Payment Keys:** `sk_test_smoke_dummy`, `pk_test_smoke_dummy`, `FLWSECK_TEST-smoke_dummy`
- **JWT Secret:** High-entropy 46-character dummy secret (`smoke-test-secret-minimum-32-characters-long-0000`)
- **Shell-sourceable guarantee:** Verifies each output file can be parsed with `bash -c "source ..."` for consistent usage in shell scripts and `node --env-file`.

---

### 4.3 [`scripts/ci/policy-checks.sh`](scripts/ci/policy-checks.sh)

- **Command:** `pnpm policy` (triggered via git `prepush` and CI).

#### Purpose & Logic

High-speed static analysis gate enforcing core repo architecture standards using `git grep`:

| Policy Area              | Rule Source     | Grep Pattern / Check                                             | Permitted Override          |
| :----------------------- | :-------------- | :--------------------------------------------------------------- | :-------------------------- |
| **Token Storage**        | `RULES.md` §18  | `\b(localStorage\|sessionStorage)\b`                             | `// policy-allow: <reason>` |
| **Direct Fetching**      | `RULES.md` §19  | `api.(get\|post...)`, `fetch(`, `useAsync` in `.tsx`             | `// policy-allow: <reason>` |
| **Error Code Taxonomy**  | `RULES.md` §11  | Disallows `ERROR`, `BAD_REQUEST`, `*Exception`                   | `// policy-allow: <reason>` |
| **Validation Library**   | `RULES.md` §10a | Disallows `from "class-validator"`                               | `// policy-allow: <reason>` |
| **Module Test Coverage** | `AGENTS.md`     | Every folder in `apps/api/src/modules/` must have a `.spec.ts`   | None                        |
| **Secret Leakage**       | `RULES.md` §9   | Disallows tracked `.env*` files or `sk_live_`/`pk_live_` strings | None                        |
| **Float Math on Money**  | `RULES.md` §1   | Warns on `Number(amount) * ...` or `Math.round(Number(...))`     | `// policy-allow: <reason>` |

---

### 4.4 [`scripts/ci/smoke-test.mjs`](scripts/ci/smoke-test.mjs)

- **Command:** `node scripts/ci/smoke-test.mjs --env=local|staging|production [--auth]`
- **Environment Variables:** `API_URL`, `WEB_URL`, `ADMIN_URL`, `EXPECTED_COMMIT`, `WEB_PAGES`.

#### Purpose & Logic

Performs live behavioral tests against running environments. In production, write operations are strictly blocked (`--auth` is rejected if `--env=production`).

```mermaid
flowchart TD
    Start([smoke-test.mjs]) --> HealthCheck["1. GET /api/v1/health (assert 200 & git commit)"]
    HealthCheck --> RefData["2. Reference Data (>=3 countries, >=4 currencies)"]
    RefData --> Catalog["3. GET /api/v1/products (public catalog responds)"]
    Catalog --> SecChecks["4. Error Taxonomy & Auth Rejection (401 on /users/me, 404 on unknown)"]
    SecChecks --> CORS["5. CORS & Credentials Preflight on /auth/refresh"]
    CORS --> Frontends["6. Frontend Route Probes (200 OK, no localhost leak in HTML)"]
    Frontends --> AuthCheck{"Is --auth enabled?<br>(local/staging only)"}
    AuthCheck -- No --> Finish([All Passed])
    AuthCheck -- Yes --> FlowLogin["7. POST /auth/login (check HttpOnly, SameSite=Strict cookie)"]
    FlowLogin --> FlowJWT["8. Verify short-lived JWT <= 15 min & call /users/me"]
    FlowJWT --> FlowRotate["9. POST /auth/refresh (assert new refresh token issued)"]
    FlowRotate --> FlowReplay["10. Replay spent token -> assert 403 & burn token family"]
    FlowReplay --> Finish
```

---

### 4.5 [`scripts/ci/wait-for-version.sh`](scripts/ci/wait-for-version.sh)

- **Command:** `bash scripts/ci/wait-for-version.sh <health-url> <expected-sha> [timeout-seconds=600]`

#### Purpose & Logic

Polls an API `/health` endpoint until the deployed instance confirms it is serving the expected Git commit hash. Accounts for cold starts on free hosting tiers (e.g. Render).

```bash
# Example CI usage:
bash scripts/ci/wait-for-version.sh "https://api-staging.afritrade.com/api/v1/health" "$GITHUB_SHA" 300
```

---

## 5. Database Scripts (`scripts/db/`)

### 5.1 [`scripts/db/drift-check.sh`](scripts/db/drift-check.sh)

- **Command:** `pnpm db:check` (calls `check-migrations.mjs` and `drift-check.sh`).
- **Requirements:** `DATABASE_URL` pointing to a local test DB.

#### Purpose & Logic

Verifies that `apps/api/prisma/schema.prisma` does not have changes that lack a migration file:

1. Resets the local throwaway database using [scripts/db/reset.sh](scripts/db/reset.sh).
2. Runs `prisma migrate dev --create-only --name ci_drift_check`.
3. If a new migration folder is created, unmigrated changes exist. The script prints the unapplied SQL diff, deletes the temporary migration folder, and exits with code 1.

---

### 5.2 [`scripts/db/ensure-dbs.sh`](scripts/db/ensure-dbs.sh)

- **Command:** `pnpm db:up` (runs automatically after `docker compose up`).

#### Purpose & Logic

Connects to the local PostgreSQL container via Docker and ensures the three core development databases exist:

1. `afritrade` — Main local development database.
2. `afritrade_test` — Integration and unit test database.
3. `afritrade_smoke` — Throwaway database for `verify:prod` release rehearsals.

---

### 5.3 [`scripts/db/reset.sh`](scripts/db/reset.sh)

- **Command:** `bash scripts/db/reset.sh`
- **Requirements:** `DATABASE_URL` must be set.

#### Purpose & Logic

Executes `prisma migrate reset --force` to completely drop all tables and replay all migrations from scratch.

#### Safety Mechanism

Before triggering the reset, it calls [scripts/lib/db-guard.cjs](scripts/lib/db-guard.cjs). If `DATABASE_URL` does not target an approved local test database, execution halts immediately before any SQL command is sent.

---

### 5.4 [`scripts/db/row-counts.mjs`](scripts/db/row-counts.mjs)

- **Command:**
  ```bash
  # 1. Snapshot table counts before migrating
  pnpm --filter api exec node ../../scripts/db/row-counts.mjs snapshot pre-mig.json

  # 2. Replay/apply migrations
  pnpm migrate:deploy

  # 3. Verify zero data loss
  pnpm --filter api exec node ../../scripts/db/row-counts.mjs compare pre-mig.json
  ```

#### Purpose & Logic

Guarantees zero data loss during migration rehearsals on staging or production shadow copies:

- Queries PostgreSQL `information_schema.tables` and retrieves the exact `count(*)` of every table.
- On `compare`, verifies:
  1. No tables were dropped.
  2. No table row count decreased.
  3. No entries in `_prisma_migrations` have `finished_at IS NULL` or `rolled_back_at IS NOT NULL`.

---

## 6. Shared Library (`scripts/lib/`)

### 6.1 [`scripts/lib/db-guard.cjs`](scripts/lib/db-guard.cjs)

- **Type:** CommonJS Module & CLI tool.
- **Usage:**
  - CLI: `node scripts/lib/db-guard.cjs "$DATABASE_URL"`
  - Module: `const { assertSafeDatabaseUrl } = require("./db-guard.cjs");`

#### Purpose & Logic

The single authoritative safeguard protecting persistent databases from destructive operations.

```mermaid
flowchart TD
    Input["DATABASE_URL"] --> HostCheck{"Hostname is in<br>localhost, 127.0.0.1,<br>::1, postgres?"}
    HostCheck -- No --> Abort1["❌ Reject: Only local hosts allowed"]
    HostCheck -- Yes --> NameCheck{"Database name ends in<br>_test, _smoke, _ci, or _shadow?"}
    NameCheck -- No --> Abort2["❌ Reject: Database name must have throwaway suffix"]
    NameCheck -- Yes --> Allow["✅ Safe throwaway database: Proceed"]
```

---

## 7. Command Reference Matrix

| Script               | Path                                                                                                                             | `package.json` Shortcut                   | Primary Workflow               |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------- | :----------------------------- |
| **Clean**            | [scripts/clean.mjs](scripts/clean.mjs)                             | `pnpm clean`                              | Developer housekeeping         |
| **Verify Prod**      | [scripts/verify-prod.sh](scripts/verify-prod.sh)                   | `pnpm verify:prod`                        | Pre-merge release rehearsal    |
| **Policy Checks**    | [scripts/ci/policy-checks.sh](scripts/ci/policy-checks.sh)         | `pnpm policy`                             | Pre-push & CI validation       |
| **Check Migrations** | [scripts/ci/check-migrations.mjs](scripts/ci/check-migrations.mjs) | `pnpm db:check`                           | Migration safety gate          |
| **Make Smoke Env**   | [scripts/ci/make-smoke-env.sh](scripts/ci/make-smoke-env.sh)       | Executed by `verify:prod`                 | Sandbox config generation      |
| **Smoke Test**       | [scripts/ci/smoke-test.mjs](scripts/ci/smoke-test.mjs)             | `pnpm smoke-test`                         | End-to-end probing             |
| **Wait For Version** | [scripts/ci/wait-for-version.sh](scripts/ci/wait-for-version.sh)   | CD pipeline                               | Deployment health polling      |
| **Drift Check**      | [scripts/db/drift-check.sh](scripts/db/drift-check.sh)             | `pnpm db:check`                           | Schema vs migration sync       |
| **Ensure DBs**       | [scripts/db/ensure-dbs.sh](scripts/db/ensure-dbs.sh)               | `pnpm db:up`                              | Docker Postgres initialization |
| **Reset DB**         | [scripts/db/reset.sh](scripts/db/reset.sh)                         | Executed by `drift-check` & `verify:prod` | Throwaway DB replay            |
| **Row Counts**       | [scripts/db/row-counts.mjs](scripts/db/row-counts.mjs)             | Direct CLI execution                      | Data preservation checks       |
| **DB Guard**         | [scripts/lib/db-guard.cjs](scripts/lib/db-guard.cjs)               | Shared library / CLI guard                | Destructive command interlock  |
