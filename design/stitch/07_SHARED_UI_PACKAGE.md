# AfriTrade Connect — Shared UI Package Audit (`packages/ui`)

> **Authority & Source Citations**: `packages/ui/src/**/*`, `RULES.md` (§16 amended, §18, §19), `AGENTS.md`, `design/stitch/ANSWERS.md` (Q2, Q35).  
> **Status**: Approved Architectural & Component Redesign Inventory.

---

## 1. Role of `packages/ui` in the Monorepo

`packages/ui` is the shared component and design system package consumed by both frontend applications:
- **`apps/web`** (Public Marketplace, Buyer Portal, Supplier Workspace)
- **`apps/admin`** (Operations Portal)

Per **`ANSWERS.md` Q2 & Q35** and **`RULES.md §16`**, `packages/ui` must represent **ONE branded family** built with **Tailwind CSS + shadcn/ui**, powered by centralized CSS custom properties.

---

## 2. Component Inventory & Migration Decisions

| Component / File | Purpose & Responsibility | Props & Interfaces | Current States | Redesign Verdict (`REPLACE`, `RESTYLE`, `KEEP`) |
| :--- | :--- | :--- | :--- | :--- |
| **`ErrorBox`** (`components/ui.tsx`) | Displays domain-level alert errors | `{ message: string \| null }` | Null (hidden), Active error banner | **RESTYLE**: Convert to shadcn `Alert` / `AlertDescription` with Phosphor `WarningCircle` icon. |
| **`Loading`** (`components/ui.tsx`) | Fallback text loading indicator | `{ what?: string }` | Text `Loading {what}…` | **REPLACE**: Replace with accessible, shimmering shadcn `Skeleton` loaders matching target content shapes. |
| **`Money`** (`components/ui.tsx`) | Formats minor-unit / decimal string prices | `{ amount: string; currency: string }` | Formatted currency output | **KEEP**: Pure utility presentation; add tabular figures class (`tabular-nums font-mono`). |
| **`Stat`** (`components/ui.tsx`) | Simple metric display card | `{ label: string; value: ReactNode }` | Card layout with bold text | **RESTYLE**: Redesign into shadcn `Card` + `CardHeader` + `CardTitle` with duotone trend icon. |
| **`OrderStatusBadge`** (`components/ui.tsx`) | Colored badge for 8 order statuses | `{ status: OrderStatus }` | Success (`Delivered`), Danger (`Cancelled`), Warn (`Payment pending`), Default | **RESTYLE**: Transform into shadcn `Badge` with Phosphor duotone icon and verified light/dark contrast tokens. |
| **`KybBadge`** (`components/ui.tsx`) | Colored badge for 4 KYB statuses | `{ status: KybStatus }` | `APPROVED` (green), `REJECTED` (red), `PENDING` (yellow), `NOT_SUBMITTED` | **RESTYLE**: Transform into accessible pill badge with icon + text label. |
| **`Dropdown`** (`components/Dropdown.tsx`) | Full-featured accessible custom dropdown with keyboard navigation and search | `DropdownProps<T>` (`options`, `value`, `onChange`, `showSearch`, `size`, `variant`) | Idle, Open, Focused, Search active, Disabled, Error | **RESTYLE**: Align styling with shadcn `Select` / `Combobox` tokens while preserving existing keyboard accessibility. |
| **`OrderTable`** (`components/OrderTable.tsx`) | Shared table for buyer, supplier, and admin order directories | `{ orders: OrderTableItem[]; showBuyer?: boolean; orderLinkPrefix?: string }` | Empty (`No orders yet`), Populated data table | **RESTYLE**: Port to shadcn `Table` with sticky headers, tabular figures, and responsive mobile card fallback. |
| **`DashboardView`** (`components/DashboardView.tsx`) | High-level summary view across Buyer, Supplier, Admin | `{ adminRoutePrefix?: string }` | Loading, Error, Role-specific layouts | **REPLACE (Architecture Fix)**: Violates 3-tier data isolation rule by calling hooks inside shared component. Needs decomposition. |
| **`ShipmentPanel`** (`components/ShipmentPanel.tsx`) | Admin control panel to assign partner and advance status | `{ order: OrderShipmentInfo; onUpdated: () => void }` | Transition buttons, Partner select, Error | **REPLACE (Architecture Fix)**: Violates 3-tier data isolation rule by calling hooks inside shared component. Needs decomposition. |
| **`AuthContext` & `AuthProvider`** (`auth/AuthContext.tsx`) | In-memory token management, silent refresh, cold reload hydration | `{ children, apiClient, baseUrl }` | Loading, Authenticated, Unauthenticated | **KEEP**: Core security engine complying with strict hybrid token rules (`RULES.md §18`). |
| **`RequireRole` & `RequireAdmin`** (`auth/guards.tsx`) | Client-side route authorization guards | `{ roles, children, loginPath }` | Loading, Authorized, Forbidden redirect | **KEEP**: Essential route gating wrappers. |

