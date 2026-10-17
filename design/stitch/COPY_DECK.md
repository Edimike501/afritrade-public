# AfriTrade Connect — Master UI Copy Deck & Microcopy Library

> **Authority & Compliance**: Formally approved by project owner. Tagged inline `[AGENT DRAFT]`. Strictly reflects MVP truth: manual KYB verification, zero-risk simulated multi-currency payments, and curated regional logistics. Zero fabricated metrics, fake testimonials, or overstated claims.

---

## 1. Brand Taglines, Value Propositions & Positioning

- **Hero Primary Headline**: Buy and Sell Wholesale Across Africa with Confidence. `[AGENT DRAFT]`
- **Hero Subtitle**: Connect directly with verified suppliers in Nigeria, South Africa, and Ghana. See prices in your local currency and track shipments easily under AfCFTA. `[AGENT DRAFT]`
- **Value Pillar 1 (Verified Businesses)**: Buy from genuine, verified suppliers with checked company documents and real locations. `[AGENT DRAFT]`
- **Value Pillar 2 (Clear Local Prices)**: Clear prices in the supplier's currency with helpful estimates in your own currency. No hidden conversion surprises. `[AGENT DRAFT]`
- **Value Pillar 3 (Delivery Tracking)**: Step-by-step tracking from pickup to customs clearance and final delivery. `[AGENT DRAFT]`
- **MVP Demo Notice**: AfriTrade Connect Demo. All orders and payments use test simulation with zero real money. `[AGENT DRAFT]`

---

## 2. Navigation, Calls to Action & Global Buttons

### 2.1 Primary CTAs
- **Buyer Registration**: Join as a Buyer `[AGENT DRAFT]`
- **Supplier Registration**: Join as a Supplier `[AGENT DRAFT]`
- **Marketplace Browse**: Browse Products `[AGENT DRAFT]`
- **Checkout Action**: Place Order & Test Payment `[AGENT DRAFT]`
- **Supplier Catalog Action**: + Add New Product `[AGENT DRAFT]`
- **KYB Submission**: Submit Business Details `[AGENT DRAFT]`
- **Admin Review Action**: Review & Make Decision `[AGENT DRAFT]`

### 2.2 Secondary & Utility Buttons
- **View Details**: View Product Details `[AGENT DRAFT]`
- **Order Tracker Action**: Track Order Progress `[AGENT DRAFT]`
- **Filter Reset**: Clear Country & Category Filters `[AGENT DRAFT]`
- **Theme Switcher**: Switch Light / Dark Mode `[AGENT DRAFT]`
- **Sign Out**: Sign Out `[AGENT DRAFT]`

---

## 3. Dual-Price & Currency Microcopy

- **Indicative Price Badge**: ≈ {currency} {amount} (estimated) `[AGENT DRAFT]`
- **Conversion Tooltip**: Charged in the supplier's currency ({currency}). Converted amount is an estimate based on current exchange rates. `[AGENT DRAFT]`
- **Simulated Payment Notice**: [Demo Mode — Test Payment] `[AGENT DRAFT]`
- **Simulated Checkout Banner**: This checkout tests payment flow safely. No real card charge or bank transfer will happen. `[AGENT DRAFT]`
- **Single-Currency Cart Rule**: Each order must use one currency. Please buy products from one country/currency at a time. `[AGENT DRAFT]`

---

## 4. Verification (KYB) Microcopy

### 4.1 Supplier KYB States
- **NOT_SUBMITTED Banner**: Complete company verification to activate wholesale listing privileges. `[AGENT DRAFT]`
- **PENDING Banner**: Business credentials submitted. Compliance officers are reviewing company registration documents. `[AGENT DRAFT]`
- **APPROVED Badge**: Verified Exporter (KYB Approved) `[AGENT DRAFT]`
- **REJECTED Banner**: Business verification rejected: {rejectionReason}. Please update filing documents to re-apply. `[AGENT DRAFT]`
- **KYB Form Disclaimer**: Ensure registration number matches corporate filings with CAC (Nigeria), CIPC (South Africa), or Registrar-General (Ghana). `[AGENT DRAFT]`

