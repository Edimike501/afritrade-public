# AfriTrade Connect — Screen Inventory & Specifications

> **Authority & Source Citations**: `design/stitch/ANSWERS.md` (Q3, Q5, Q24–Q28, Q33–Q34), `apps/api/prisma/schema.prisma`, `packages/shared/src/types/*`, `packages/shared/src/schemas/*`.  
> **Status**: Approved Exhaustive Screen Inventory. Formatted strictly in Generation & Review Priority Order per `ANSWERS.md` Q33.

---

## 1. Inventory Organization & Generation Priority

Screens are ordered strictly per **`ANSWERS.md` Q33**:

1. **Tier 1 (Priority Generation)**:
   - 1. Public Landing Page
   - 2. Trust Center & Verification Guide `[DESIGN-ONLY]` _(Owner approved right after Landing)_
   - 3. User Onboarding & Registration (Hero)
   - 4. User Login
   - 5. Marketplace Catalog
   - 6. Buyer Order Detail, Payment & Order Tracker (Hero)
   - 7. Admin Users > Buyers Directory `[DESIGN-ONLY]`
   - 8. Admin Users > Suppliers Directory `[DESIGN-ONLY]`
   - 9. Admin Users > KYB Review & Decision (Hero) `[DESIGN-ONLY]`
   - 10. Admin Users > KYC Verification Placeholder `[DESIGN-ONLY]`
   - 11. Product Detail & Bulk Order Form
2. **Tier 2 (Secondary Workflows)**:
   - 12. Buyer Dashboard
   - 13. Buyer Order History List
   - 14. Supplier Dashboard Shell
   - 15. Supplier Product Management (Catalog List & Toggle)
   - 16. Supplier Create Product Listing
   - 17. Supplier Edit Product Listing
   - 18. Supplier Incoming Orders Queue (Read-Only)
   - 19. Supplier KYB Submission & Status Overview
   - 20. Admin Dedicated Login
   - 21. Admin Platform Overview Dashboard
   - 22. Admin Master Logistics Partner Management (CRUD)
   - 23. Admin Order Oversight & Shipment Advancement

---

## 2. Exhaustive Screen Specifications

---

### SCREEN 01: Public Landing Page

