# Stitch Generation Prompt — Screen 08: Admin Users > Suppliers Directory

- **App & Route**: `apps/admin` ➔ `/users/suppliers`
- **Device Target**: `DESKTOP` (Laptop-primary admin operations)
- **Variant Target**: 1 Variant
- **Role**: Platform Administrator
- **Priority Tier**: Tier 1 (Generation Order #8)
- **Scope Status**: DESIGN-ONLY (Per Standing Rule 23 Scope Guard)

---

## 1. Screen Purpose & Design Direction
An operational administration table for managing registered commercial wholesale suppliers across Nigeria, South Africa, and Ghana. Ops administrators oversee supplier verification status (KYB), active product listings, registered categories, and total simulated revenue.

Tone is clean, analytical, and authoritative. Plain everyday English only — zero banned jargon (no "arteries", no "corridors", no "parity", no "exporter" — use "supplier" or "local business"). Zero escrow claims.

---

## 2. Layout & Key Elements

### 2.1 Admin Shell Layout
- **Sidebar Navigation** (`apps/admin` portal):
  - Brand: "AfriTrade Ops" (Admin Portal)
  - Operations Group: Overview, Orders Oversight, Logistics Partners.
  - **Users Group** (DESIGN-ONLY):
    - Buyers (`/users/buyers`)
    - **Suppliers** (Active link, deep pine green highlight)
    - KYB Review Queue (`/users/kyb`, pill badge "4 Pending")
    - KYC Verification (`/users/kyc`, "Coming Soon" badge)
  - Profile: "Favour Okafor (Super Admin)" + Logout.
- **Top Header Bar**:
  - Breadcrumb: "Users > Wholesale Suppliers Directory"
  - Safeguard Badges: `[DESIGN-ONLY Screen — Rule 23]` and `Demo Simulation Mode (Zero Risk)`
  - Quick Search and "Export CSV" action.

### 2.2 Table Controls & Filter Toolbar
- **Title Row**: "Wholesale Suppliers Directory" with subtitle "86 registered commercial suppliers across Nigeria, South Africa, and Ghana".
- **Filters**:
  - Search input: "Search by supplier name, CAC/Registration ID, category..."
  - Country filter pills: `All Countries (86)`, `🇳🇬 Nigeria (48)`, `🇿🇦 South Africa (22)`, `🇬🇭 Ghana (16)`.
  - KYB Status filter tabs: `All (86)`, `Verified / Approved (68)`, `Pending Review (12)`, `Rejected (6)`.

### 2.3 Suppliers Data Table
Columns:
1. **Supplier Name & Contact**: e.g., "Savannah Agro Ltd" (Contact: Babatunde Adeleke), "Highveld Grains Ltd" (Contact: Willem Van Der Merwe), "Sunyani Harvest Co" (Contact: Kwame Boateng).
2. **Origin Country**: Flag + Country (e.g. `🇳🇬 Kano, Nigeria`).
3. **Primary Category**: e.g. `Grains & Seeds`, `Nuts & Produce`, `Oils & Extracts`.
4. **Active Listings**: Count badge (e.g. `8 Products`).
5. **KYB Status**:
   - `Verified Approved` (green shield pill)
   - `Pending Review` (warm gold clock pill with quick link to `/users/kyb`)
   - `Rejected` (red warning pill)
6. **Total Sales (Native Currency)**: e.g. `₦64.2M`, `R 1.2M`, `GH₵ 410,000` (strictly per-currency).
7. **Actions**: "View Products" link and "Review KYB" button.

### 2.4 Quick Summary Metric Cards
- Total Registered Suppliers: `86`
- Verified / Approved: `68 (79%)`
- Pending Review Queue: `12`
- Total Active Wholesale Catalog Items: `248`

---

## 3. Design Tokens & Styling (Per DESIGN.md)
- **Primary**: Deep Pine Green (`#00513a`)
- **Secondary / Accent**: Warm Gold (`#feb62f`)
- **Canvas / Surface**: Light Alabaster (`#f2fcf5`) and Card White (`#ffffff`)
- **Borders**: Soft Neutral (`#bec9c2`)
- **Typography**: `Bricolage Grotesque` (Headings) & `Noto Sans` (Data tables)
