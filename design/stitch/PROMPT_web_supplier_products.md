# Stitch Generation Prompt — Screen 15: Supplier Product Management

- **App & Route**: `apps/web` ➔ `/supplier/products`
- **Device Target**: Responsive (`DESKTOP` with mobile table scrolling)
- **Variant Target**: 1 Variant
- **Role**: Wholesale Commercial Supplier
- **Priority Tier**: Tier 2 (Generation Order #15)

---

## 1. Screen Purpose & Design Direction
The inventory management and catalog administration table for suppliers on AfriTrade Connect. Allows agricultural producers to manage their wholesale listings, toggle product availability (active/inactive), update stock and wholesale unit prices in their native currency, and initiate new product listings.

Tone is operational, structured, commercial, and clean. Plain everyday English only — zero banned jargon (no "arteries", no "corridors", no "parity", no "exporter" — use "supplier" or "local business"). Zero escrow claims.

---

## 2. Layout & Key Elements

### 2.1 Navigation & Header Bar
- Supplier Header Shell with links: Overview (`/supplier`), **Products** (`/supplier/products`, active green), Incoming Orders (`/supplier/orders`), KYB Status.
- Title: "My Wholesale Products" with subtitle "Manage inventory, unit pricing, and catalog visibility".
- Top Action: "+ Create New Listing" primary button (deep pine green `#00513a`).
- Verification Status Pill: `KYB Verified — Live on Marketplace ✓`.

### 2.2 Table Filter & Search Toolbar
- **Status Filter Tabs**:
  - `All Listings (8)` (active)
  - `Active on Marketplace (6)`
  - `Inactive / Out of Stock (2)`
- **Category Filter Pills**:
  - `All Categories`, `Grains & Seeds`, `Nuts & Produce`, `Oils & Extracts`
- **Search input**: "Search by commodity name, lot number..."

### 2.3 Product Catalog Data Table
Columns:
1. **Product & Lot**:
   - High-quality product photo thumbnail.
   - Title: "Yellow Maize (Grade A Bulk Bags)"
   - SKU/Lot: `Lot #NG-MAIZ-2026-08`
2. **Category**: `Grains & Seeds`
3. **Wholesale Pricing (Native Currency)**:
   - Primary: `₦25,000 / bag`
   - Secondary indicative: `≈ $16.50`
4. **Inventory & MOQ**:
   - Stock: `500 Bags (25 MT)`
   - Minimum Order: `50 Bags`
5. **Visibility Status Toggle**:
   - Toggle switch: `Active` (green switch) vs `Inactive` (gray switch).
6. **Actions**:
   - "Edit" link (routes to `/supplier/products/[id]/edit`)
   - "View Listing" (opens marketplace card)
   - Three-dot menu: "Update Stock", "Duplicate", "Deactivate".

### 2.4 Quick Summary Bar (Above Table)
- Total Active Stock: `500 Metric Tonnes`
- Catalog Items: `8 Products`
- Average Lot Size: `25 Tonnes`

---

## 3. Design Tokens & Styling (Per DESIGN.md)
- **Primary**: Deep Pine Green (`#00513a`)
- **Secondary / Accent**: Warm Gold (`#feb62f`)
- **Canvas / Surface**: Light Alabaster (`#f2fcf5`) and Card White (`#ffffff`)
- **Borders**: Soft Neutral (`#bec9c2`)
- **Typography**: `Bricolage Grotesque` (Headlines) & `Noto Sans` (Table, numbers with `tabular-nums`)
