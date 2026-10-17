# Stitch Generation Prompt — Screen 14: Supplier Dashboard Shell

- **App & Route**: `apps/web` ➔ `/supplier`
- **Device Target**: Responsive (`DESKTOP` with mobile-first responsiveness)
- **Variant Target**: 1 Variant
- **Role**: Wholesale Commercial Supplier
- **Priority Tier**: Tier 2 (Generation Order #14)

---

## 1. Screen Purpose & Design Direction
The operations and revenue overview hub for verified wholesale suppliers on AfriTrade Connect. Allows agricultural cooperatives and local commercial producers to monitor active catalog listings, incoming purchase orders, fulfillment progress, and simulated gross sales (strictly isolated per currency, never summed across currencies per RULES.md §1).

Tone is commercial, efficient, proud, and reliable. Plain everyday English only — zero banned jargon (no "arteries", no "corridors", no "parity", no "exporter" — use "supplier" or "local business"). Zero escrow claims.

---

## 2. Layout & Key Elements

### 2.1 Navigation & Supplier Header
- Brand: "AfriTrade Connect" with supplier portal pill badge: `Supplier Portal`.
- Supplier Navigation Links:
  - **Overview** (`/supplier`, active)
  - Products (`/supplier/products`)
  - Incoming Orders (`/supplier/orders`, badge "3 New")
  - KYB Verification (`/supplier/kyb`, badge "Verified ✓")
- User Menu: "Babatunde Adeleke" • "Savannah Agro Ltd (Kano, Nigeria 🇳🇬)".
- Environment Notice: `[Simulated Trading Demo — Zero Financial Risk]`.

### 2.2 Key Performance Indicators (Per Currency Rule)
Four executive metric cards:
1. **Total Gross Sales (NGN)**: `₦64,250,000` (Simulated fulfillment revenue).
2. **Total Gross Sales (USD / Indicative)**: `≈ $40,150` (18 completed wholesale dispatches).
3. **Active Listed Commodities**: `8 Products` (500 MT aggregate inventory).
4. **Incoming Orders Needing Action**: `3 Orders` (1 new confirmed, 2 packing/preparing).

### 2.3 Recent Incoming Purchase Orders (Action Card)
A clean table or card list showing incoming buyer orders:
- **Order #ORD-2026-9481**:
  * Buyer: `Tema Food Processors Ltd` (Accra, Ghana 🇬🇭).
  * Commodity: 50 Bags Yellow Maize (2.5 MT).
  * Amount: `₦1,250,000`.
  * Status: `Payment Confirmed` (Simulated funds cleared).
  * Action: "Prepare Shipment & Pack" button.
- **Order #ORD-2026-9442**:
  * Buyer: `Ibadan Mills Ltd` (Ibadan, Nigeria 🇳🇬).
  * Commodity: 100 Bags Soybeans (5.0 MT).
  * Amount: `₦3,200,000`.
  * Status: `Preparing / Ready for Pickup` (admin logistics partner scheduled).
  * Action: "View Logistics Waybill".

### 2.4 Quick Inventory Shelf
- Top-selling active listings with stock levels:
  * Yellow Maize (Grade A) — 500 Bags in warehouse (`₦25,000 / bag`).
  * Dried Split Ginger — 300 Bags in warehouse (`₦48,000 / bag`).
  * White Sesame Seeds — 150 Bags in warehouse (`₦55,000 / bag`).
- Quick Action: "+ Add New Wholesale Product" button.

---

## 3. Design Tokens & Styling (Per DESIGN.md)
- **Primary**: Deep Pine Green (`#00513a`)
- **Secondary / Accent**: Warm Gold (`#feb62f`)
- **Canvas / Surface**: Light Alabaster (`#f2fcf5`) and Card White (`#ffffff`)
- **Borders**: Soft Neutral (`#bec9c2`)
- **Typography**: `Bricolage Grotesque` (Headlines) & `Noto Sans` (Body, metrics with `tabular-nums`)