---

## 3. Strict 3-Tier Data Architecture Violations in `packages/ui`

> [!WARNING]
> **Violation of RULES §16, §19 & AGENTS.md**:  
> "Shared components live in packages/ui and never fetch data (3-tier rule, section 19)."  
> "UI components must never invoke api.get, api.post, or ad-hoc custom async wrappers (e.g. useAsync) directly."

The audit reveals two major architecture violations currently located inside `packages/ui`:

### 3.1 `DashboardView.tsx` Fetches Data
- **Location**: `packages/ui/src/components/DashboardView.tsx`, line 40:
  ```typescript
  const { data, error, isLoading } = useDashboardSummary();
  ```
- **Violation**: Imports and executes `useDashboardSummary()` from `@afritrade/hooks`. A shared component in `packages/ui` must receive data exclusively via props from the consuming page.
- **Resolution Plan**: Refactor `DashboardView` into pure presentation sub-components (`BuyerDashboardCards`, `SupplierDashboardCards`, `AdminDashboardCards`). Data fetching must occur in the consuming page in `apps/web` or `apps/admin` via `@afritrade/hooks`, passing `summary` as props.

### 3.2 `ShipmentPanel.tsx` Fetches Data & Mutates
- **Location**: `packages/ui/src/components/ShipmentPanel.tsx`, lines 27–28:
  ```typescript
  const { data: partners = [] } = useLogisticsPartners();
  const updateShipment = useUpdateOrderShipment();
  ```
- **Violation**: Directly queries logistics partners and executes mutations.
- **Resolution Plan**: Move data fetching and mutation handling to the admin page (`apps/admin/src/app/orders/[id]/page.tsx`), passing `partners: LogisticsPartnerDto[]` and `onAdvanceStatus: (status) => Promise<void>` into `ShipmentPanel` as pure callbacks.

### 3.3 Banned Ad-Hoc Async Wrapper: `use-async.ts`
- **Location**: `packages/ui/src/hooks/use-async.ts`
- **Violation**: An ad-hoc Promise resolution wrapper. Banned by `RULES.md §19` ("Strict Ban on Ad-hoc Component Fetching... banned: useAsync"). All client fetching is mandated to funnel through TanStack Query in `@afritrade/hooks`.
- **Resolution Plan**: Deprecate and remove `use-async.ts` from `packages/ui`.

---

## 4. New Shared UI Components Required by the Design System

The upcoming Tailwind + shadcn redesign will introduce the following dedicated, pure presentation components into `packages/ui` (names only):

1. **`OrderTracker`** (Horizontal stepper displaying all 8 order stages + `CANCELLED` alert state)
2. **`PriceDisplay`** (Standardized two-line display: primary listed price + indicative converted equivalent)
3. **`KybReviewDrawer`** (Admin drawer/modal for inspecting supplier business filings with decision inputs)
4. **`ViewModeToggle`** (Prominent icon toggle for Grid vs List catalog switching)
5. **`ThemeToggle`** (Accessible device/light/dark mode toggle button with Phosphor icons)
6. **`CurrencySelector`** (Accessible currency dropdown pill for quick viewing currency adjustments)
7. **`MetricCard`** (Unified B2B stat card with trend indicator and duotone icon)
8. **`EmptyState`** (Custom African trade illustrated empty states with contextual action buttons)
9. **`Skeleton`** (Shimmering placeholder primitives for text, cards, and data tables)
10. **`DataTable`** (Data-dense table wrapper with pagination, sorting header styles, and mobile responsiveness)
