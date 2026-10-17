# AfriTrade Connect — Applications & Sitemap Specification

> **Authority & Source Citations**: `design/stitch/ANSWERS.md` (Q1, Q2, Q5, Q24, Q25), `README.md`, `SCOPE.md`, `ARCHITECTURE.md`, `apps/web/src/config/site.ts`, `apps/web/src/app/*`, `apps/admin/src/app/*`.  
> **Status**: Approved Architectural Route Inventory. No unauthorized routes added.

---

## 1. Application Architecture & Topology

AfriTrade Connect is organized as a unified monorepo running two dedicated frontend web applications sharing a common component system (`packages/ui`) and data fetching hooks (`packages/hooks`):

```
                                  AFRITRADE CONNECT
                                          │
                 ┌────────────────────────┴────────────────────────┐
                 ▼                                                 ▼
       apps/web (Port 3030)                              apps/admin (Port 3031)
  Public Marketplace, Buyer Portal,                   Internal Operations Portal
         & Supplier Workspace                           & Administrative Control
```

- **`apps/web` (Port 3030)**: Serves public visitors, registered buyers, and onboarded suppliers.
- **`apps/admin` (Port 3031)**: Dedicated operations portal for platform administrators. Note: while `README.md` line 15 historically stated admin dashboards lived in `apps/web`, the repository maintains a dedicated Next.js app in `apps/admin` (`ARCHITECTURE.md`, `apps/admin/package.json`).

---

## 2. Global Route Taxonomy & Classification Legend

Every route across both applications is classified under one of four distinct implementation statuses:
- **`EXISTS-functional`**: Route file exists and contains active logic, API integration, form handling, or working components.
- **`EXISTS-placeholder`**: Route file exists in `src/app/` but currently contains minimal template scaffolding or text placeholders.
- **`PLANNED`**: Route specified in core architecture/PRD documents but not yet represented by a dedicated page file.
- **`DESIGN-ONLY`**: Route explicitly introduced for UI/UX design generation via Stitch per owner instruction (`ANSWERS.md` Q5), strictly quarantined from API implementation until `SCOPE.md` is amended.

---

## 3. `apps/web` Sitemap (Port 3030)

### 3.1 Public Routes (Unauthenticated)

| Route Path | Screen Name | Current Status | Primary Persona | Source & Notes |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Public Landing Page | `EXISTS-functional` | Public / Guest | `apps/web/src/app/page.tsx`. CTA-led hero, AfCFTA value prop, How-It-Works grid |
| `/marketplace` | Marketplace Catalog | `EXISTS-functional` | Public / Buyer | `apps/web/src/app/marketplace/page.tsx`. Category/country filters, search, currency selector. Needs grid/list toggle (`ANSWERS.md` Q27) |
| `/marketplace/[id]` | Product Detail View | `EXISTS-functional` | Public / Buyer | `apps/web/src/app/marketplace/[id]/page.tsx`. Dual-price display, product photo loader, inline `OrderForm` |
| `/trust` | Trust Center & Verification Guide | `DESIGN-ONLY` | Public / All | Candidate informational screen derived from reference analysis (`11_REFERENCE_ANALYSIS.md`). Manual KYB, simulated payments, curated logistics |
| `/login` | User Authentication | `EXISTS-functional` | All Users | `apps/web/src/app/login/page.tsx`. Credentials form, demo account quick-fill pills, role-based redirection |
| `/register` | User Registration & Role Selection | `EXISTS-functional` | New Users | `apps/web/src/app/register/page.tsx`. Dynamic Buyer vs Supplier toggle, country lookup, currency defaulting |
| `/robots.txt` | Crawler Directives | `EXISTS-functional` | Search Engines | `apps/web/src/app/robots.ts`. Allows marketplace; blocks private dashboards |
| `/sitemap.xml` | Dynamic XML Sitemap | `EXISTS-functional` | Search Engines | `apps/web/src/app/sitemap.ts`. Indexes `/` and `/marketplace` |

### 3.2 Buyer Routes (Authenticated: `Role.BUYER`)

