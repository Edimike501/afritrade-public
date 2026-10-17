# AfriTrade Connect — Master Conflict Resolutions & Architecture Decisions

> **Authority & Source Citations**: Direct cross-audit of `README.md`, `SCOPE.md`, `ARCHITECTURE.md`, `.agents/rules/RULES.md`, `docs/product/*`, `apps/api/prisma/schema.prisma`, `packages/shared`, `packages/ui`, `apps/web`, `apps/admin`, and `design/stitch/ANSWERS.md`.  
> **Status**: **RESOLVED**. Master decisions enacted by project owner to establish a single, uncompromised architecture across the entire repository.

---

## 1. Conflict 1: Admin App Topology (Decision: Follow Source B)

- **Owner Decision**: **Follow Source B**.
- **Resolved Architecture**:
  - `apps/admin` is a **dedicated, independent Next.js application** operating on **port 3031** (`apps/admin/package.json`, `ARCHITECTURE.md`), isolated from `apps/web` (port 3030).
  - It maintains its own root layout, authentication middleware, and administrative routes (`/kyb`, `/orders`, `/logistics`, `/users/*`).
  - `README.md` lines 15 & 29 are marked stale documentation to be aligned with the actual two-app monorepo structure.
- **Impact on Stitch**:
  - Stitch designs `apps/admin` as a dedicated desktop/laptop operations portal with a left-sidebar layout and internal control-tower data density.

---

## 2. Conflict 2: Admin "Users" Group vs. SCOPE.md & API Surface (Decision: Follow Source A + API Filter)

- **Owner Decision**: **Follow Source A**, with the API implementing a unified filter to fetch based on user role/type (`GET /api/v1/admin/users?role=BUYER|SUPPLIER`).
- **Resolved Architecture**:
  - The Admin sidebar features the **"Users" group** containing:
    1. `Buyers` (`/users/buyers`) ➔ Directory view backed by `GET /api/v1/admin/users?role=BUYER`.
    2. `Suppliers` (`/users/suppliers`) ➔ Directory view backed by `GET /api/v1/admin/users?role=SUPPLIER`.
    3. `KYB Review Queue` (`/users/kyb` / `/kyb`) ➔ Full business verification review queue.
    4. `KYC (Coming Soon)` (`/users/kyc`) ➔ Non-functional placeholder (`RULES.md §23`).
  - Backend API surface will expose a role-filtered endpoint `GET /api/v1/admin/users` returning paginated user summaries with company and profile details.
- **Impact on Stitch & Implementation**:
  - Stitch fully designs `/users/buyers` and `/users/suppliers` directories alongside the `/users/kyc` placeholder.

---

## 3. Conflict 3: Styling Stack (Decision: Follow Source B)

- **Owner Decision**: **Follow Source B**.
- **Resolved Architecture**:
  - Both `apps/web` and `apps/admin` migrate from ad-hoc CSS variables to **Tailwind CSS + shadcn/ui** (`RULES.md §16 amended`, `ANSWERS.md` Q35).
  - Design tokens remain in **one place** as semantic CSS variables mapped into the Tailwind theme configuration.
  - Shared components reside in `packages/ui` and adhere strictly to the 3-tier presentation boundary (zero direct data fetching).
  - Documentation files (`RULES.md`, `ARCHITECTURE.md`, `docs/INFRA.md`) will be synchronized in the styling PR.

---

## 4. Conflict 4: Monetary Data Storage (Decision: Follow Source C / Safest Architecture)

- **Owner Decision**: **Follow Source C** (Postgres `Decimal` / API decimal string representation) as the safest and most cohesive fit for the existing database schema and Prisma models.
- **Resolved Architecture**:
  - **Database**: Stored as Postgres `Decimal(14, 2)` across `Product.price`, `Order.totalAmount`, `OrderItem.unitPrice`, `Payment.amount`, and `PaymentLedgerEntry.amount` (`apps/api/prisma/schema.prisma`).
  - **API Boundary**: Money travels across the wire as a **decimal string** (e.g., `"12500.00"`) paired with an explicit ISO currency code (`MoneySchema`), preventing floating-point rounding drift in JSON parsers.
  - **Frontend Display**: Display formatting exclusively uses `formatMoney(amount, currencyCode)` from `packages/shared/src/types/money.ts`.
  - Display calculations and indicative currency conversions utilize minor-unit safe integer arithmetic before returning formatted strings.

---

## 5. Conflict 5: Supplier Order Status Permissions (Decision: Suppliers Update Order Status)

- **Owner Decision**: **Suppliers CAN update order status**.
- **Resolved Architecture**:
  - Suppliers are **no longer read-only** on incoming orders.
  - The supplier incoming orders interface (`/supplier/orders` and `/supplier/orders/[id]`) provides status update capabilities for operational preparation:
    - `PAYMENT_CONFIRMED` ➔ `PREPARING` / `READY_FOR_PICKUP` (or supplier acknowledgment).
  - The shared `ORDER_STATUS_TRANSITIONS` and permissions matrix are expanded to authorize suppliers to advance orders once payment is confirmed, while admin retains logistics and freight assignment control.