- **App & Route**: `apps/web` ➔ `/`
- **Priority Tier**: Tier 1 (Generation Order #1)
- **Primary Persona**: Public Visitor, Prospective Commercial Buyer, Prospective Supplier, Evaluator
- **Purpose**: High-converting, confidence-inspiring introduction to AfriTrade Connect under AfCFTA. Explains value proposition and drives immediate registration and marketplace exploration (`ANSWERS.md` Q26).
- **Platform Emphasis**: Responsive (`MOBILE` & `DESKTOP` variants per `ANSWERS.md` Q3, Q38).
- **Primary Action**: "Register as Buyer" / "Browse Marketplace" CTAs in Hero.
- **Data Shown**:
  - Hero headline, value proposition statement, AfCFTA trade corridor badge (`Nigeria · South Africa · Ghana`).
  - Active currency ticker (`NGN ₦`, `ZAR R`, `GHS GH₵`, `USD $`).
  - How It Works 4-step pipeline: (1) Register, (2) Get Verified (KYB), (3) Place Bulk Order, (4) Track Curated Freight.
  - Featured trade corridors and sample agricultural/industrial commodities.
  - Transparent demo notice (`siteConfig.demoNotice`).
- **User Actions**:
  - Click "Register as Buyer" ➔ routes to `/register?role=BUYER`.
  - Click "Register as Supplier" ➔ routes to `/register?role=SUPPLIER`.
  - Click "Browse Marketplace" ➔ routes to `/marketplace`.
  - Click "Log in" ➔ routes to `/login`.
  - Select viewing currency via Header Currency Selector.
- **States & Error Conditions**:
  - `default`: Full landing page with animated cards and subtle duotone icons.
  - `loading`: Instant SSR pre-rendered HTML; zero skeleton flash.
  - `error`: N/A (static config content from `site.ts`).

---

### SCREEN 02: User Onboarding & Registration (Hero Component)

- **App & Route**: `apps/web` ➔ `/register`
- **Priority Tier**: Tier 1 (Generation Order #2, Hero Component per `ANSWERS.md` Q34)
- **Primary Persona**: Prospective Buyer or Prospective Supplier
- **Purpose**: Unified account registration with an interactive, prominent role-selection switch that dynamically reconfigures onboarding requirements (`ANSWERS.md` Q34).
- **Platform Emphasis**: **Mobile-first** (`deviceType: "MOBILE"`, 2 variants per `ANSWERS.md` Q3, Q38).
- **Primary Action**: Submit Registration Form ("Create Buyer Account" or "Create Supplier Account").
- **Data Shown**:
  - Segmented Role Selector: `Buyer (Wholesale Procurement)` vs `Supplier (Verified Exporter)`.
  - Form Fields (`RegisterSchema` in `@afritrade/shared`):
    - Full Name (`fullName`: min 2, max 120 chars).
    - Corporate Email (`email`: valid email, trimmed).
    - Password (`password`: min 8 chars).
    - Operating Country (`countryCode`: `NG`, `ZA`, `GH` from `Country` table).
    - Preferred Currency (`preferredCurrency`: auto-defaults to `NGN` for NG, `ZAR` for ZA, `GHS` for GH; user override allowed).
  - Supplier Information Callout: Informs suppliers that business verification (KYB) is required prior to publishing listings.
- **User Actions**:
  - Toggle between Buyer and Supplier.
  - Select country from accessible dropdown (`Dropdown.tsx`).
  - Override preferred viewing currency.
  - Submit form. On success: redirects Buyer to `/dashboard` and Supplier to `/supplier/kyb` (or `/dashboard`).
- **States & Error Conditions**:
  - `loading`: Button displays spinner and disabled state during submission.
  - `error`:
    - `AUTH_EMAIL_ALREADY_EXISTS` ➔ Inline field alert: "This corporate email is already registered."
    - `VALIDATION_FAILED` ➔ Specific field highlighting ("Password must be at least 8 characters").
    - `GEO_COUNTRY_NOT_FOUND` ➔ "Selected country is not currently supported."

---

### SCREEN 03: User Login

- **App & Route**: `apps/web` ➔ `/login`
- **Priority Tier**: Tier 1 (Generation Order #3)
- **Primary Persona**: Registered Buyer, Supplier, or Demo Evaluator
- **Purpose**: Frictionless credential sign-in with quick-fill demo pills for academic panel evaluation.
- **Platform Emphasis**: Mobile-first (`MOBILE`).
- **Primary Action**: "Sign In" button.
- **Data Shown**:
  - Email and password input fields.
  - Quick-Fill Demo Pills: `Buyer Demo (buyer@afritrade.test)` and `Supplier Demo (lagos-agro@supplier.afritrade.test)`.
  - Link to `/register`.
- **User Actions**:
  - Enter credentials or tap demo pill to pre-fill.
  - Submit form; routes automatically by role: Buyer ➔ `/dashboard`, Supplier ➔ `/supplier/products` (or `/dashboard`).
- **States & Error Conditions**:
  - `loading`: Submission spinner.
  - `error`:
    - `AUTH_INVALID_CREDENTIALS` ➔ "Invalid email or password. Please verify your credentials."
    - `RATE_LIMIT_EXCEEDED` ➔ "Too many sign-in attempts. Please wait 60 seconds."

---

### SCREEN 04: Marketplace Catalog

- **App & Route**: `apps/web` ➔ `/marketplace`
- **Priority Tier**: Tier 1 (Generation Order #4, 2 variants per `ANSWERS.md` Q38)
- **Primary Persona**: Commercial Buyer, Guest Visitor
- **Purpose**: Core product discovery hub featuring dual-price display, AfCFTA country badges, and prominent grid/list toggle (`ANSWERS.md` Q27).
- **Platform Emphasis**: Mobile-first, responsive (`MOBILE` & `DESKTOP`).
- **Primary Action**: Tap product card to view specifications, or filter catalog.
- **Data Shown**:
  - Toolbar: Search input, Category dropdown (`grains`, `raw-materials`, etc.), Origin Country filter (`NG`, `ZA`, `GH`), Currency Selector.
  - **Prominent View Mode Toggle**: Icon toggle between 3-Column Grid (`grid cols-3`) and Dense List Table (`ANSWERS.md` Q27).
  - Product Card Details (`Product` + `BusinessProfile` + `Currency`):
    - Product Photo (`ProductImage.tsx`) with automatic `/images/product-placeholder.png` fallback.
    - Category pill and Country origin badge (e.g. `🇳🇬 Nigeria`).
    - Product title (clamped 2 lines).
    - Supplier name with `Verified Supplier` green shield badge.
    - **Dual-Price Display**:
      - Primary: Listed supplier price (e.g. `GHS 150.00 / bag`).
      - Indicative Secondary: `≈ NGN 15,200 (indicative)` with tap tooltip explaining settlement currency (`ANSWERS.md` Q31).
  - Pagination bar: Page numbers, previous/next buttons, total count.
- **User Actions**:
  - Search by keyword; filter by country/category.
  - Toggle between Grid and List view.
  - Change viewing currency.
  - Click card ➔ routes to `/marketplace/[id]`.
- **States & Error Conditions**:
  - `loading`: 6 skeleton card placeholders with shimmering image aspect ratio.
  - `empty`: "No products found matching your search criteria. Try resetting filters." with "Clear Filters" CTA.
  - `error`: `INTERNAL_SERVER_ERROR` or network drop ➔ "Unable to load marketplace catalog. Tap to retry."

---

### SCREEN 05: Buyer Order Detail, Payment & Order Tracker (Hero Component)

- **App & Route**: `apps/web` ➔ `/orders/[id]`
- **Priority Tier**: Tier 1 (Generation Order #5, Hero Component per `ANSWERS.md` Q34, 2 variants per Q38)
- **Primary Persona**: Commercial Buyer
- **Purpose**: Order review, instant simulated checkout, and end-to-end shipment visibility via the **Horizontal Order Tracker** (`ANSWERS.md` Q28, Q34, `RULES.md §22`).
- **Platform Emphasis**: Mobile-first (`deviceType: "MOBILE"`).
- **Primary Action**: "Pay Now (Simulated)" when `status === PAYMENT_PENDING`.
- **Data Shown**:
  - Order ID (`#ORD-XXXX`), date placed, supplier details, origin and delivery destination.
  - **Horizontal Order Tracker**:
    - Stepper displaying all statuses in canonical sequence:
      `Order Placed` ➔ `Payment Pending` ➔ `Payment Confirmed` ➔ `Logistics Assigned` ➔ `Picked Up` ➔ `In Transit` ➔ `Customs` ➔ `Delivered`.
    - Handles `CANCELLED` state explicitly with distinct red alert treatment (`RULES.md §12`).
  - Itemized Lot Breakdown: Item name, quantity (metric tonnes / bags), unit price, subtotal in supplier currency.
  - Total Settlement Amount: Bold supplier currency total.
  - Payment Action Card:
    - Visible balanced label: `[Simulated Payment — No Real Money Moves]` (`ANSWERS.md` Q30).
    - Prominent Pay Button: `"Confirm Payment of {Amount}"`.
  - Freight & Shipment Event Log: Assigned logistics partner name, tracking events, timestamped milestones.
- **User Actions**:
  - Click "Pay Now": triggers `POST /api/v1/orders/:id/pay`, executes instant simulated payment, transitions status to `PAYMENT_CONFIRMED`.
  - Download Pro-Forma Invoice (print/export placeholder).
- **States & Error Conditions**:
  - `loading`: Stepper and card skeleton loading.
  - `error`:
    - `ORDER_NOT_FOUND` ➔ "Order not found. Please verify order ID."
    - `ORDER_ALREADY_PAID` ➔ "Payment has already been processed for this order."
    - `ORDER_CANNOT_BE_CANCELLED` ➔ "Orders already in transit cannot be cancelled."

---

### SCREEN 06: Admin Users > Buyers Directory (`DESIGN-ONLY`)

- **App & Route**: `apps/admin` ➔ `/users/buyers`
- **Priority Tier**: Tier 1 (Generation Order #6 per `ANSWERS.md` Q33)
- **Primary Persona**: Platform Administrator
- **Purpose**: Administrative oversight of all registered wholesale buyers across Nigeria, South Africa, and Ghana.
- **Platform Emphasis**: Laptop-primary (`deviceType: "DESKTOP"`, `ANSWERS.md` Q3).
- **Scope Guard**: **`DESIGN-ONLY`** (`ANSWERS.md` Q5, Q9, `RULES.md §23`).
- **Primary Action**: Filter and inspect buyer transaction volume.
- **Data Shown**:
  - Data Table:
    - Buyer Full Name & Corporate Email.
    - Country of Origin (`NG`, `ZA`, `GH`).
    - Account Registered Date.
    - Total Orders Placed count.
    - Cumulative Spend broken down per currency (`NGN`, `ZAR`, `GHS`, `USD`).
    - Account Status pill (`Active`).
  - Search & Country Filter toolbar.
- **User Actions**:
  - Search by buyer name or email.
  - Filter by country.
  - View individual buyer order history (design link).
- **States & Error Conditions**:
  - `empty`: "No registered buyers found."
  - `loading`: Table row skeletons.

---

### SCREEN 07: Admin Users > Suppliers Directory (`DESIGN-ONLY`)

- **App & Route**: `apps/admin` ➔ `/users/suppliers`
- **Priority Tier**: Tier 1 (Generation Order #7 per `ANSWERS.md` Q33)
- **Primary Persona**: Platform Administrator
- **Purpose**: Centralized oversight of all registered manufacturers, cooperatives, and exporters.
- **Platform Emphasis**: Laptop-primary (`deviceType: "DESKTOP"`, `ANSWERS.md` Q3).
- **Scope Guard**: **`DESIGN-ONLY`** (`ANSWERS.md` Q5, Q9, `RULES.md §23`).
- **Primary Action**: Audit supplier operational standing and filter by KYB state.
- **Data Shown**:
  - Data Table:
    - Business Legal Name.
    - Registered Contact Person & Email.
    - Operating Country.
    - **KYB Status Badge** (`NOT_SUBMITTED`, `PENDING`, `APPROVED`, `REJECTED`).
    - Active Catalog Listings count.
    - Total Orders Fulfilled count.
    - Date Registered.
  - Quick action: "Inspect Verification Filing" (links to KYB Review).
- **User Actions**:
  - Filter by KYB Status tabs: All, Pending, Approved, Rejected.
  - Filter by Country.
  - Search by company name.
- **States & Error Conditions**:
  - `empty`: "No suppliers registered in this category."

---

### SCREEN 08: Admin Users > KYB Review & Decision (Hero Component, `DESIGN-ONLY`)

- **App & Route**: `apps/admin` ➔ `/users/kyb` (or `/kyb`)
- **Priority Tier**: Tier 1 (Generation Order #8, Hero Component per `ANSWERS.md` Q34)
- **Primary Persona**: Platform Administrator / Compliance Officer
- **Purpose**: Manual verification review queue and decision drawer for supplier business accreditation (`ANSWERS.md` Q34, `RULES.md §3`, `§4`).
- **Platform Emphasis**: Laptop-primary (`deviceType: "DESKTOP"`).
- **Scope Guard**: **`DESIGN-ONLY`** (`ANSWERS.md` Q5, Q9, `RULES.md §23`).
- **Primary Action**: Approve or Reject supplier with mandatory audit reason.
- **Data Shown**:
  - Pending Submissions Queue Table: Business Name, Country, Contact Phone, Submitted Timestamp, Status badge.
  - **Review Detail Drawer / Modal**:
    - Legal Entity Name and Registered Trading Name.
    - Country of Incorporation (`Country.name`).
    - Corporate Registration / Tax Identifier (securely masked/labelled per `RULES.md §3`).
    - Declared Contact Phone & Business Address.
    - Prior review audit trail (if previously reviewed).
    - Mandatory Decision Form:
      - Radio buttons: `Approve Supplier` vs `Reject Supplier`.
      - Mandatory Decision Reason Textarea: "Provide explicit operational reason for compliance audit log" (`RULES.md §4`).
- **User Actions**:
  - Select submission row to open review drawer.
  - Click "Approve": activates supplier, grants catalog listing permissions.
  - Click "Reject": records reason, notifies supplier interface of required re-submission.
- **States & Error Conditions**:
  - `empty`: "KYB Review Queue is empty. All supplier submissions reviewed."
  - `error`:
    - `KYB_PROFILE_ALREADY_REVIEWED` ➔ "This supplier submission has already been reviewed."
    - `VALIDATION_FAILED` ➔ "A decision reason is mandatory for compliance audit logging."

---

### SCREEN 09: Admin Users > KYC Verification Placeholder (`DESIGN-ONLY`)

- **App & Route**: `apps/admin` ➔ `/users/kyc`
- **Priority Tier**: Tier 1 (Generation Order #9 per `ANSWERS.md` Q33)
- **Primary Persona**: Platform Administrator
- **Purpose**: Dedicated non-functional placeholder screen indicating future individual Know Your Customer (KYC) compliance workflows (`ANSWERS.md` Q5, Q9, `RULES.md §23`).
- **Platform Emphasis**: Laptop-primary (`deviceType: "DESKTOP"`).
- **Scope Guard**: **`DESIGN-ONLY`** (`ANSWERS.md` Q5).
- **Primary Action**: Informative overview only; zero user actions.
- **Data Shown**:
  - Clear, prominent header badge: `[Coming Soon — Phase 1 Compliance Roadmap]`.
  - Explanatory copy: "Individual Identity Verification (KYC) for cross-border trade representatives and logistics agents is scheduled for Phase 1. In this MVP phase, verification is restricted to corporate manual KYB approval."
  - Illustrative wireframe card showing planned future fields (National ID hash, Biometric liveness, PEP screening) marked as non-interactive preview.
  - Zero upload buttons, zero active form elements, zero APIs (`RULES.md §23`).

---

### SCREEN 10: Product Detail View & Bulk Order Form

- **App & Route**: `apps/web` ➔ `/marketplace/[id]`
- **Priority Tier**: Tier 2 (Generation Order #10)
- **Primary Persona**: Wholesale Buyer
- **Purpose**: Deep product inspection, supplier credentials verification, and bulk order configuration.
- **Platform Emphasis**: Mobile-first (`deviceType: "MOBILE"`).
- **Primary Action**: "Place Order & Proceed to Payment".
- **Data Shown**:
  - High-res product gallery/image loader (`ProductImage.tsx`).
  - Product Title, Category pill, Country of origin tag.
  - Supplier verification badge (`Verified Exporter`, `BusinessProfile.kybStatus = APPROVED`).
  - Unit Price Card:
    - Primary listed currency: e.g. `NGN 45,000 / 50kg Bag`.
    - Indicative secondary: `≈ ZAR 540 (indicative)` with info tooltip (`ANSWERS.md` Q31).
  - Bulk Order Form (`OrderForm.tsx`):
    - Quantity input with increment/decrement steppers (enforces Minimum Order Quantity MOQ).
    - Real-time calculated lot total in supplier currency.
    - Single-currency checkout constraint notice.
- **User Actions**:
  - Adjust order quantity.
  - Tap "Place Order & Pay": creates order and redirects to Screen 05 (`/orders/[id]`).
- **States & Error Conditions**:
  - `loading`: Product detail skeleton.
  - `error`:
    - `CATALOG_PRODUCT_NOT_FOUND` ➔ "This product listing does not exist or has been deactivated."
    - `ORDER_MINIMUM_QUANTITY_NOT_MET` ➔ "Quantity is below the supplier's minimum order requirement."

---

### SCREEN 11: Buyer Dashboard Shell

- **App & Route**: `apps/web` ➔ `/dashboard`
- **Priority Tier**: Tier 2 (Generation Order #11)
- **Primary Persona**: Authenticated Buyer
- **Purpose**: Personal overview of procurement activity, active deliveries, and spend per currency.
- **Platform Emphasis**: Mobile-first (`deviceType: "MOBILE"`).
- **Primary Action**: "Browse Marketplace" or "Track Active Orders".
- **Data Shown**:
  - Welcome Banner: Buyer name, corporate country flag, preferred currency pill.
  - Metric Cards: Total Orders, Active In-Transit Orders, Delivered Consignments.
  - Spend Breakdown Card: Cumulative spend displayed strictly per currency (`NGN`, `ZAR`, `GHS`, `USD`), never summed (`RULES.md §1`).
  - Quick Links: "Browse Marketplace", "View All Orders".
- **States & Error Conditions**:
  - `empty`: "You have no active trade orders. Browse verified African suppliers to begin trading."
  - `forbidden`: If accessed by unauthenticated user ➔ redirects to `/login`.

---

### SCREEN 12: Buyer Order History List

- **App & Route**: `apps/web` ➔ `/orders`
- **Priority Tier**: Tier 2 (Generation Order #12)
- **Primary Persona**: Authenticated Buyer
- **Purpose**: Historical directory of all orders placed by the buyer with direct tracker links.
- **Platform Emphasis**: Mobile-first (`deviceType: "MOBILE"`).
- **Primary Action**: Tap order row to view tracker (`/orders/[id]`).
- **Data Shown**:
  - Order Table / Card List (`OrderTable.tsx`):
    - Order ID (`#ORD-XXXX`).
    - Date placed.
    - Items summary (e.g., "50× Yellow Maize (50kg)").
    - Total Amount in settlement currency.
    - Status Badge (`OrderStatusBadge`: `Order placed`, `Payment pending`, `Payment confirmed`, `In transit`, `Delivered`, `Cancelled`).
    - Assigned Logistics Carrier name.
- **States & Error Conditions**:
  - `empty`: "No orders placed yet." with CTA button to marketplace.

---

### SCREEN 13: Supplier Dashboard Shell

- **App & Route**: `apps/web` ➔ `/supplier` (`Conflict 7 resolved`)
- **Priority Tier**: Tier 2 (Generation Order #13)
- **Primary Persona**: Authenticated Supplier
- **Purpose**: Commercial overview for exporters, highlighting verification standing, catalog metrics, and revenue.
- **Platform Emphasis**: Laptop-primary, fully responsive across mobile, tablet, and desktop (`Conflict 6 resolved`).
- **Primary Action**: "Complete Business Verification" (if pending) or "+ Add New Product" (if approved).
- **Data Shown**:
  - **KYB Status Alert Banner**:
    - If `NOT_SUBMITTED`: Yellow alert warning that catalog listing is locked, with "Submit Verification" button.
    - If `PENDING`: Blue info banner: "Your business details are under compliance review."
    - If `APPROVED`: Green badge: "Verified Supplier — Full Listing Privileges Active."
    - If `REJECTED`: Red alert displaying admin rejection reason and "Update Filing" CTA.
  - Metrics Grid: Active Catalog Products, Incoming Orders count, Gross Revenue per currency.
- **States & Error Conditions**:
  - `forbidden`: If accessed by a Buyer ➔ "Access restricted to registered suppliers."

---

### SCREEN 14: Supplier Product Management (Catalog List & Toggle)

- **App & Route**: `apps/web` ➔ `/supplier/products`
- **Priority Tier**: Tier 2 (Generation Order #14)
- **Primary Persona**: Authenticated Supplier
- **Purpose**: Inventory cockpit to inspect, activate, deactivate, or edit bulk merchandise listings.
- **Platform Emphasis**: Laptop-primary (`deviceType: "DESKTOP"`).
- **Primary Action**: "+ Add New Product" button.
- **Data Shown**:
  - Products Table: Thumbnail, Title, Category, Unit Price + Currency, Active status toggle switch, Date added.
  - Gating Alert: If KYB is not `APPROVED`, table renders in disabled state with clear warning: "Listing creation is locked until KYB approval."
- **User Actions**:
  - Toggle `isActive` switch on/off.
  - Click "Edit" ➔ routes to Screen 16.
  - Click "+ Add Product" ➔ routes to Screen 15.
- **States & Error Conditions**:
  - `empty`: "No products in your catalog yet. Add your first bulk listing."
  - `error`: `CATALOG_SUPPLIER_NOT_VERIFIED` ➔ "Only approved suppliers can manage products."

---

### SCREEN 15: Supplier Create Product Listing

- **App & Route**: `apps/web` ➔ `/supplier/products/new`
- **Priority Tier**: Tier 2 (Generation Order #15)
- **Primary Persona**: Approved Supplier
- **Purpose**: Form to publish a new wholesale trade listing priced in a supported currency.
- **Platform Emphasis**: Laptop-primary (`deviceType: "DESKTOP"`).
- **Primary Action**: "Publish Product Listing".
- **Data Shown**:
  - Form Fields (`CreateListingSchema`):
    - Product Title (min 3 chars).
    - Description (detailed trade specs, packaging, grade).
    - Category dropdown (Grains, Oilseeds, Cocoa/Coffee, Textiles, Raw Materials).
    - Price Decimal String (e.g. `12500.00`).
    - Currency selector (`NGN`, `ZAR`, `GHS`, `USD`).
    - Image URL input (with preview) or placeholder selection.
- **States & Error Conditions**:
  - `forbidden`: `KYB_SUPPLIER_NOT_APPROVED` ➔ Blocks form rendering if supplier KYB is not approved.

---

### SCREEN 16: Supplier Edit Product Listing

- **App & Route**: `apps/web` ➔ `/supplier/products/[id]/edit`
- **Priority Tier**: Tier 2 (Generation Order #16)
- **Primary Persona**: Approved Supplier
- **Purpose**: Update pricing, specifications, or imagery of an existing catalog item.
- **Platform Emphasis**: Laptop-primary (`deviceType: "DESKTOP"`).
- **Primary Action**: "Save Changes".
- **Data Shown**: Pre-populated listing form matching Screen 15.

---

### SCREEN 17: Supplier Incoming Orders & Fulfillment Queue

- **App & Route**: `apps/web` ➔ `/supplier/orders`
- **Priority Tier**: Tier 2 (Generation Order #17)
- **Primary Persona**: Authenticated Supplier
- **Purpose**: Operational order queue where suppliers track wholesale orders and advance preparation milestones (`Conflict 5 resolved`).
- **Platform Emphasis**: Laptop-primary, fully responsive across mobile, tablet, and desktop (`Conflict 6 resolved`).
- **Primary Action**: "Accept & Prepare Order" / "Mark Ready for Pickup".
- **Data Shown**:
  - Orders Table: Order ID, Buyer destination country, Products lot breakdown, Settlement total, Payment status badge (`PAYMENT_CONFIRMED`), Fulfillment status badge.
  - Action Controls:
    - Orders in `PAYMENT_CONFIRMED`: Contextual button: `"Mark as Preparing"` (transitions order state to indicate active fulfillment).
    - Orders in preparation: Button: `"Ready for Pickup"` (alerts admin and assigned logistics carrier).
  - Explanatory Banner: "Suppliers advance preparation milestones once payment is confirmed. Cross-border carrier dispatch and customs clearance remain coordinated by platform logistics."
- **States & Error Conditions**:
  - `empty`: "No incoming orders received yet."
  - `error`: `ORDER_INVALID_TRANSITION` ➔ "Illegal status transition for supplier order advancement."

---

### SCREEN 18: Supplier KYB Submission & Status Overview

- **App & Route**: `apps/web` ➔ `/supplier/kyb`
- **Priority Tier**: Tier 2 (Generation Order #18)
- **Primary Persona**: Authenticated Supplier
- **Purpose**: Business profile registration form and live verification tracking screen.
- **Platform Emphasis**: Laptop-primary (`deviceType: "DESKTOP"`).
- **Primary Action**: "Submit Business for Verification" or "Update Information".
- **Data Shown**:
  - Business Legal Name input.
  - Operating Country selector.
  - Official Registration / Tax Reference number.
  - Corporate Phone & Physical Address.
  - Live Status Banner (`NOT_SUBMITTED`, `PENDING`, `APPROVED`, `REJECTED`).
  - If `REJECTED`: Prominent display of `kybRejectReason` with field correction guidance.
- **States & Error Conditions**:
  - `error`: `KYB_PROFILE_ALREADY_SUBMITTED` ➔ "Filing is currently under administrative review."

---

### SCREEN 19: Admin Dedicated Login

- **App & Route**: `apps/admin` ➔ `/login`
- **Priority Tier**: Tier 2 (Generation Order #19)
- **Primary Persona**: Platform Administrator
- **Purpose**: Isolated sign-in gateway for platform administrators (`apps/admin/src/app/login/page.tsx`).
- **Platform Emphasis**: Laptop-primary (`deviceType: "DESKTOP"`).
- **Primary Action**: "Admin Portal Sign In".
- **Data Shown**: Corporate administrator login form, security badge, quick demo sign-in trigger (`admin@afritrade.test`).
- **States & Error Conditions**:
  - `error`: `AUTH_INVALID_CREDENTIALS` ➔ "Invalid administrator credentials. Access restricted to authorized personnel."

---

### SCREEN 20: Admin Platform Overview Dashboard

- **App & Route**: `apps/admin` ➔ `/`
- **Priority Tier**: Tier 2 (Generation Order #20)
- **Primary Persona**: Platform Administrator
- **Purpose**: Operational control tower displaying high-level platform health and volumes.
- **Platform Emphasis**: Laptop-primary (`deviceType: "DESKTOP"`).
- **Primary Action**: Navigate to Pending KYB queue or Order Oversight.
- **Data Shown**:
  - Platform Metric Cards: Total Registered Buyers, Total Suppliers, Pending KYB Queue count, Active Products count, Total Orders count.
  - Cumulative Trade Volume Breakdown: Grouped cards per currency (`NGN`, `ZAR`, `GHS`, `USD`).
  - Orders by Status breakdown chip grid.
  - Quick action links: `KYB Review Queue`, `All Orders`, `Logistics Partners`.

---

### SCREEN 21: Admin Master Logistics Partner Management (CRUD)

- **App & Route**: `apps/admin` ➔ `/logistics`
- **Priority Tier**: Tier 2 (Generation Order #21)
- **Primary Persona**: Platform Administrator
- **Purpose**: Curated partner list management (`LogisticsPartner` table) covering corridors (`RULES.md §6`).
- **Platform Emphasis**: Laptop-primary (`deviceType: "DESKTOP"`).
- **Primary Action**: "+ Register Logistics Partner".
- **Data Shown**:
  - Partners Directory Table: Company Name, Country Coverage pills (e.g. `[NG]`, `[ZA]`, `[GH]`), Contact Email, Contact Phone, Active status toggle switch.
  - Creation/Edit Modal: Partner Name, Coverage checkboxes, contact info, operational notes.
- **States & Error Conditions**:
  - `empty`: "No logistics partners registered. Add curated freight providers."
  - `error`: `LOGISTICS_PARTNER_NOT_FOUND` ➔ "Logistics partner record not found."

---

### SCREEN 22: Admin Order Oversight & Shipment Advancement

- **App & Route**: `apps/admin` ➔ `/orders` and `/orders/[id]`
- **Priority Tier**: Tier 2 (Generation Order #22)
- **Primary Persona**: Platform Administrator
- **Purpose**: System-wide order auditing and manual shipment milestone advancement (`ADMIN_SHIPMENT_TRANSITIONS`).
- **Platform Emphasis**: Laptop-primary (`deviceType: "DESKTOP"`).
- **Primary Action**: Assign logistics partner and advance shipment status.
- **Data Shown**:
  - Orders Master Table (`/orders`): Order ID, Buyer, Items, Currency, Total Amount, Current Status, Assigned Carrier, Date.
  - Single Order Management View (`/orders/[id]`):
    - Order items, buyer details, and payment verification confirmation.
    - **Shipment Control Panel** (`ShipmentPanel.tsx`):
      - Logistics Partner selector dropdown (`Dropdown.tsx`).
      - Restricted transition buttons governed by `ADMIN_SHIPMENT_TRANSITIONS`:
        `Mark: Logistics Assigned` ➔ `Mark: Picked Up` ➔ `Mark: In Transit` ➔ `Mark: At Customs` ➔ `Mark: Delivered` (or `Cancel Order`).
      - Note: Admin CANNOT manually transition an order from `PAYMENT_PENDING` to `PAYMENT_CONFIRMED` (`RULES.md §12`).
- **States & Error Conditions**:
  - `error`:
    - `SHIPMENT_INVALID_TRANSITION` ➔ "Illegal status transition for administrative shipment update."
    - `ORDER_ALREADY_PAID` / `ORDER_CANNOT_BE_CANCELLED`.

---

### SCREEN 23: Trust Center & Verification Guide `[DESIGN-ONLY]`

- **App & Route**: `apps/web` ➔ `/trust`
- **Priority Tier**: Screen 02 in Tier 1 generation (Owner approved placement immediately following Screen 01 Landing Page; derived from `11_REFERENCE_ANALYSIS.md`).
- **Primary Persona**: Public Visitor, Prospective Commercial Buyer, Prospective Supplier, AfCFTA Auditor
- **Purpose**: Authoritative, transparent explanation of platform governance, vetting, and fulfillment mechanisms. Establishes cross-border institutional trust without misrepresenting MVP capabilities.
- **Platform Emphasis**: Responsive (`MOBILE` & `DESKTOP` variants).
- **Primary Action**: "Start Verification (Register as Supplier)" / "Browse Verified Marketplace" CTAs.
- **Data Shown**:
  - Four Core Trust Pillars:
    1. **Manual KYB Business Verification**: Required company registration, tax identification, and manual admin verification workflow (`PENDING` ➔ `APPROVED` / `REJECTED` with reason).
    2. **Simulated Payment Security (`PAYMENTS_MODE=simulated`)**: Explanation of pilot simulated ledger, zero buyer card/wire risk, dual-currency transparency, and future transition to regulated local payment providers per currency.
    3. **Curated Logistics & Chain of Custody**: Hand-picked logistics partners, clear shipment status transitions, and administrative tracking oversight.
    4. **Safe Cross-Border B2B Trading Guidelines**: Guidance on inspecting trade terms, minimum order quantities, and AfCFTA customs rules.
  - Interactive FAQ Accordion addressing common business security questions.
  - Trust Badges: Verified Exporter seal preview and AfCFTA pilot designation.
- **User Actions**:
  - Toggle FAQ accordion topics.
  - Click "Apply for Supplier Verification" ➔ routes to `/register?role=SUPPLIER`.
  - Click "Explore Verified Commodities" ➔ routes to `/marketplace`.
- **States & Error Conditions**:
  - Static informational screen with responsive layout, zero runtime data fetching errors.
