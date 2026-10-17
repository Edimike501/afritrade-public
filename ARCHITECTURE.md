# Architecture

```
apps/web, apps/admin (Next.js) ──► @afritrade/hooks (TanStack Query) ──► @afritrade/ui (API Client)
                                                                               │
                                                                           REST /api/v1
                                                                               ▼
                                                      apps/api (NestJS modular monolith) ──► PostgreSQL
                                                                               │
                                                                               └──► Redis (Token Cache)
```

Shared contracts: `@afritrade/shared` (Zod schemas, domain enums, error codes, order state machine) consumed by all packages and apps.

## API modules (`apps/api/src/modules`)

| Module              | Responsibility                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `auth`              | Register (BUYER/SUPPLIER only), login, silent refresh, logout; short-lived access tokens (in-memory) + HttpOnly refresh token rotation & reuse detection via Redis |
| `users`             | `GET /users/me`, `PATCH /users/profile`, `GET /admin/users` (Admin Users Directory with attached supplier `BusinessProfile`)                                       |
| `geo`               | `countries`, `currencies` lookups; resolves ISO/currency codes → rows                                                                                              |
| `business-profiles` | Supplier operational business details editing (`PATCH /business-profile/me/details`), KYB submission/update (`PUT /business-profile/me/kyb`), Cloudflare R2 KYB document uploads & short-lived signed URLs, and admin review queue/decision |
| `catalog`           | Public browse; supplier product CRUD (KYB-gated)                                                                                                                   |
| `orders`            | Create order (+ shipment), role-scoped reads, shared order DTO                                                                                                     |
| `payments`          | `PaymentProvider` interface, mock + Paystack providers, provider selection                                                                                         |
| `logistics`         | Curated partner CRUD; manual shipment transitions (admin)                                                                                                          |
| `dashboard`         | One role-aware summary endpoint (`GET /dashboard/summary`)                                                                                                         |
| `health`            | `GET /health`                                                                                                                                                      |

Cross-cutting (`src/common`): global `JwtAuthGuard` (routes are protected by default; `@Public()` opts out),
`RolesGuard` + `@Roles()`, response-envelope interceptor, error filter. Rate limiting via `@nestjs/throttler` (stricter on `/auth`).

## Rules that keep the "swap later" promises true

1. **Roles & guards at the controller** — never trust the UI. KYB gating lives in `CatalogService.create`.
2. **One place picks the payment provider** — `PaymentsService.providerFor()`: non-live currency ⇒ mock; live ⇒ `PAYMENT_PROVIDER`.
3. **One state machine** — `ORDER_STATUS_TRANSITIONS` in `packages/shared`; API validates with it, admin UI renders from it.
4. **Order + Shipment status are written in one transaction** so views never drift.
5. **Money = `BigInt` in DB (integer minor units), safe integer `Money` object `{ amountMinor, currency }` across API boundary, never float.** Totals are summed per currency, never across currencies.
6. **Country/Currency are tables**, resolved by code through `GeoService`. No hardcoded country/currency logic in business code.
7. **Styling stack & editable content** — Tailwind + shadcn/ui + Lucide icons (`lucide-react`). Design tokens remain in ONE place as CSS variables mapped into the Tailwind theme. Shared components live in `packages/ui` and never fetch data (3-tier rule, section 19). Copy and navigation live in `apps/web/src/config/site.ts`.
8. **Strict domain error codes** — All errors resolve to a strongly typed `ErrorCode` (`DOMAIN_ENTITY_REASON`) defined in `packages/shared` and mapped via `ApiResponseFilter`. Never generic strings or raw HTTP exception names.
9. **Strict Auth Security** — Access tokens are 15-minute JWTs stored strictly in-memory (JS closure). Refresh tokens are 7-day opaque tokens in `HttpOnly`, `SameSite=Strict`, `Secure` cookies scoped to `Path=/api/v1/auth/refresh`. Never store tokens in `localStorage`. Redis stores SHA-256 token hashes with metadata (`userId`, `familyId`, `userAgent`, `ipAddress`) for rotation and automatic breach reuse detection.
10. **Strict Frontend Data Fetching (TanStack Query)** — UI components (`.tsx`) must never fetch directly or use `useAsync`. Strict 3-tier pipeline: Component (`.tsx`) ➔ Domain Hook (`@afritrade/hooks/src/hooks/<domain>.hooks.ts`) ➔ API Function (`@afritrade/hooks/src/api/<domain>.api.ts`) ➔ Backend.
11. **Backend Module Test Coverage** — Every NestJS module in `apps/api/src/modules/` must maintain its own dedicated `.spec.ts` test file.
12. **OpenAPI / Swagger Documentation-As-Code** — Every endpoint is documented with `@ApiTags`, `@ApiOperation`, and Zod-derived DTOs. Swagger UI serves at `/api/docs` and process build-time CLI exports canonical spec to `docs/openapi.json` via `pnpm run openapi:generate`.

## API surface (all under `/api/v1`)

Public: `GET /health, /countries, /currencies, /products, /products/:id` · `POST /auth/register, /auth/login, /auth/refresh, /auth/logout`
Any role: `GET /users/me, /users/profile, /dashboard/summary, /orders/:id` · `PATCH /users/profile, /users/me/preferences` (scoped per role)
Buyer: `POST /orders` · `GET /orders` · `POST /orders/:id/pay` · `GET /payments/verify/:reference`
Supplier: `GET|POST /business-profile(/me)` · `PATCH /business-profile/me/details` · `PUT /business-profile/me/kyb` · `POST|DELETE /business-profile/me/documents(/:docId)` · `GET /business-profile/me/documents/:docId/url` · `GET|POST /supplier/products` · `PATCH /supplier/products/:id` · `GET /supplier/orders`
Admin: `GET /admin/users` · `GET /admin/kyb` · `GET /admin/kyb/:id` · `GET /admin/kyb/documents/:docId/url` · `POST /admin/kyb/:id/decision` · `GET /admin/orders` · `PATCH /admin/orders/:orderId/shipment` · `GET|POST|PATCH /admin/logistics-partners`
