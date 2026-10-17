# Stitch Generation Prompt — Screen 12: Buyer Dashboard

- **App & Route**: `apps/web` ➔ `/dashboard`
- **Device Target**: Responsive (`DESKTOP` & `MOBILE`)
- **Variant Target**: 1 Variant
- **Role**: Wholesale Commercial Buyer
- **Priority Tier**: Tier 2 (Generation Order #12)

---

## 1. Screen Purpose & Design Direction
The commercial command center for wholesale buyers on AfriTrade Connect. It provides immediate oversight of live order progress, shipment statuses, multi-currency trade totals (strictly isolated per currency, never summed across currencies per RULES.md §1), and fast re-ordering.

Tone is executive, efficient, reliable, and approachable. Plain everyday English only — zero banned jargon (no "arteries", no "corridors", no "parity", no "exporter" — use "supplier" or "local business"). Zero escrow claims.

---

## 2. Layout & Key Elements

### 2.1 Navigation & Buyer Header
- Navigation: Header with logo, "Marketplace", "Orders", active "Dashboard", "Trust Center", and user menu.
- Buyer Greeting: "Welcome back, Amara Okafor" • "Tema Food Processors Ltd (Accra, Ghana 🇬🇭)".
- Demo Mode Pill: `[Simulated Trading Demo — Zero Real Money Risk]`.

### 2.2 Financial & Volume Metrics (Strictly Per-Currency Rule)
Separate cards displaying volume per currency without mixing:
1. **Active Shipments**: `3 Orders in Progress` (1 Payment Pending, 2 In Transit).
2. **Total Spend (NGN Purchases)**: `₦42,500,000` (Simulated).
3. **Total Spend (GHS Purchases)**: `GH₵ 185,000` (Simulated).
4. **Completed Deliveries**: `14 Orders Delivered`.

### 2.3 Live Orders & Tracking Widget (Hero Section)
- **Order 1 (Action Required)**:
  - ID: `#ORD-2026-9481` • Placed Today
  - Product: "Yellow Maize (Grade A Bulk Bags)" from "Savannah Agro Ltd" (Kano, Nigeria).
  - Lot: 50 Bags (2.5 MT) • Total: `₦1,250,000` (`≈ $785.00 indicative`).
  - Status: `Payment Pending` (warm gold badge with pulsing indicator).
  - Tracker Mini-Stepper: Step 2 of 6.
  - Action Button: "Complete Simulated Payment" (green button `#00513a`).
- **Order 2 (In Transit)**:
  - ID: `#ORD-2026-9210` • Shipped Oct 08
  - Product: "Raw Cashew Nuts" from "Sunyani Harvest Co" (Sunyani, Ghana).
  - Curated Logistics: "Accra-Lagos Freight Services" (Waybill #AFR-TRK-6612).
  - Status: `In Transit (Customs Clearance)` (green badge).
  - Tracker Mini-Stepper: Step 5 of 6.
  - Action Button: "Track Live Delivery".

### 2.4 Quick Re-Order & Saved Lots
- Horizontal row of frequently ordered wholesale commodities with images, supplier name, latest price, and "Order Again" button.
  * Yellow Maize (Grade A) — Savannah Agro Ltd (`₦25,000 / bag`)
  * Bulk Soybeans — Benue Farm Direct (`₦32,000 / bag`)
  * Refined Sunflower Oil — Cape & Veld Oils (`R 420 / can`)

---

## 3. Design Tokens & Styling (Per DESIGN.md)
- **Primary**: Deep Pine Green (`#00513a`)
- **Secondary / Accent**: Warm Gold (`#feb62f`)
- **Canvas / Surface**: Light Alabaster (`#f2fcf5`) and Card White (`#ffffff`)
- **Borders**: Soft Neutral (`#bec9c2`)
- **Typography**: `Bricolage Grotesque` (Headlines) & `Noto Sans` (Body, numbers with `tabular-nums`)
