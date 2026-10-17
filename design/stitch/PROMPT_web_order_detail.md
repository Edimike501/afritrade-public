# Stitch Generation Prompt — Screen 06: Order Detail, Pay & Horizontal Tracker

- **App & Route**: `apps/web` ➔ `/orders/[id]`
- **Device Target**: Responsive (`DESKTOP` & `MOBILE`)
- **Variant Target**: 2 Variants (Variant 1: Universal Responsive / Desktop; Variant 2: Mobile-First Touch View)
- **Role**: Wholesale Commercial Buyer
- **Priority Tier**: Tier 1 (Generation Order #6, Hero Component)

---

## 1. Screen Purpose & Design Direction
The centerpiece transactional screen of AfriTrade Connect. It provides complete transparency for wholesale cross-border purchases across Nigeria, South Africa, and Ghana:
- Clear itemized order summary with dual-price display.
- One-click safe simulated payment checkout.
- Horizontal step-by-step order & delivery tracker (standing rule 22) showing real status milestones.
- Real-time shipment log with curated logistics partner information.

Tone is professional, commercial, reliable, and approachable. Plain English only — zero banned jargon (no "arteries", no "corridors", no "parity", no "exporter" — use "supplier" or "local business"). Zero escrow claims (use "Safe Simulated Payment" / "Trade Protection").

---

## 2. Core Structure & Content Requirements

### 2.1 Header & Back Navigation
- Breadcrumb / back link: "← Back to My Orders".
- Order headline: "Order #ORD-2026-9481" with date: "Placed on October 11, 2026".
- Status Badge: Current status pill e.g., `Payment Pending` (gold) or `In Transit` (green).

### 2.2 Horizontal Order Tracker (Hero Stepper Component — Rule 22)
A clear, step-by-step horizontal progress tracker with status icons, titles, and timestamp indicators:
1. `Order Placed` (Completed checkmark - Oct 11, 09:15)
2. `Payment Pending` (Active step with pulsing indicator)
3. `Payment Confirmed` (Upcoming)
4. `Preparing & Packed` (Upcoming)
5. `Shipped & In Transit` (Upcoming)
6. `Delivered` (Upcoming)
*Note for mobile*: Stepper smoothly scrolls horizontally or stacks cleanly with connecting progress line.

### 2.3 Simulated Payment Card (Active when Payment Pending)
- **Safe Simulation Banner**:
  - `[Simulated Payment — No Real Money Moves]`
  - Clear explainer: "This MVP demonstration uses simulated payment processing. No real bank accounts or cards are charged."
- **Amount Due**:
  - Primary: `₦1,250,000` (Supplier currency)
  - Secondary: `≈ $785.00 (indicative estimate)`
- **Payment Method**: "Instant Simulated Bank Wire / Pay Provider (Mock)"
- **Action Button**: "Confirm Simulated Payment (₦1,250,000)" (deep pine green `#00513a`, high contrast, touch target >= 44px).

### 2.4 Order Items & Financial Breakdown
- **Supplier Card**: "Savannah Agro Ltd" (Verified Supplier, Kano, Nigeria).
- **Items Table / Card**:
  - Item: "Yellow Maize (Grade A Bulk Bags)"
  - Quantity: "50 Bags (50kg each, 2.5 Metric Tonnes)"
  - Unit Price: "₦25,000 per bag"
  - Total: "₦1,250,000"
- **Delivery Destination**: "Tema Industrial Zone, Greater Accra, Ghana"
- **Summary Lines**:
  - Goods Subtotal: `₦1,250,000`
  - Curated Freight & Handling: `Included in quote`
  - Total Settlement: `₦1,250,000` (or `≈ GH₵ 10,200 indicative`)

### 2.5 Curated Delivery & Logistics Card
- **Assigned Partner**: "Accra-Lagos Freight Services" (Admin-Curated Partner).
- **Waybill / Tracking Code**: `AFR-TRK-7742-NGGH`
- **Shipment Timeline**:
  - Milestone 1: Order created by buyer (Oct 11, 09:15)
  - Milestone 2: Awaiting simulated payment clearance
  - Milestone 3: Scheduled pickup from Kano central warehouse

---

## 3. Design Tokens & Styling (Per DESIGN.md)
- **Primary**: Deep Pine Green (`#00513a`)
- **Secondary / Accent**: Warm Gold (`#feb62f`)
- **Canvas / Surface**: Mint Alabaster (`#f2fcf5`) and Card White (`#ffffff`)
- **Borders**: Soft Neutral (`#bec9c2`)
- **Typography**: `Bricolage Grotesque` (Headings) & `Noto Sans` (Body, tracking tables, and prices with `tabular-nums`)
- **Touch Targets**: Minimum 44px on all action buttons and links.
