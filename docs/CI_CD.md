# AfriTrade Connect: Dev, Testing, CI/CD and Safe Migrations

Zero paid services: GitHub Actions + service containers, Neon free (branching), Render free (API), Vercel free (web/admin), Upstash/Docker Redis.
Update `docs/INFRA.md` and `ARCHITECTURE.md` with this in the same PR (RULES §17).

## 0. Assumptions to confirm (names I could not see)

| Assumption                                                                                              | If different                                                                    |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Workspaces: `api`, `web`, `admin`, `@afritrade/shared`, `@afritrade/hooks`, `@afritrade/ui`             | edit the matrix in `ci.yml`, `jest.config.js`, `SHARED_PKG` in `verify-prod.sh` |
| `apps/admin` may not exist yet (README says admin lives in web; ARCHITECTURE says `apps/admin`)         | every script skips a missing app                                                |
| Prisma schema at `apps/api/prisma/` ; root `.nvmrc` = `24`; `packageManager` set in root `package.json` |                                                                                 |
| `GET /api/v1/health` returns the commit (`RENDER_GIT_COMMIT`) as `commit` (top level or under `data`)   | add it: it powers wait-for-version and the smoke test                           |
| Auth cookie is named `refreshToken` (RULES §18)                                                         | `smoke-test.mjs`                                                                |
| Pages probed: web `/ /marketplace /login /register`, admin `/ /login`                                   | override with `WEB_PAGES=... ADMIN_PAGES=... pnpm verify:prod`                  |

## 1. Run the dev server

```bash
pnpm install
cp apps/api/.env.example apps/api/.env && cp apps/web/.env.example apps/web/.env.local   # + apps/admin
pnpm db:up                                   # Postgres 16 + Redis 7 (docker compose, --wait) + creates afritrade_test / afritrade_smoke
pnpm --filter @afritrade/shared build        # once (shared is consumed from dist by the API)
pnpm migrate:dev -- --name init              # only for NEW schema changes; commits to apps/api/prisma/migrations
pnpm seed
pnpm dev                                     # turbo: API :4040, web :3030, admin :3031
```

Single app: `pnpm --filter api dev`. Reset everything: `pnpm db:reset`. Redis is required (auth rotation). `migrate:dev` is for your laptop only; no other stage ever runs it.

## 2. What to run locally, in order

| Command                                      | Needs Docker | Runs                                                                                     | When                                |
| -------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------- | ----------------------------------- |
| `git push` (husky) → `pnpm prepush`          | no           | lint + typecheck + unit tests for **affected** workspaces, policy checks, migration lint | automatic                           |
| `pnpm test` / `pnpm --filter api test:watch` | no           | unit tests per workspace (turbo-cached)                                                  | while coding                        |
| `pnpm test:global` / `pnpm test:watch`       | no           | ONE Jest run over every workspace (`projects`)                                           | global trigger                      |
| `pnpm test:cov`                              | no           | unit + coverage thresholds                                                               | before PR                           |
| `pnpm test:integration`                      | yes          | replays all migrations from zero on `afritrade_test`, then DB tests                      | before PR if you touched API/schema |
| `pnpm db:check`                              | yes          | migration safety lint + schema drift check                                               | after any schema change             |
| `pnpm verify:prod --quick`                   | yes          | production build + boot against a fresh DB + smoke suite                                 | before merging to `staging`         |
| `pnpm verify:prod`                           | yes          | all of the above + policy/lint/typecheck/tests                                           | before promoting to production      |
| `pnpm verify`                                | yes          | whole ladder in one command                                                              | pre-PR gold standard                |

## 3. Verify production locally (`scripts/verify-prod.sh`)

Kept from your script: `.nvmrc` check, frozen lockfile, "fresh clone" wipe, build exactly as Render (`node dist/main.js`) and Vercel (`next start`), shared package loads as CJS **and** ESM, port checks, log tail on failure.
Changed for this project:

- The API needs Postgres + Redis, so it **replays every migration from zero on `afritrade_smoke` and seeds** before booting (proves migrations + seed in prod mode).
- `.env.smoke` files are **generated from each `.env.example`** (`scripts/ci/make-smoke-env.sh`), so they can't drift from `env.validation.ts`. Same generator in CI and locally.
- Hard guards: only a local DB whose name ends in `_smoke/_test/_ci/_shadow` (`scripts/lib/db-guard.cjs`), `PAYMENTS_MODE=simulated`, no `sk_live_`.
- Probing moved to `scripts/ci/smoke-test.mjs`, **the same suite later run against staging and production**: health + deployed commit, reference data, domain error codes (no `*Exception` names), CORS incl. `Allow-Credentials`, pages + real 404s, and (local/staging) the full auth flow: cookie flags `HttpOnly; SameSite=Strict; Secure; Path=/api/v1/auth/refresh`, JWT ≤ 15 min, rotation, **reuse detection burns the family**. `Secure` only appears under `NODE_ENV=production`, which is exactly why this must run in prod mode. Production smoke is read-only and the script refuses `--auth` there.

## 4. Pipelines: separated concerns

