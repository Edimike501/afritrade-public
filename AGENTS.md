# Notes for AI coding assistants

Read `SCOPE.md` and `ARCHITECTURE.md` first. Hard rules:

- **Zero infrastructure cost.** Don't add paid services, paid Redis, MongoDB, or external SaaS. Local dev uses Docker (`redis:7-alpine`, `postgres:16-alpine`); hosted deployments use free tiers only.
- **Strict Auth Security:** Hybrid token architecture. Access tokens are 15-minute JWTs held strictly in-memory (JS closure/state). Refresh tokens are 7-day opaque tokens in `HttpOnly`, `SameSite=Strict`, `Secure` cookies scoped to `Path=/api/v1/auth/refresh`. Never store tokens in `localStorage` or `sessionStorage`. Redis stores SHA-256 token hashes with metadata (`userId`, `familyId`, `userAgent`, `ipAddress`) for rotation and automatic breach reuse detection.
- **No escrow, no real logistics integration, no real money** in this phase.
- Add API shapes to `packages/shared` first; the API DTOs (`createZodDto`) and the web both consume them.
- Money is a decimal string + explicit currency code. Never `number` for stored amounts.
- Don't hardcode countries/currencies/roles-of-countries — they are data (`GeoService`).
- New order transitions go in `ORDER_STATUS_TRANSITIONS` only.
- New protected endpoints need `@Roles(...)` (or are authenticated-by-default); public ones need `@Public()`.
- UI colours/spacing come from CSS variables; copy/nav from `config/site.ts`.
- **Strict error codes.** Every error must carry an explicit, typed domain error code from `packages/shared` (`DOMAIN_ENTITY_REASON` in `SCREAMING_SNAKE_CASE`, e.g. `AUTH_INVALID_CREDENTIALS`, `ORDER_CROSS_CURRENCY_REJECTED`). Never return generic codes ("error", "failed") or bare HTTP exception names (`BadRequestException`).
- **Strict Frontend Data Fetching:** UI components (`.tsx`) must never fetch directly or use ad-hoc `useAsync`. All data fetching uses `@tanstack/react-query` via the `@afritrade/hooks` package adhering to the 3-tier flow: Component (`.tsx`) ➔ Domain Hook (`<domain>.hooks.ts`) ➔ API Function (`<domain>.api.ts`) ➔ Backend.
- **Mandatory Mutating Payload Validation (POST/PUT/PATCH):** Every mutating payload sent to the backend must be strictly validated before transmission on the client (via canonical Zod schemas in `@afritrade/shared`) and enforced on the backend via NestJS Zod DTOs (`createZodDto`) and `ZodValidationPipe`. No untyped, raw, or unvalidated mutation payloads are permitted anywhere.
- **Backend Module Tests:** Every NestJS module in `apps/api/src/modules/` must maintain its own dedicated `.spec.ts` test file.

## 16 (amended) Styling stack
- Tailwind + shadcn/ui + Lucide icons (`lucide-react`). Design tokens remain in ONE place as CSS variables mapped into the Tailwind theme.
- Shared components live in packages/ui and never fetch data (3-tier rule, section 19).
- Update ARCHITECTURE.md rule 7 and docs/INFRA.md in the same PR (section 17).

## 21. Design-first (Stitch) - standing rule
- Any new screen or significant UI change is designed in Stitch and approved BEFORE any implementation code. Source of truth: design/stitch/DESIGN.md.
- No ad-hoc visual decisions in code. A new component must exist in DESIGN.md first.

## 22. Order tracker
- Horizontal stepper now. At the first major launch it becomes map-like.
- Tracker work must keep the status data model (shared ORDER_STATUS_TRANSITIONS) unchanged so the visual can swap without touching logic.

## 23. Scope guard for new admin screens
- Admin "Users" group (Buyers, Suppliers, KYB, KYC placeholder) is DESIGN-ONLY until SCOPE.md is updated. KYC is a non-functional placeholder; no KYC logic, upload, or API.

## 24. Mandatory Post-Implementation Verification & Quality Gates
- After ANY implementation or modification of code, no matter how small, the following MUST be executed and all errors fixed immediately, unless the user explicitly instructs otherwise:
  1. **Lint:** `pnpm -r lint`
  2. **Typecheck:** `pnpm -r typecheck` (or `tsc --noEmit`)
  3. **Unit & Integration Tests:** `pnpm test` (or `pnpm -r test`)
  4. **Build:** `pnpm build`
  5. **Production Verification Suite:** `scripts/verify-prod.sh` (or `pnpm verify:prod`)
- **Zero Unresolved Errors:** Any lint issues, TypeScript errors, test failures, or broken smoke probes must be diagnosed and resolved before finishing. No assumptions of correctness without running the verification commands.