| Route Path | Screen Name | Current Status | Primary Persona | Source & Notes |
| :--- | :--- | :--- | :--- | :--- |
| `/dashboard` | Buyer Dashboard Shell | `EXISTS-placeholder` | Buyer | `apps/web/src/app/dashboard/page.tsx`. Needs rich cards: active orders, delivered orders, spend per currency |
| `/orders` | Buyer Order History | `EXISTS-placeholder` | Buyer | `apps/web/src/app/orders/page.tsx`. Needs `OrderTable` integration with status badges and links |
| `/orders/[id]` | Order Detail, Tracker & Checkout | `EXISTS-placeholder` | Buyer | `apps/web/src/app/orders/[id]/page.tsx`. Hero screen: horizontal order tracker, simulated payment CTA, itemized summary |

### 3.3 Supplier Routes (Authenticated: `Role.SUPPLIER`)
 
| Route Path | Screen Name | Current Status | Primary Persona | Source & Notes |
| :--- | :--- | :--- | :--- | :--- |
| `/supplier` | Supplier Dashboard Shell | `EXISTS-functional` | Supplier | `apps/web/src/app/supplier/page.tsx`. Dedicated supplier dashboard (`Conflict 7 resolved`). KYB alert banner, active listings count, incoming orders count, revenue per currency |
| `/supplier/kyb` | Supplier KYB Verification Submission | `EXISTS-placeholder` | Supplier | `apps/web/src/app/supplier/kyb/page.tsx`. Form: business name, registration number, country, contact phone. Status display |
| `/products` (`/supplier/products`) | Supplier Product Management | `EXISTS-functional` | Supplier | `apps/web/src/app/(dashboard)/@supplier/products/page.tsx`. Catalog list with search, status/category filters, active/inactive toggles, View, Edit, and "+ Add Product" |
| `/products/new` | Create Product Listing | `EXISTS-functional` | Supplier | `apps/web/src/app/(dashboard)/@supplier/products/new/page.tsx`. Form: title, description, category, unit price, currency, image URL. Gated on KYB approval |
| `/products/[id]` | Supplier Product Detail View | `EXISTS-functional` | Supplier | `apps/web/src/app/(dashboard)/@supplier/products/[id]/page.tsx`. Full product inspection, visibility toggle, and edit trigger |
| `/products/[id]/edit` | Edit Product Listing | `EXISTS-functional` | Supplier | `apps/web/src/app/(dashboard)/@supplier/products/[id]/edit/page.tsx`. Pre-populated edit form for title, category, currency, price, description, image URL, and visibility |
| `/supplier/orders` | Incoming Orders & Fulfillment Queue | `EXISTS-functional` | Supplier | `apps/web/src/app/supplier/orders/page.tsx`. Contextual order management with status advance capabilities (`Conflict 5 resolved`) |

---

## 4. `apps/admin` Sitemap (Port 3031)

### 4.1 Administrative Routes (Authenticated: `Role.ADMIN`)

| Route Path | Screen Name | Current Status | Primary Persona | Source & Notes |
| :--- | :--- | :--- | :--- | :--- |
| `/login` | Admin Sign In | `EXISTS-functional` | Platform Admin | `apps/admin/src/app/login/page.tsx`. Dedicated administrative login portal |
| `/` | Platform Overview Dashboard | `EXISTS-placeholder` | Platform Admin | `apps/admin/src/app/page.tsx`. Metrics: users by role, pending KYB count, total orders, trade volume per currency |
| `/kyb` | Master KYB Review Queue | `EXISTS-placeholder` | Platform Admin | `apps/admin/src/app/kyb/page.tsx`. Review queue table; audit decision modal (Approve / Reject + mandatory reason) |
| `/orders` | Order Oversight & Governance | `EXISTS-placeholder` | Platform Admin | `apps/admin/src/app/orders/page.tsx`. Comprehensive cross-border order directory with status filters |
| `/orders/[id]` | Order Inspection & Shipment Control | `EXISTS-placeholder` | Platform Admin | `apps/admin/src/app/orders/[id]/page.tsx`. Assign curated logistics partner; manually advance shipment status |
| `/logistics` | Logistics Partner Management | `EXISTS-placeholder` | Platform Admin | `apps/admin/src/app/logistics/page.tsx`. Curated freight partners CRUD (name, corridor coverage, contact details) |

