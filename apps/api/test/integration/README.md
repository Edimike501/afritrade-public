Integration tests (`*.int-spec.ts`) run against a real Postgres built from zero by replaying every migration.
Add flow tests here or next to the module, e.g. `src/modules/payments/payments.int-spec.ts`:
 - pay every currency (NGN, ZAR, GHS, USD) -> SUCCESS via the mock provider
 - double-submitted pay request -> exactly ONE ledger entry
 - already-paid order rejects a second payment
 - no admin route can move an order into/out of a payment state
Use `openDb()` / `truncateAll()` from `test/helpers/db.ts` in beforeEach.