- **Impact on Stitch**:
  - Screen 17 (`/supplier/orders`) must render active, contextual action buttons (e.g. `"Accept Order"`, `"Mark as Preparing"`, `"Ready for Pickup"`) for orders in `PAYMENT_CONFIRMED` state.

---

## 6. Conflict 6: Viewport Priority & Mobile-First Mandate (Decision: Follow Source B + Fully Responsive on All Screens)

- **Owner Decision**: **Follow Source B, but every single screen and design code must be fully responsive across ALL viewports (mobile, tablet, laptop, desktop)**.
- **Resolved Architecture**:
  - **Universal Responsiveness**: No desktop-only or mobile-only interfaces. Every component, table, modal, and drawer must fluidly adapt from 320px mobile screens up to 4K displays.
  - **Buyer Emphasis**: Optimized for thumb navigation, touch targets (≥44px), bottom sheets, and minimal data consumption.
  - **Supplier & Admin Emphasis**: High-density desktop layouts that collapse cleanly into responsive touch cards, scrollable data tables, and slide-over drawers on smaller viewports.

---

## 7. Conflict 7: Supplier Dashboard Route (Decision: Follow Source B)

- **Owner Decision**: **Follow Source B**.
- **Resolved Architecture**:
  - The Supplier Dashboard lives at dedicated route: **`/supplier`** (`apps/web/src/app/supplier/page.tsx`).
  - `/dashboard` is reserved as the dedicated **Buyer Dashboard** (`apps/web/src/app/dashboard/page.tsx`).
  - Clear architectural separation between commercial buyer spend tracking and supplier manufacturing/order fulfillment metrics.
  - Navigation in `siteConfig` maps `{ label: "Dashboard", href: "/supplier" }` for `Role.SUPPLIER`.

---

## 8. Conflict 8: Complete Absence of Dark Mode in Current CSS (Decision: Follow Source B)

- **Owner Decision**: **Follow Source B**.
- **Resolved Architecture**:
  - Full, first-class **Light AND Dark Mode** support across both `apps/web` and `apps/admin` (`ANSWERS.md` Q4).
  - Default behavior follows device system setting (`prefers-color-scheme`).
  - An accessible icon toggle (Sun / Moon) in header and sidebar allows immediate user override.
  - Tokens defined in `09_TOKEN_AUDIT.md` govern dark mode values, ensuring WCAG 2.2 AA contrast compliance.

---

## 9. Conflict 9: Architecture Violation in `packages/ui` (Decision: Follow Source A)

- **Owner Decision**: **Follow Source A** (Enforce strict 3-tier separation per `RULES.md §16` & `§19`).
- **Resolved Architecture**:
  - `DashboardView.tsx`, `ShipmentPanel.tsx`, and all shared components in `packages/ui` are refactored into **pure presentation components**.
  - All data fetching via `@tanstack/react-query` and mutation hooks is extracted out of `packages/ui` into the consuming route pages in `apps/web` and `apps/admin`.
  - `use-async.ts` is eliminated from `packages/ui`.
  - Presentation flow: `Page/Route` ➔ `Domain Hook (@afritrade/hooks)` ➔ `Shared Presentation Component (@afritrade/ui)`.

---

## 10. Conflict 10: Monorepo Brand Asset Single-Source-of-Truth (Decision: Follow Source C)

- **Owner Decision**: **Follow Source C**.
- **Resolved Architecture**:
  - Authoritative brand assets are stored in **ONE place** in the repository and consumed by both `apps/web` and `apps/admin`.
  - The 7 core assets in `apps/web/public/` (`logo.svg`, `logo-mark.svg`, `favicon.ico`, `icon.png`, `apple-touch-icon.png`, `opengraph-image.png`, `images/product-placeholder.png`) are centralized in `packages/ui/assets/` as canonical vectors/primitives.
  - Exported as reusable React components (`<BrandLogo />`, `<BrandMark />`) in `@afritrade/ui`.
  - Root browser icons are mirrored to `apps/admin/public/` via build-time automation/symlinks, preventing manual drift.

---

## 11. Ideas, Not Designed (Strict Scope Guard Enforced)

### Idea 1: "Post a Buy Requirement" (RFQ / Tender Bulletin Board)
- **Source Observed**: External reference `https://www.globalbuyersonline.com/tradeleads/post.asp` (analyzed in `11_REFERENCE_ANALYSIS.md`).
- **Conflict with `SCOPE.md`**:
  `SCOPE.md` explicitly defines AfriTrade Connect as a **catalog-first transactional marketplace**:
  - *In Scope*: Marketplace browsing with country/category/search filters (100+ seeded products); place an order and pay in one step; order lifecycle driven by canonical state machine.
  - *Out of Scope*: Any feature not listed in "In Scope" (including open RFQ boards, tender bidding, supplier quotation matching engines, or unmediated messaging).
- **Status**: **OUT OF SCOPE**. Listed under "Ideas, not designed". Strictly barred from design generation, data modeling, and API implementation in this MVP phase.


