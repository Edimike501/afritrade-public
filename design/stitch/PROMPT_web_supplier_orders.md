# Screen 18: Supplier Incoming Orders (`apps/web` `/supplier/orders`)

## Purpose & Context
Allows an approved supplier to view, review, and manage incoming orders from buyers across Nigeria, South Africa, and Ghana. 
Per resolved Conflict #5, suppliers can update order statuses (e.g., mark as "Preparing / Ready for Logistics Pickup").

## Roles & Access Control
- Supplier (`SUPPLIER`), status `APPROVED` KYB.
- Responsive layout: Dedicated left Sidenav layout (Dashboard, Products, Incoming Orders [active], KYB Verification, Settings).
- NO duplicate top horizontal navigation bar. The top bar is strictly a minimal header with Brand title, search/filter, and user profile badge.

## Data & Actions
- **Order Metrics Bar**:
  - Total Incoming Orders (e.g. `14 orders`)
  - Pending Preparation (e.g. `3 orders`)
  - Picked Up by Carrier (e.g. `8 orders`)
  - Total Revenue by Currency (strictly isolated: `₦ 48,200,000`, `R 125,000`, `$ 8,400` — never summed across currencies).
- **Incoming Orders Table / Ledger**:
  - Order ID & Date (e.g., `#ORD-2024-0891`, Oct 9, 2024)
  - Buyer Organization & Destination (e.g., `Golden Grains Ltd, Accra, Ghana 🇬🇭`)
  - Commodity Lot & Quantity (e.g., `Grade A Split Dried Ginger — 10 MT`)
  - Order Value & Currency (e.g., `₦ 18,500,000`)
  - Payment Status: `PAYMENT_CONFIRMED (Trade Protection Active)`
  - Order Status: `PREPARING`, `READY_FOR_PICKUP`, `IN_TRANSIT`, `DELIVERED`
  - Action Dropdown / Button:
    - If `PAYMENT_CONFIRMED`: "Mark as Preparing" / "Mark as Ready for Carrier Pickup"
    - "View Order Details & Shipping Manifest"
- **Security & Financial Disclosure**:
  - Banner: "Trade Protection Guaranteed: Payment is secured in simulated protection. Payout settles upon verified carrier pickup."

## Domain & Styling Rules
- Plain everyday English. No banned words: no `arteries`, `corridors`, `parity`, `exporter`. Use `supplier`, `local business`, `wholesale`.
- Brand Tokens: Warm Alabaster (`#FBF9F5`), Forest Green (`#1E3A2B`), Clay Accent (`#C85A32`), White card containers (`#FFFFFF`), refined borders (`#E5DFD7`).
- 100% mobile responsive down to 320px with minimum 44px tap targets.