### 4.2 NEW Admin "Users" Group (Per `ANSWERS.md` Q5) — `DESIGN-ONLY`

> [!WARNING]
> **Scope Guard Notice (`RULES.md §23`, `ANSWERS.md` Q5)**:  
> The following four screens are introduced under the new admin sidebar group `"Users"`. They are classified as **`DESIGN-ONLY`**. They are strictly quarantined from backend implementation, data migration, or route wiring until `SCOPE.md` is formally amended.

| Route Path | Screen Name | Current Status | Primary Persona | Scope & Functional Guard |
| :--- | :--- | :--- | :--- | :--- |
| `/users/buyers` | Buyers Directory | `DESIGN-ONLY` | Platform Admin | Backed by `GET /api/v1/admin/users?role=BUYER` (`Conflict 2 resolved`). View registered commercial buyers, country of origin, order count, total spend |
| `/users/suppliers` | Suppliers Directory | `DESIGN-ONLY` | Platform Admin | Backed by `GET /api/v1/admin/users?role=SUPPLIER` (`Conflict 2 resolved`). View registered suppliers, business names, KYB status pills, active listings count, export corridors |
| `/users/kyb` | KYB Review Queue (Grouped) | `DESIGN-ONLY` | Platform Admin | Integrated under "Users" group in navigation; links to KYB verification workflow |
| `/users/kyc` | KYC Placeholder Screen | `DESIGN-ONLY` | Platform Admin | **Non-functional placeholder** (`ANSWERS.md` Q5, Q9). Must render a prominent "Coming soon" badge; zero KYC upload, logic, or API |

---

## 5. Navigation Specifications Per Role

Per `ANSWERS.md` Q24 & Q25 and `apps/web/src/config/site.ts`:

### 5.1 Public Visitor Navigation (`apps/web` Header)
- **Desktop Header**:
  - Logo: `[AfriTrade Connect Mark + Wordmark]`
  - Links: `Marketplace` (`/marketplace`), `Log In` (`/login`), `Register` (`/register`)
  - Utility: Currency Selector dropdown (`USD`, `NGN`, `ZAR`, `GHS`)

### 5.2 Buyer Navigation (`apps/web` Left Sidebar + Mobile Drawer)
- **Navigation Items**:
  - `Dashboard` (`/dashboard`)
  - `Marketplace` (`/marketplace`)
  - `My Orders` (`/orders`)
- **Header Utilities**:
  - User profile menu (`user.fullName`, `Role.BUYER`)
  - Preferred viewing currency pill
  - Sign Out button

### 5.3 Supplier Navigation (`apps/web` Left Sidebar + Mobile Drawer)
- **Navigation Items**:
  - `Dashboard` (`/supplier`)
  - `My Products` (`/supplier/products`)
  - `Incoming Orders` (`/supplier/orders`)
  - `KYB Status` (`/supplier/kyb`)
- **Header Utilities**:
  - Supplier verification badge (`KybBadge`)
  - Sign Out button

### 5.4 Platform Admin Navigation (`apps/admin` Left Sidebar + Mobile Drawer)
Per `ANSWERS.md` Q5 & Q25, the admin interface adopts a structured **left sidebar navigation** layout:
- **Core Operations**:
  - `Platform Overview` (`/`)
  - `All Orders` (`/orders`)
  - `Logistics Partners` (`/logistics`)
- **Users Group (Expandable Sidebar Section)**:
  - `Buyers` (`/users/buyers`) `[DESIGN-ONLY]`
  - `Suppliers` (`/users/suppliers`) `[DESIGN-ONLY]`
  - `KYB Review Queue` (`/kyb` or `/users/kyb`)
  - `KYC (Coming Soon)` (`/users/kyc`) `[DESIGN-ONLY Placeholder]`
- **Footer / User Profile**:
  - Administrator identity badge (`Admin`, `user.fullName`)
  - Theme mode toggle (Device / Light / Dark)
  - Sign Out button
