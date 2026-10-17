# Stitch Generation Prompt — Screen 11: Product Detail & Bulk Order

- **App & Route**: `apps/web` ➔ `/marketplace/[id]`
- **Device Target**: Responsive (`DESKTOP` with mobile-first column stacking)
- **Variant Target**: 1 Variant
- **Role**: Wholesale Commercial Buyer
- **Priority Tier**: Tier 2 (Generation Order #11)

---

## 1. Screen Purpose & Design Direction
The single-item wholesale conversion screen in AfriTrade Connect. It provides complete specification transparency for agricultural and commercial bulk commodities, verified supplier credentials, dual-price currency conversion, and an instant bulk order quantity calculator.

Tone is professional, commercial, transparent, and approachable. Plain everyday English only — zero banned jargon (no "arteries", no "corridors", no "parity", no "exporter" — use "supplier" or "local business"). Zero escrow claims.

---

## 2. Layout & Key Elements

### 2.1 Navigation & Breadcrumb
- Header with AfriTrade Connect logo, marketplace links, currency switcher (`USD / Multi`), and buyer account.
- Breadcrumb: `Marketplace > Grains & Seeds > Yellow Maize (Grade A)`

### 2.2 Two-Column Layout (Desktop Grid / Mobile Stack)
- **Left Column (Product Gallery & Specifications, ~60% width)**:
  - **High-Resolution Photo Gallery**:
    * Large hero image: Grade A golden yellow dried maize grains in clean wholesale sacks inside a modern agricultural warehouse.
    * 3 thumbnail views: Grain macro close-up, stacked warehouse pallets, bagged export seal.
    * Overlaid badges: `🇳🇬 Kano, Nigeria` and `Verified Supplier`.
  - **Lot Description & Commercial Specifications**:
    * Clean description paragraph explaining moisture grade, harvest date, and bulk packaging.
    * Tabular Specs Grid:
      - Moisture Content: `11.5% max (dry)`
      - Purity / Broken Kernels: `< 2.0%`
      - Packaging: `50kg Multi-ply woven poly bags`
      - Harvest Date: `Q3 2026 (Fresh season)`
      - Storage Location: `Bompai Industrial Zone, Kano`
  - **Verified Supplier Card**:
    * "Savannah Agro Ltd" + Verified green shield badge.
    * Registration: Kano State Agribusiness Cooperative.
    * Direct Contact action: "Send In-Platform Inquiry".
  - **Curated Shipping & Logistics Notice**:
    * Delivery arranged via admin-curated logistics partners (e.g. Accra-Lagos Freight Services).
    * Typical transit time: 3-5 business days.

- **Right Column (Sticky Bulk Order & Pricing Calculator, ~40% width)**:
  - **Wholesale Price Box (Dual Currency)**:
    * Primary price: `₦25,000 / bag` (Native supplier currency).
    * Indicative price: `≈ $16.50 / bag (indicative estimate)`.
  - **Warehouse Stock & MOQ**:
    * Minimum Order Quantity: `50 Bags (2.5 Metric Tonnes)`.
    * Available Warehouse Stock: `500 Bags ready for dispatch`.
  - **Interactive Bulk Order Calculator**:
    * Quantity input counter: `50` (stepper buttons `-` / `+`).
    * Real-time calculation:
      - Goods Subtotal: `₦1,250,000`
      - Estimated Port Delivery: `Included in quote`
      - Total Settlement Amount: `₦1,250,000` (or `≈ $785.00 indicative`)
  - **Primary CTA Button**:
    * "Order & Proceed to Payment" (deep pine green `#00513a`, 48px height, high contrast).
  - **Safe Simulation Banner**:
    * `[Demo Sandbox — No Real Money Moves]`
    * "Safe test environment: All orders and payments are simulated with zero financial risk."

---

## 3. Design Tokens & Styling (Per DESIGN.md)
- **Primary**: Deep Pine Green (`#00513a`)
- **Secondary / Accent**: Warm Gold (`#feb62f`)
- **Canvas / Surface**: Light Alabaster (`#f2fcf5`) and Card White (`#ffffff`)
- **Borders**: Soft Neutral (`#bec9c2`)
- **Typography**: `Bricolage Grotesque` (Headlines) & `Noto Sans` (Specs, pricing with `tabular-nums`)
