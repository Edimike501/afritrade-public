# Stitch Generation Prompt — Screen 13: Buyer Order History

- **App & Route**: `apps/web` ➔ `/orders`
- **Device Target**: Responsive (`DESKTOP` & `MOBILE`)
- **Variant Target**: 1 Variant
- **Role**: Wholesale Commercial Buyer
- **Priority Tier**: Tier 2 (Generation Order #13)

---

## 1. Screen Purpose & Design Direction
The complete historical order ledger and dispatch tracking hub for wholesale commercial buyers on AfriTrade Connect. It allows buyers to filter active and completed orders, view shipment progress, trigger simulated payments on pending lots, and re-order previously delivered commodities.

Tone is organized, clear, reliable, and commercial. Plain everyday English only — zero banned jargon (no "arteries", no "corridors", no "parity", no "exporter" — use "supplier" or "local business"). Zero escrow claims.

---

## 2. Layout & Key Elements

### 2.1 Navigation & Breadcrumbs
- Header with AfriTrade Connect logo, navigation links ("Marketplace", active "Orders", "Dashboard", "Trust Center"), currency switcher (`USD / Multi`), and buyer profile.
- Page Title: "My Orders" with subtitle "Track and manage your cross-border wholesale purchases".
- Environment Pill: `[Simulated Trading Demo — Zero Real Money Risk]`.

### 2.2 Status Tabs & Filter Toolbar
- **Status Tabs**:
  - `All Orders (14)` (active)
  - `Action Required (1)` (warm gold badge)
  - `In Transit (2)` (green badge)
  - `Delivered (10)`
  - `Cancelled (1)`
- **Search & Filter Controls**:
  - Search bar: "Search by Order ID (#ORD-...), supplier, or product..."
  - Country filter pills: `All Countries`, `🇳🇬 Nigeria`, `🇿🇦 South Africa`, `🇬🇭 Ghana`.
  - Date Filter: "Last 30 Days", "Past 3 Months", "All Time".

### 2.3 Order Cards / Table Rows
Each order entry displays:
1. **Header Row**: Order ID (`#ORD-2026-9481`), date placed ("Oct 11, 2026 • 09:15"), origin country flag + supplier name.
2. **Product & Lot Details**:
   - Product photo thumbnail.
   - Title: "Yellow Maize (Grade A Bulk Bags)".
   - Quantity: 50 Bags (2.5 MT).
   - Supplier: "Savannah Agro Ltd" (Kano, Nigeria • Verified Supplier).
3. **Financials (Strictly Isolated Currency)**:
   - Primary: `₦1,250,000` (Native supplier currency).
   - Indicative estimate: `≈ $785.00`.
4. **Current Status Badge & Horizontal Mini-Tracker**:
   - Badge: `Payment Pending` (gold badge) or `In Transit` (green badge) or `Delivered` (neutral green).
   - Compact progress stepper showing completed vs remaining stages.
5. **Action Buttons**:
   - For `Payment Pending`: Primary green button "Pay Now (Simulated)" (`#00513a`) + "View Details".
   - For `In Transit`: "Track Delivery" + "View Waybill".
   - For `Delivered`: "Re-Order Lot" + "Download Invoice (PDF)".
   - For `Cancelled`: Status note "Reversed Simulated Refund" + "Details".

### 2.4 Pagination & Empty State
- Pagination bar with page numbers, items count ("Showing 1–4 of 14 orders").
- Friendly empty state when no matching orders found.

---

## 3. Design Tokens & Styling (Per DESIGN.md)
- **Primary**: Deep Pine Green (`#00513a`)
- **Secondary / Accent**: Warm Gold (`#feb62f`)
- **Canvas / Surface**: Light Alabaster (`#f2fcf5`) and Card White (`#ffffff`)
- **Borders**: Soft Neutral (`#bec9c2`)
- **Typography**: `Bricolage Grotesque` (Headings) & `Noto Sans` (Body, numbers with `tabular-nums`)
