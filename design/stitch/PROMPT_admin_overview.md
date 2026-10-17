# Screen 21: Admin Platform Overview (`apps/admin` `/`)

## Purpose & Context
Platform operations summary dashboard for AfriTrade Connect administrators.
Provides operational visibility across user counts, the pending KYB review queue, active marketplace listings, overall order volume, and trade settlement volume broken down strictly per currency (NGN, ZAR, GHS, USD).

## Roles & Access Control
- Administrator (`ADMIN`), protected by `RequireAdmin`.
- Dedicated Left Sidenav Layout:
  - AfriTrade Ops Logo
  - Section 1 — Operations: Overview [active], Orders Oversight, Logistics Partners.
  - Section 2 — Users & Compliance (Rule 23): Buyers Directory, Suppliers Directory, KYB Queue, KYC Placeholder ("Coming soon").
  - Admin Profile & Logout.
- NO duplicate top horizontal navigation bar. Minimal top bar with global platform status indicator: "SIMULATED PAYMENTS MODE ACTIVE (Zero Financial Risk)".

## Data & Actions
- **KPI Summary Cards (Isolated Currencies)**:
  - Registered Buyers: `284 buyers`
  - Approved Suppliers: `86 suppliers`
  - Pending KYB Verification Queue: `5 pending reviews` (Amber action pill)
  - Active Marketplace Products: `118 products`
  - Total Orders Processed: `342 orders`
  - Total Settled Trade Volume (Per Currency — Never Summed):
    - `₦ 184,250,000` (NGN)
    - `R 1,420,000` (ZAR)
    - `GH₵ 680,000` (GHS)
    - `$ 42,500` (USD)
- **Order Status Distribution Chart / Table**:
  - Breakdown by state: `PENDING` (4), `PAYMENT_CONFIRMED` (18), `PROCESSING` (12), `DISPATCHED` (25), `DELIVERED` (283).
- **Quick Action Links**:
  - Review KYB Queue (Direct link to `/users/kyb`)
  - Manage Logistics Partners (Direct link to `/logistics`)
  - Inspect Orders (Direct link to `/orders`)

## Domain & Styling Rules
- Plain everyday English. No banned words: no `arteries`, `corridors`, `parity`, `exporter`.
- Brand Tokens: Warm Alabaster (`#FBF9F5`), Forest Green (`#1E3A2B`), Clay Accent (`#C85A32`), White cards (`#FFFFFF`), Border (`#E5DFD7`).
- 100% mobile responsive down to 320px with minimum 44px tap targets.
