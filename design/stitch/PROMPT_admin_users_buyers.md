# Stitch Generation Prompt — Screen 07: Admin Users > Buyers Directory

- **App & Route**: `apps/admin` ➔ `/users/buyers`
- **Device Target**: `DESKTOP` (Laptop-primary admin operations)
- **Variant Target**: 1 Variant
- **Role**: Platform Administrator
- **Priority Tier**: Tier 1 (Generation Order #7)
- **Scope Status**: DESIGN-ONLY (Per Standing Rule 23 Scope Guard)

---

## 1. Screen Purpose & Design Direction
An operational administration table for managing registered wholesale commercial buyers across Nigeria, South Africa, and Ghana. Provides ops administrators with quick visibility into buyer profiles, order volume, and aggregate spend per currency.

Tone is analytical, clear, and enterprise-grade. Clean everyday English — zero banned jargon (no "arteries", no "corridors", no "parity", no "exporter"). No escrow claims.

---

## 2. Layout & Key Elements

### 2.1 Admin Shell Layout
- **Sidebar Navigation** (`apps/admin` portal):
  - Brand header: "AfriTrade Ops" (Admin Portal)
  - Operations Group:
    - Dashboard Overview (`/`)
    - Orders Oversight (`/orders`)
    - Logistics Partners (`/logistics`)
  - **Users Group** (Active Section, DESIGN-ONLY):
    - **Buyers** (Active link, deep pine green highlight)
    - Suppliers (`/users/suppliers`)
    - KYB Review Queue (`/users/kyb`)
    - KYC Verification (`/users/kyc`, "Coming Soon" badge)
  - Admin Profile Footer: "System Admin" + Logout.
- **Top Header Bar**:
  - Breadcrumb: "Users > Commercial Buyers"
  - Quick Search input
  - Environment badge: `Simulated Demo Mode (Zero Financial Risk)`

### 2.2 Table Controls & Filter Toolbar
- **Title Row**: "Commercial Buyers Directory" with subtitle "128 registered wholesale buyers across West and Southern Africa" + `[DESIGN-ONLY]` pill badge.
- **Action / Export**: "Export CSV" button.
- **Filters**:
  - Search input: "Search by company name, contact person, or email..."
  - Country filter pills: `All Countries (128)`, `🇳🇬 Nigeria (72)`, `🇿🇦 South Africa (34)`, `🇬🇭 Ghana (22)`.
  - Status filter: `All Statuses`, `Active`, `Dormant`.

### 2.3 High-Density Buyers Data Table
Table columns:
1. **Company & Contact**: Company Name (e.g. "Tema Food Processors Ltd") + Contact Name ("Kofi Mensah").
2. **Origin Country**: Flag + Country code (e.g. `🇬🇭 Ghana`).
3. **Contact Email & Phone**: `kmensah@temafoods.gh` • `+233 24 555 0192`.
4. **Orders Placed**: Count pill (e.g. `14 Orders`).
5. **Total Spend (Native Currency)**: e.g. `GH₵ 142,500` or `₦18,200,000` (strictly per-currency, never summed across currencies).
6. **Last Active**: Timestamp (e.g. "Today, 14:20").
7. **Status Badge**: `Active` (green pill).
8. **Actions**: Three-dots menu or "View Details" button opening profile summary drawer.

### 2.4 Quick Summary Metrics (Above Table)
- Total Buyers: `128`
- Active This Month: `84`
- Multi-Country Buyers: `31`

---

## 3. Design Tokens & Styling (Per DESIGN.md)
- **Primary**: Deep Pine Green (`#00513a`)
- **Secondary / Accent**: Warm Gold (`#feb62f`)
- **Canvas / Background**: Light Alabaster (`#f2fcf5`)
- **Cards & Table**: Pure White (`#ffffff`), border `#bec9c2`
- **Typography**: `Bricolage Grotesque` (Headings) & `Noto Sans` (Tables, numbers with `tabular-nums`)