```
feature/*  --PR-->  staging  ==auto==>  (CD Staging)  --manual-->  (CD Production)  --> main
   CI                 CI                 Continuous Deployment       Continuous Delivery
```

| File                | Concern                                        | Trigger                                     | Does                                                                                                                                                                                     |
| ------------------- | ---------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`            | **Continuous Integration**                     | PR, `feature/**` push, called by CD Staging | changes → static (policy, lint, typecheck) ∥ unit matrix per package ∥ database (migration lint, drift, integration, seed) ∥ verify-prod → **`CI passed`** gate. No secrets, no deploys. |
| `cd-staging.yml`    | **Continuous Deployment** (automatic)          | push to `staging`                           | CI → migrate staging → deploy API (wait for commit) → web/admin → smoke incl. auth flow. No human.                                                                                       |
| `cd-production.yml` | **Continuous Delivery** (human decides _when_) | manual dispatch + typed `DEPLOY`            | pin staging SHA → require green staging run for that SHA → approval → rehearse + snapshot → migrate → deploy → read-only smoke → fast-forward `main` + GitHub release                    |
| `_release.yml`      | shared mechanics                               | called by both                              | identical steps for staging and production, config from GitHub Environments                                                                                                              |

Why production is _delivery_, not _deployment_: it applies DB migrations to the system of record and the platform's rules treat money paths as high-risk. To go fully automatic, trigger `cd-production` from `workflow_run` of CD Staging and remove `approve`. Keep the rehearsal and snapshot.

Changes vs your old `deploy.yml`: split into reusable pieces (no 470-line file); per-environment config via **GitHub Environments** (same secret names in `staging` and `production`); frontends deploy **after** the API is live; staging always deploys all apps (a half-failed run can't leave a migrated DB with an old API); approval is a typed confirmation plus an optional reviewer gate on `production-approval`. `exclude-workflow-initiator-as-approver` was dropped because you are solo (add a second approver later).

### Setup checklist (one time)

1. Branches: `main` (protected, only updated by the pipeline) and `staging` (protected, require **`CI passed`**). Merge `cd-production.yml` into `main` once so the "Run workflow" button exists.
2. GitHub Environments: `staging`, `production` (secrets+vars below), `production-approval` (optional required reviewers; private repos need a paid plan for reviewers).
3. Repo secrets: `VERCEL_TOKEN`, `NEON_API_KEY`, `PROMOTE_TOKEN` (can bypass `main` protection). Repo vars: `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_WEB`, `VERCEL_PROJECT_ID_ADMIN`, `NEON_PROJECT_ID`.
4. Per environment: secrets `DATABASE_URL_DIRECT` (Neon **direct**, unpooled), `RENDER_DEPLOY_HOOK`, `SMOKE_BUYER_EMAIL`/`SMOKE_BUYER_PASSWORD` (staging only); vars `API_URL`, `WEB_URL`, `ADMIN_URL`, `NEON_PARENT_BRANCH` (the Neon branch that environment's DB lives on).
5. Render: set `RENDER_GIT_COMMIT`-based `commit` in `/health`; Vercel: set `NEXT_PUBLIC_API_URL` per environment (baked at build).

## 5. Database testing (the idea from your `deploy.yml`, adapted)

Your pipeline: throwaway DB per run → migrate from scratch → integration tests → always clean up → schema diff on the PR. Here:

| Idea                  | Implementation                                                                                                                                                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Throwaway DB per run  | CI **service containers** (`postgres:16-alpine`, `redis:7-alpine`): free, hermetic, no secrets, identical to `pnpm db:up`. (Neon branches are kept for the one thing containers can't do: real data, see §6.)                                                           |
| Migrate from scratch  | Jest `globalSetup` runs `scripts/db/reset.sh` (guard → reset → replay **all** migrations). A broken migration fails the suite.                                                                                                                                          |
| Integration tests     | `*.int-spec.ts`, `maxWorkers: 1`, real Postgres. Includes **policy-as-tests** (`test/integration/schema-sanity.int-spec.ts`): no float/decimal columns, `*Minor` = bigint, every table has a PK, ledger has `UNIQUE(reference,type)` and a block-UPDATE/DELETE trigger. |
| Schema diff on the PR | New migration SQL is written to the **job summary** by `check-migrations.mjs`; drift check fails if `schema.prisma` changed without a migration.                                                                                                                        |
| Always clean up       | Containers die with the job; the Neon rehearsal branch is deleted `if: always()` and also auto-expires.                                                                                                                                                                 |
| Seed proof            | CI seeds a fresh migrated DB; verify-prod seeds the smoke DB.                                                                                                                                                                                                           |

## 6. Safe Prisma migrations per stage

Rules: forward-only; **`migrate deploy` is the only command that touches a shared database**; migrations are immutable once merged; every migration must be backward compatible with the _previous_ app version (it runs before the new code is live): **expand → deploy → contract** across two releases.

| Stage       | What runs                                                                                                                                                                                                                                                                        | Protection                                                                                                                                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local       | `migrate:dev` (laptop DB only)                                                                                                                                                                                                                                                   | pre-push `check-migrations`; `db:check` (drift)                                                                                                                                                                             |
| CI          | reset + replay from zero, drift check, integration tests, seed                                                                                                                                                                                                                   | `check-migrations.mjs`: structure, **immutability vs base ref**, **destructive SQL needs `-- safe-migration: <reason>`** (DROP, type change, SET NOT NULL, RENAME, TRUNCATE, DELETE, `ADD COLUMN NOT NULL` without default) |
| verify-prod | replay from zero in prod mode on `afritrade_smoke`                                                                                                                                                                                                                               | `db-guard` (local + `_smoke` only)                                                                                                                                                                                          |
| Staging     | `migrate status` → `migrate deploy` → `migrate status` (direct connection)                                                                                                                                                                                                       | per-environment concurrency group; Prisma advisory lock; runs only after CI green                                                                                                                                           |
| Production  | everything staging does, **preceded by**: (1) Neon **snapshot branch** `pre-release/<sha>` (kept 7 days = rollback point), (2) **rehearsal** on a throwaway copy of production data, then `row-counts.mjs` fails if any table vanished or lost rows or a migration is unfinished | typed confirm + approval gate + green staging run for the exact SHA                                                                                                                                                         |

Rollback: Prisma has no down migrations. Fix forward with a new migration; for a bad data change, restore from the snapshot branch (point the app at it, or restore into production using Neon's branch restore). Check Neon's current free-plan limits (branch count, restore window); the snapshot expiry keeps you under them.
Add the ledger trigger in a migration (needed for the structural test):

```sql
-- safe-migration: adds a trigger only; no existing data touched
CREATE OR REPLACE FUNCTION forbid_ledger_mutation() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'payment ledger is append-only'; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER payment_ledger_append_only BEFORE UPDATE OR DELETE ON "PaymentLedgerEntry"
FOR EACH ROW EXECUTE FUNCTION forbid_ledger_mutation();
```

## 7. Jest layout (strict, per package, app and global)

```
jest.config.base.js        shared factory: SWC, workspace aliases to package SRC, thresholds, coverage rules
jest.config.js             GLOBAL: `projects` over every workspace  -> pnpm test:global | test:watch
packages/{shared,hooks,ui}/jest.config.js   node / jsdom
apps/{web,admin}/jest.config.js             next/jest + jsdom + Testing Library
apps/api/jest.config.js                     unit  (*.spec.ts)
apps/api/jest.integration.config.js         DB    (*.int-spec.ts)  -> real Postgres, runInBand
```

- **Individual:** `pnpm --filter <pkg> test|test:cov|test:watch`. **All, cached/parallel:** `pnpm test` (turbo). **All, one process:** `pnpm test:global`.
- **Strict:** `THRESHOLDS` in `jest.config.base.js`: 90% on `payments`, 85% on `orders`, 95% on `money.ts` / `enums.ts`, 50% global floor. Ratchet the floor up; never down. Every key must point at a real path or Jest fails with "coverage data not found".
- SWC compiles tests quickly; **types are enforced by `pnpm typecheck`**, so keep spec files in your tsconfig `include`.
- Policy checks (`pnpm policy`, runs in pre-push and CI) enforce AGENTS/RULES mechanically: no `localStorage`/`sessionStorage`, no fetching in `.tsx`, no exception-name error codes, no `class-validator`, every module has a `.spec.ts`, no tracked `.env`, no live keys. Escape hatch: `// policy-allow: <reason>`.

## 8. Expected to be RED until the scaffold review items land (this is intended)

| Check                                          | Turns green when                                   |
| ---------------------------------------------- | -------------------------------------------------- |
| `policy`: localStorage in `api-client.ts`      | auth moves to in-memory token + cookie (RULES §18) |
| `policy`: `code: exception.name`               | `ApiErrorCode` filter (SCAFFOLD item 11)           |
| `schema-sanity`: no decimals / `*Minor` bigint | money rewrite (items 4–5)                          |
| `schema-sanity`: ledger table, unique, trigger | payments ledger (items 3, 9)                       |
| `check-migrations`: no migrations              | generate `init` **after** items 4–5                |
| smoke: `AUTH_TOKEN_INVALID` on reuse           | auth module reuse-detection per RULES §18          |

## 9. Caveats worth knowing

1. **Cross-site cookie trap (not detectable locally).** `SameSite=Strict` refresh cookies are not sent from `*.vercel.app` to `*.onrender.com` (different sites). Fix before deploying: proxy `/api/v1/*` through Next rewrites (same origin) or put web and API on one registrable domain (`app.` / `api.`).
2. Vercel with `--cwd apps/web` needs the project's _Root Directory_ setting empty.
3. Free tiers cold-start: `wait-for-version.sh` waits up to 10 min; the smoke suite waits up to 3 min for health.
4. Prisma 6 vs 7: the kit avoids version-specific flags (`reset.sh` detects `--skip-seed`, drift uses `migrate dev --create-only`). Prisma 7 also needs `prisma.config.ts` to load env.
5. `scripts/*.sh` need bash (use WSL on Windows).
