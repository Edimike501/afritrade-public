# AfriTrade Connect

B2B marketplace + simple logistics layer for intra-African trade (Nigeria, South Africa, Ghana).
**Stage:** academic capstone MVP · **Team:** solo · **Budget:** zero infrastructure cost.

> Product docs live in [`docs/product/`](docs/product) (PRD, TRD, App Flow, Backend Schemas, Implementation Plan).
> What is and isn't in this phase: [`SCOPE.md`](SCOPE.md). Unresolved decisions: [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md).

## Stack

| Layer    | Choice                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------- |
| Monorepo | pnpm workspaces + Turborepo                                                                          |
| API      | NestJS modular monolith · Prisma · PostgreSQL · Redis · JWT + bcrypt · Zod validation · OpenAPI / Swagger (`/api/docs`) |
| Web      | Next.js (App Router, Port 3030) — public marketplace, buyer & supplier dashboards, Trust Center       |
| Admin    | Next.js (App Router, Port 3031) — platform operations, KYB review queue, logistics, orders oversight, users group |
| Shared   | `packages/shared` — Zod schemas, enums, order state machine, BigInt minor-unit money math             |
| UI       | `packages/ui` (`@afritrade/ui`) — Shared Tailwind v4 tokens, shadcn/ui design system primitives, Lucide icons (`lucide-react`) |
| Hooks    | `packages/hooks` (`@afritrade/hooks`) — 3-tier TanStack Query domain hooks & validated client API    |
| Payments | `PaymentProvider` interface → `MockPaymentProvider` (default, all currencies) / `Paystack` (live mode) |

## Quick start (local, no paid services)

```bash
pnpm install
cp apps/api/.env.example apps/api/.env          # edit JWT_ACCESS_SECRET
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
pnpm db:up                                     # local Postgres & Redis via Docker
pnpm --filter @afritrade/shared build          # build shared package once
pnpm migrate:dev -- --name init                # creates the first migration + tables
pnpm seed                                      # countries, currencies, admin, 12 suppliers, 120 products, partners
pnpm dev                                       # API :4040  ·  Web :3030  ·  Admin :3031
```

No Docker? Create a free Postgres on Neon or Supabase and paste its URL into `DATABASE_URL`.

### Demo accounts (after `pnpm seed`)

| Role     | Login                                                                                                    |
| -------- | -------------------------------------------------------------------------------------------------------- |
| Admin    | `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env` (default `admin@afritrade.test` / `ChangeMe123!`) |
| Buyer    | `buyer@afritrade.test` / `Password123!`                                                                    |
| Supplier | `<name>@supplier.afritrade.test` / `Password123!` (e.g. `lagos-agro-exports-ltd@supplier.afritrade.test`)  |

New supplier sign-ups start in KYB `PENDING` — approve them from the admin KYB queue.

## Demo script (the full trade journey)

1. Register as **Supplier** → submit business details → status `PENDING`.
2. Log in as **Admin** → KYB queue → approve.
3. Supplier lists a product (KYB gate is enforced by the API).
4. Register/log in as **Buyer** → Marketplace → product → **Place order & pay** (mock = instant).
5. **Admin** → All orders → open the order → assign a logistics partner → advance status (Picked up → In transit → Customs → Delivered).
6. Buyer and supplier both see the updated status on their order pages.

## Where Phase 1 plugs in

| Phase 1 item              | Plug-in point                                                  | Change needed                           |
| ------------------------- | -------------------------------------------------------------- | --------------------------------------- |
| Real Paystack NGN         | `PAYMENT_PROVIDER=paystack` + `PAYSTACK_SECRET_KEY`            | Config only (adapter already written)   |
| Flutterwave / others      | New class implementing `PaymentProvider`                       | One file + one line in `PaymentsModule` |
| Escrow                    | Add hold/release to `PaymentProvider` + state to `Payment`     | Extend interface; `Payment` shape stays |
| Carrier APIs              | Replace `LogisticsService.updateShipment` with webhook/adapter | Schema + UI unchanged                   |
| New country / currency    | Insert rows in `countries` / `currencies` (seed or admin tool) | Data only — no code change              |
| Team content/design edits | `apps/web/src/config/site.ts` + tokens at top of `globals.css` | Later swap config for a DB table        |

## Useful commands
 
```bash
pnpm typecheck && pnpm lint && pnpm test     # all workspaces via Turbo
pnpm run openapi:generate                     # export OpenAPI spec to docs/openapi.json
pnpm prepush                                 # run full pre-push verification (turbo + policy + migrations)
pnpm policy                                  # check compliance with RULES.md and AGENTS.md
pnpm --filter api exec prisma studio         # browse the DB
pnpm clean                                   # remove dist/.next/.turbo (asks before node_modules)
```
