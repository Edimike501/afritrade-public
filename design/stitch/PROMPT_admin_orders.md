# Screen 23: Admin Order Oversight & Shipment Updates (`apps/admin` `/orders`)

## Purpose & Context
Allows platform administrators to inspect all cross-border orders across the marketplace, review payments recorded by `MockPaymentProvider`, assign curated logistics partners to orders, and advance shipment status along the server-enforced `ADMIN_SHIPMENT_TRANSITIONS` table.
Per RULES.md §12, admin routes cannot alter payment ledger states directly; administrators only advance shipment events (`ORDER_CONFIRMED` -> `PICKED_UP` -> `IN_TRANSIT` -> `CUSTOMS_CLEARED` -> `DELIVERED`).

## Roles & Access Control
- Administrator (`ADMIN`), protected by `RequireAdmin`.
- Dedicated Left Sidenav Layout (Overview, Orders Oversight [active], Logistics Partners, Users group).
- NO duplicate top horizontal navigation bar. Minimal top bar with search and status filters.

## Data & Actions
- **Header**: Orders Oversight & Shipment Transitions.
- **Filter Bar**:
  - Filter by Country: Nigeria 🇳🇬, South Africa 🇿🇦, Ghana 🇬🇭.
  - Filter by Order Status: `ALL`, `PAYMENT_CONFIRMED`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`.
  - Filter by Currency: `NGN`, `ZAR`, `GHS`, `USD`.
- **Order Oversight Table**:
  - Order ID & Timestamp: e.g. `#ORD-2024-0982` (Oct 10, 2024).
  - Buyer & Supplier: `Golden Grains Ltd (Ghana)` / `Savannah Agro Ltd (Nigeria)`.
  - Items & Lot Quantity: `10 MT Grade A Split Dried Ginger`.
  - Order Amount: `₦ 18,500,000` (Simulated Mock Payment Confirmed).
  - Assigned Carrier: `Kobo360 Cross-Border Haulage`.
  - Current Shipment Status: `PICKED_UP (Kano Central Terminal)`.
  - Permitted Status Transition Action:
    - Button: "Advance Shipment to IN_TRANSIT"
    - Modal: Add transit event note (e.g. "Crossed Seme Border post, customs documentation verified").
- **Audit Logging Notice**:
  - Banner: "Rule 4 Compliance: Every shipment update and carrier assignment is written to admin_audit_logs with admin ID, timestamp, and audit reason."

## Domain & Styling Rules
- Plain everyday English. No banned words: no `arteries`, `corridors`, `parity`, `exporter`.
- Brand Tokens: Warm Alabaster (`#FBF9F5`), Forest Green (`#1E3A2B`), Clay Accent (`#C85A32`), White cards (`#FFFFFF`), Border (`#E5DFD7`).
- 100% mobile responsive down to 320px with minimum 44px tap targets.
