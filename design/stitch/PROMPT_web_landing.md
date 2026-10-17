# Stitch Generation Prompt — Screen 01: Public Landing Page (Clean & Simplified)

- **App & Route**: `apps/web` ➔ `/`
- **Device Target**: Responsive (`DESKTOP` & `MOBILE`)
- **Variant Target**: 2 Variants (Simplified B2B layout)
- **Role**: Public Visitor, Wholesale Buyer, Supplier

---

## 1. Screen Purpose & Design Direction
A clean, friendly, and straightforward B2B wholesale marketplace landing page for AfriTrade Connect. Simple, direct language. No overly dense military or terminal styling; instead, a welcoming, trustworthy commercial marketplace layout with clear typography, generous spacing, and plain English.

---

## 2. Core Structure & Content (Clean, Light & Uncluttered)

### 2.1 Clean Header
- **Logo**: AfriTrade Connect logo mark (green crest + wheat stalk) + clear title "AfriTrade Connect".
- **Simple Navigation**:
  - "Browse Products" (`/marketplace`)
  - "How Verification Works" (`/trust`)
  - "About"
- **Header Actions**:
  - Currency Pill: Simple selector for `USD ($)`, `NGN (₦)`, `ZAR (R)`, `GHS (GH₵)`.
  - Light/Dark mode toggle icon.
  - "Log In" link.
  - "Sign Up" button (Deep Forest Emerald `#0f6b4f`, rounded, friendly).

### 2.2 Clean Hero Section (Simple & Focused)
- **Top Badge**: `Trade Across Nigeria · South Africa · Ghana` (clean pill with green check).
- **Headline**: `Buy and Sell Wholesale Across Africa with Confidence` (Bricolage Grotesque, bold, 40-48px).
- **Subtitle**: `Connect directly with verified suppliers in Nigeria, South Africa, and Ghana. See prices in your own currency and track your shipments easily under AfCFTA.` (Noto Sans, clean, readable text).
- **Two Clear Action Buttons**:
  - Primary button: `Browse Products` (Green, rounded, 44px height).
  - Secondary button: `Join as a Supplier` (Light outline button).
- **Notice**: A simple, friendly pill below buttons: `[Demo Mode: All orders and payments use test simulation with zero real money]`.
- **Hero Visual**: A clean, elegant preview card displaying 2-3 genuine featured wholesale products:
  - *Yellow Maize (Grade A)* · 500 Bags · Nigeria · `₦25,000 / bag` (≈ R 290). Verified Supplier tag.
  - *Raw Cashew Nuts* · 50 Bags · Ghana · `GH₵ 450 / bag` (≈ ₦45,000). Verified Supplier tag.

### 2.3 How It Works (3 Easy Steps)
Clean 3-column section with generous white space and friendly duotone icons:
1. **Browse Verified Suppliers**: Find real products from suppliers whose business registrations and locations have been checked.
2. **Order & Test Payment**: Place wholesale orders easily. View prices in your local currency and complete test payments safely.
3. **Track Your Delivery**: Follow your order step-by-step from dispatch to customs clearance and final arrival.

### 2.4 Why Trade with AfriTrade Connect (3 Simple Pillars)
- **Checked Businesses**: We manually check government business registrations for every supplier before they can list products.
- **Clear Prices**: Know exactly what you pay in the supplier's currency, with instant price estimates in your own currency.
- **Reliable Freight Partners**: Hand-picked shipping and transport partners handle deliveries across regional routes.

### 2.5 Clean, Simple Footer
- Links grouped clearly:
  - **For Buyers**: Browse Products, Estimated Currency Rates, How to Order.
  - **For Suppliers**: Supplier Sign Up, Business Verification Guide, Selling Rules.
  - **Countries**: Nigeria, South Africa, Ghana.
  - **Trust & Help**: Verification Process, Safety Tips, Contact Support.
  - Copyright line and simple AfCFTA educational disclaimer.
  - **For Suppliers**: Supplier Portal, KYB Verification Guide, Listing Guidelines, Packaging Standards.
  - **Trade Corridors**: Nigeria Corridors (Apapa/Kano), South Africa Corridors (Durban/JHB), Ghana Corridors (Tema/Takoradi).
  - **Trust & Governance**: Trust Center (`/trust`), Verification Process, Security Architecture, AfCFTA Rules.

---

## 3. Inline Design Tokens & Styling Rules
- **Colors**:
  - Primary: `#0f6b4f` (Forest Emerald)
  - Accent: `#e8a317` (Harvest Gold)
  - Canvas: `#f6f7f5` (Light Alabaster) / `#0a0f0d` (Dark Night Slate)
  - Surface: `#ffffff` (White Card) / `#121a15` (Dark Slate Card)
  - Text: `#1b2420` (Dark Body) / `#f0f4f2` (Light Dark-Mode Text)
  - Muted: `#5f6b65` / `#9cb0a6`
  - Border: `#dde2de` / `#202c25`
- **Typography**:
  - Headings: `Bricolage Grotesque`, 700 / 800 weight.
  - Body & Microcopy: `Noto Sans`, 400 / 500 / 600 weight.
  - Numerical metrics: `Noto Sans` with `font-variant-numeric: tabular-nums`.
- **Radii**: 8px (`--radius-sm`) for inputs/buttons, 12px (`--radius-md`) for cards, 9999px for pills.
- **Icons**: Phosphor Duotone vectors only (`Buildings`, `ShieldCheck`, `ArrowsLeftRight`, `Truck`, `CurrencyCircleDollar`).

---

## 4. Anti-Generic Checks (Must Pass)
- [x] No auto-rotating carousel.
- [x] No generic gradient blobs or pastel cards.
- [x] No emoji used as icons.
- [x] Clear AfCFTA corridor references (`NG`, `ZA`, `GH`).
- [x] Authentic physical commodities with realistic metrics (MT, bags).