### 4.2 Admin KYB Review & Decision Modal
- **Decision Title**: Commercial KYB Verification Decision `[AGENT DRAFT]`
- **Approve Action**: Approve Business Verification `[AGENT DRAFT]`
- **Reject Action**: Reject Filing with Reason `[AGENT DRAFT]`
- **Rejection Reason Placeholder**: Enter specific regulatory or documentation deficiency (e.g., CAC registration mismatch, unverified tax certificate)... `[AGENT DRAFT]`

---

## 5. Order Fulfillment & Logistics Stepper Microcopy

### 5.1 Order Tracker Milestones
1. **ORDER_PLACED**: Order Submitted `[AGENT DRAFT]`
2. **PAYMENT_PENDING**: Awaiting Settlement `[AGENT DRAFT]`
3. **PAYMENT_CONFIRMED**: Payment Confirmed (Simulated) `[AGENT DRAFT]`
4. **LOGISTICS_ASSIGNED**: Freight Carrier Assigned `[AGENT DRAFT]`
5. **PICKED_UP**: Picked Up from Facility `[AGENT DRAFT]`
6. **IN_TRANSIT**: In Transit across Corridor `[AGENT DRAFT]`
7. **CUSTOMS**: Port & Customs Clearance `[AGENT DRAFT]`
8. **DELIVERED**: Successfully Delivered `[AGENT DRAFT]`
- **CANCELLED Alert**: Order Cancelled prior to dispatch. Associated simulated ledger entries reversed. `[AGENT DRAFT]`

### 5.2 Supplier Fulfillment Controls
- **Mark Preparing**: Accept & Mark as Preparing `[AGENT DRAFT]`
- **Mark Ready for Pickup**: Mark Ready for Freight Carrier `[AGENT DRAFT]`
- **Fulfillment Notice**: Suppliers advance packaging and preparation milestones. Cross-border dispatch is confirmed by regional freight partners. `[AGENT DRAFT]`

---

## 6. Empty States & Error Message Dictionary

### 6.1 Domain-Specific Empty States
- **Marketplace Empty**: No commodities found matching the selected corridor and category filters. Try expanding your search or clearing active filters. `[AGENT DRAFT]`
- **Buyer Orders Empty**: No wholesale orders placed yet. Browse the verified marketplace to discover commodities across West and Southern Africa. `[AGENT DRAFT]`
- **Supplier Orders Empty**: No incoming wholesale orders received yet. Ensure your listings are active and priced competitively across regional corridors. `[AGENT DRAFT]`
- **Supplier Catalog Empty**: No products published in your catalog yet. Once your KYB filing is approved, list bulk merchandise with clear MOQs and packaging units. `[AGENT DRAFT]`
- **Admin Review Queue Empty**: All business verification filings have been reviewed. The compliance queue is currently clear. `[AGENT DRAFT]`
- **Admin Logistics Empty**: No logistics carriers registered yet. Add vetted freight partners covering air, sea, and overland African corridors. `[AGENT DRAFT]`

### 6.2 Typed Domain Error Copy (`ErrorCode` Taxonomy)
- **AUTH_INVALID_CREDENTIALS**: Invalid enterprise credentials. Please check your email address and password. `[AGENT DRAFT]`
- **CATALOG_SUPPLIER_NOT_VERIFIED**: Business verification required. Only approved suppliers may publish catalog listings. `[AGENT DRAFT]`
- **ORDER_CROSS_CURRENCY_REJECTED**: Mixed currency order rejected. All items in a wholesale order must share the same settlement currency. `[AGENT DRAFT]`
- **SHIPMENT_INVALID_TRANSITION**: Illegal shipment status transition. Milestone must follow canonical chain of custody. `[AGENT DRAFT]`
- **LOGISTICS_PARTNER_NOT_FOUND**: The specified freight carrier could not be located in the platform registry. `[AGENT DRAFT]`
