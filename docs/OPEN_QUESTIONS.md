# Open questions & scaffold assumptions

Things the scaffold had to decide or could not know. Confirm or change each — nothing here is final.

## Needs your input
1. **Real logistics partner names.** `apps/api/prisma/seed/data/logistics-partners.ts` contains `Partner N (replace)` placeholders. Put the real names/coverage there.
2. **Supplier order-status actions.** App Flow §2 mentions suppliers updating status ("Accepted", "Preparing"), but the order state machine (App Flow §5, schema enum) has no such states. The scaffold makes supplier order views **read-only** and keeps all transitions admin-driven. Decide: leave read-only, or add supplier states to the enum + state machine.
3. **Dashboards: one web app or two?** Docs describe one web app, so admin lives under `/admin` in `apps/web`. Splitting into `apps/admin` later is straightforward but adds a second free-tier deployment.

## Deliberate deviations from the docs (all small)
- **Validation uses Zod (`nestjs-zod`) instead of `class-validator`** so API and web share one schema source in `packages/shared`.
- **`Payment.currencyId` added** (TRD §3 says Payment stores currency; the schema listing omitted it).
- **Orders are created directly in `PAYMENT_PENDING`** (the transient `ORDER_PLACED` state is never user-visible); shipment row is created with the order.
- **A product's price currency is the supplier's choice; an order can only contain one currency** (the schema holds one currency per order). Mixed-currency carts are rejected with a clear message.
- **Seed prices use approximate fixed FX rates** (only to generate plausible local-currency prices).
- **No migration files are committed** — run `pnpm migrate:dev -- --name init` once against your database.

## Not verified yet
The scaffold was generated without network access, so `pnpm install`, `typecheck`, and the test suites have **not been run**.
Expect to fix a few small type/version issues on first run (see README quick start); report any and they are quick to resolve.
