# AfriTrade Connect — Master Design System Specification

> **Authority & Compliance**: Formally approved by project owner. Every rule and token is grounded strictly in `design/stitch/ANSWERS.md` (tagged inline `[ANSWERS Qx]`), `design/stitch/04_DOMAIN_UI_RULES.md`, `05_TECH_CONSTRAINTS.md`, `09_TOKEN_AUDIT.md`, and master architecture decisions.  
> **Target Framework**: Tailwind CSS + shadcn/ui mapped to shared CSS Custom Properties in `@afritrade/ui`.

---

## 1. Brand Personality & Visual Tenets

- **Core Brand Personality**: **Industrial, Trustworthy, Pan-African, Commercial, Grounded, Efficient** `[ANSWERS Q1]`.
- **Tone & Voice**: Authoritative B2B wholesale trade infrastructure under AfCFTA. High-density, utilitarian, confident, and transparent `[ANSWERS Q1, Q7]`.
- **Look & Feel**: Real physical goods, concrete logistics tracking, and verified corporate entities. Rejects whimsical consumer playfulness, gradient blobs, and stock SaaS cliches `[ANSWERS Q7, Q8]`.
- **Corridor Focus**: Rooted in Nigeria (`NG`), South Africa (`ZA`), and Ghana (`GH`) trade flows `[ANSWERS Q29]`.

---

## 2. Design Tokens: Light & Dark Palettes

Tokens are defined as semantic CSS custom properties in `packages/ui` and mapped into `tailwind.config.ts` `[ANSWERS Q2, Q4, Q35]`.  
Default mode follows device OS (`prefers-color-scheme`); an accessible icon toggle overrides it via a lightweight client cookie `[ANSWERS Q4; Conflict 4/Policy Decision]`.

```css
:root {
  /* [ANSWERS Q15, Q19] Light Mode Palette */
  --background: 120 7% 97%;         /* #f6f7f5 - Warm Alabaster Canvas */
  --foreground: 153 14% 13%;        /* #1b2420 - Dark Forest Slate Body */
  
  --card: 0 0% 100%;                /* #ffffff - Pure White Surface */
  --card-foreground: 153 14% 13%;   /* #1b2420 */
  
  --popover: 0 0% 100%;             /* #ffffff - Popover / Dropdown */
  --popover-foreground: 153 14% 13%;/* #1b2420 */
  
  --primary: 162 75% 24%;           /* #0f6b4f - Deep Forest Emerald (5.59:1 AA) [ANSWERS Q15] */
  --primary-foreground: 0 0% 100%;  /* #ffffff */
  --primary-hover: 162 78% 19%;     /* #0b5640 - Hover Emerald */
  
  --secondary: 135 11% 94%;         /* #edf1ee - Soft Green Tint */
  --secondary-foreground: 162 75% 24%; /* #0f6b4f */
  
  --muted: 135 11% 94%;             /* #edf1ee */
  --muted-foreground: 152 6% 40%;   /* #5f6b65 - Muted Slate (5.25:1 AA) */
  
  --accent: 40 82% 50%;             /* #e8a317 - Harvest Gold Highlight [ANSWERS Q15] */
  --accent-foreground: 30 50% 10%;  /* #20180a - High-contrast text on gold */
  
  --destructive: 3 71% 41%;         /* #b3261e - Crimson Danger (6.12:1 AA) */
  --destructive-foreground: 0 0% 100%;
  
  --success: 147 62% 30%;           /* #1d7a46 - Trade Green (4.74:1 AA) */
  --success-foreground: 0 0% 100%;
  
  --warning: 41 100% 30%;           /* #9a6a00 - Deep Amber Warning (4.62:1 AA) */
  --warning-foreground: 0 0% 100%;
  
  --border: 135 7% 87%;             /* #dde2de - Subtle 1px structural stroke */
  --input: 135 7% 87%;              /* #dde2de */
  --ring: 162 75% 24%;              /* #0f6b4f - Focus Ring */

  /* [ANSWERS Q17] Radius Tokens */
  --radius-sm: 8px;                 /* Inputs, buttons, triggers */
  --radius-md: 12px;                /* Cards, tables, modals */
  --radius-lg: 16px;                /* Hero containers, slide drawers */
  --radius-full: 9999px;            /* Badges, status pills, filter chips ONLY */
  --radius: 12px;
}

.dark {
  /* [ANSWERS Q4, Q15] Dark Mode Inversions (Night Slate) */
  --background: 150 20% 5%;         /* #0a0f0d - Night Slate Canvas */
  --foreground: 150 10% 95%;        /* #f0f4f2 - High-contrast Light Body */
  
  --card: 150 15% 9%;               /* #121a15 - Elevated Green-Slate Surface */
  --card-foreground: 150 10% 95%;   /* #f0f4f2 */
  
  --popover: 150 15% 9%;            /* #121a15 */
  --popover-foreground: 150 10% 95%;/* #f0f4f2 */
  
  --primary: 158 64% 52%;           /* #10b981 - Vibrant Emerald (7.2:1 AA on dark) */
  --primary-foreground: 150 30% 6%; /* #09130e - Dark text on vibrant primary */
  --primary-hover: 156 72% 67%;     /* #34d399 - Mint Hover */
  
  --secondary: 150 15% 15%;         /* #1f2d24 */
  --secondary-foreground: 150 10% 95%;
  
  --muted: 150 15% 15%;             /* #1f2d24 */
  --muted-foreground: 150 8% 65%;   /* #9cb0a6 - 5.4:1 contrast on surface */
  
  --accent: 43 96% 56%;             /* #fbbf24 - Bright Harvest Gold (7.5:1 AA) */
  --accent-foreground: 30 50% 10%;  /* #20180a */
  
  --destructive: 0 91% 71%;         /* #f87171 - Red-400 (6.2:1 AA) */
  --destructive-foreground: 0 0% 100%;
  
  --success: 158 64% 52%;           /* #34d399 - Emerald-400 (6.8:1 AA) */
  --success-foreground: 150 30% 6%;
  
  --warning: 43 96% 56%;            /* #fbbf24 - Amber-400 (7.5:1 AA) */
  --warning-foreground: 30 50% 10%;
  
  --border: 150 12% 16%;            /* #202c25 - Crisp dark boundary */
  --input: 150 12% 16%;
  --ring: 158 64% 52%;              /* #10b981 */
}
```

---

## 3. Typography Architecture & Glyph Coverage

Per **`ANSWERS.md` Q16**: strictly **2 Google Fonts families**, zero paid or local font files.

1. **Headings, Display & Hero Titles**:
   - **Font**: **Bricolage Grotesque** `[ANSWERS Q16]`
   - **Weights**: 700 (Bold), 800 (ExtraBold)
   - **Characteristics**: Wide, expressive, architectural proportions. Projects industrial confidence and sovereign trade legitimacy without generic SaaS monotony.
2. **Body Copy, Form Fields, UI Labels & Navigation**:
   - **Font**: **Noto Sans** `[ANSWERS Q16]`
   - **Weights**: 400 (Regular), 500 (Medium), 600 (SemiBold)
   - **Pan-African Diacritic Coverage Mandate**: Must cleanly render Yoruba (`ọ`, `ẹ`, `ṣ`), Twi/Akan (`ɛ`, `ɔ`), Hausa implosives (`ɓ`, `ɗ`, `ƙ`), and Afrikaans without fallback distortion or browser tofu `[ANSWERS Q16]`.
3. **Prices, Minor Units, Order IDs & Financial Tables**:
   - **Font**: **Noto Sans (Tabular)** `[ANSWERS Q16]`
   - **CSS Feature**: `font-variant-numeric: tabular-nums`
   - **Rule**: All monetary figures, order references (`#ORD-9482`), dates, and weight metrics (`MT`, `kg`) must use tabular numbers for vertical column alignment.

---

## 4. Elevation, Borders & Motion Rules

- **Borders & Elevation Standard**:
  - Maximum **two elevation levels** `[ANSWERS Q19]`.
  - Crisp, structural **1px low-contrast border** (`--border`) on all cards, tables, inputs, and popovers.
  - `--shadow-sm`: `0 1px 3px rgba(0,0,0,0.06)` for standard interactive cards and inputs `[ANSWERS Q19]`.
  - `--shadow-md`: `0 4px 12px rgba(0,0,0,0.08)` for elevated dropdowns, modal dialogs, and slide drawers `[ANSWERS Q19]`.
- **Motion & Transition Constraints**:
  - Durations: `150ms` (hover, click, state toggle) to `250ms` (drawer slide, modal fade) `[ANSWERS Q20]`.
  - Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (snappy ease-out).
  - Accessibility: Must strictly honor `@media (prefers-reduced-motion: reduce)` by disabling all transform and opacity transitions `[ANSWERS Q20]`.

---

## 5. Iconography: Phosphor Duotone Standard

- **Icon Family**: **Phosphor Icons** (`@phosphor-icons/react`), weight **Duotone** `[ANSWERS Q21, Q36]`.
- **Role in shadcn/ui**: Replaces Lucide icons across all shared components `[ANSWERS Q36]`.
- **Styling Rule**: Saturated primary stroke in `--primary` or `--foreground`, paired with a 15–20% translucent secondary fill. Adds tactile visual depth for customs, freight containers, grains, and seals `[ANSWERS Q21]`.
- **Zero Emoji as UI Icons**: Emoji in place of system icons is strictly banned `[ANSWERS Q21; Anti-Rubric]`.

---

## 6. Layout Density & Viewport Patterns

Per **`ANSWERS.md` Q3, Q25, Q38** and master architecture decisions:

- **Universal Responsiveness Mandate**:
  - **Every single screen and component must be fully responsive across ALL viewports** (320px mobile up to 4K desktop) `[Conflict 6 resolved]`.
  - Mobile viewports prioritize 1-column stacks, touch-friendly sheets, and sticky bottom bars.
  - Desktop viewports leverage high-density data tables, multi-column metrics, and persistent left sidebars.
- **`apps/web` (Port 3030 - Public, Buyer, Supplier)**:
  - Public Header: Brand logo + mark, nav links, currency selector pill, auth CTA buttons. Collapses to slide drawer on mobile `[ANSWERS Q24]`.
  - Authenticated Buyer / Supplier: Compact sticky header + collapsible left sidebar (w-64 desktop) / bottom drawer (mobile) `[ANSWERS Q24]`.
- **`apps/admin` (Port 3031 - Internal Operations Control Tower)**:
  - Dedicated left sidebar navigation with distinct "Operations" and "Users" groups `[ANSWERS Q5, Q25]`.
  - Data-dense tables with status filter tabs, search bars, and drawer review inspectors `[ANSWERS Q25]`.

---

## 7. Accessibility (WCAG 2.2 AA) Non-Negotiables

Per **`ANSWERS.md` Q37**:
1. **Contrast**: Minimum `4.5:1` for normal text; `3:1` for large text (≥18pt or bold ≥14pt) and UI component boundaries across both Light and Dark modes.
2. **Touch Target Size**: Minimum **`44×44 px`** interactive area on all buttons, links, toggles, and select triggers.
3. **Typography Legibility**: Minimum `16px` (`1rem`) body font size on mobile to prevent browser zoom jumps.
4. **Status Never by Color Alone**: Every state (e.g., `Approved`, `In Transit`, `Cancelled`) must pair color with an **explicit text label and Phosphor duotone icon** `[ANSWERS Q37]`.

---

## 8. Domain-Specific Component Specifications

### 8.1 Dual-Price Display Standard `[ANSWERS Q31; RULES §1]`
Every product card and detail page displays prices in two lines:
1. **Primary Line (Authoritative Settlement)**: Bold, prominent text in supplier's listed currency (e.g. `GHS 150.00 / 50kg bag`).
2. **Secondary Line (Indicative Conversion)**: Muted text shown when viewer currency differs from supplier currency:  
   `≈ NGN 15,000 (indicative)`  
   Accompanied by tooltip copy: `"Billed in supplier currency. Converted price is indicative only."`

### 8.2 Simulated Payment Labelling `[ANSWERS Q30; RULES §2]`
- All checkout screens, payment triggers, and order summaries must display a balanced, visible badge:  
  `[Simulated Transaction — MVP Demo Mode]`
- Clear and transparent without alarmist or broken red warning styling `[ANSWERS Q30]`.

### 8.3 Order Tracker (Horizontal Stepper) `[ANSWERS Q28; RULES §22]`
- Visual representation: Horizontal 8-milestone pipeline:  
  `Placed` ➔ `Payment Pending` ➔ `Payment Confirmed` ➔ `Logistics Assigned` ➔ `Picked Up` ➔ `In Transit` ➔ `Customs` ➔ `Delivered`.
- Special State: Distinct red status card for `CANCELLED` with timestamp and cancellation reason.
- Evolution Note: Data model (`ORDER_STATUS_TRANSITIONS`) is identical to ensure a drop-in transition to a geographic map view in future launches.

### 8.4 Supplier Order Status Update Controls `[Conflict 5 resolved]`
- On `/supplier/orders`, orders in `PAYMENT_CONFIRMED` state render contextual fulfillment triggers:  
  `"Mark as Preparing"` ➔ `"Ready for Pickup"`.
- Admin retains logistics carrier assignment, in-transit milestones, customs, and delivery updates.

### 8.5 Marketplace Grid / List Toggle `[ANSWERS Q27]`
- The marketplace header features a dual-state icon toggle:
  - **Grid Mode**: 3-column card layout displaying verified badge, photo, dual price, MOQ, and origin corridor pill.
  - **List Mode**: High-density horizontal rows for professional procurement managers comparing specs, bulk lot volume, and FOB terms.

### 8.6 Admin "Users" Group `[ANSWERS Q5; Conflict 2 resolved]`
- Admin sidebar contains the "Users & Verification" group:
  - `All Users Directory` (`/users`): Unified paginated directory of all accounts (`GET /api/v1/admin/users`) with role filter tabs (`ALL`, `BUYER`, `SUPPLIER`, `ADMIN`), corridor filter pills (`ALL`, `NG`, `ZA`, `GH`), attached `BusinessProfile` inspection drawer (`BusinessProfileDrawer`), and direct KYB status editing (`APPROVED`, `PENDING`, `REJECTED`) even after verification.
  - `KYB Review Queue` (`/users/kyb` & `/kyb`): Full verification review across `PENDING`, `APPROVED`, and `REJECTED` tabs, private R2 signed-URL document inspection, and KYB status editing at any time.
  - `KYC Placeholder` (`/users/kyc`): Non-functional placeholder marked with prominent `"Coming soon"` banner.

### 8.7 Supplier Business Profile vs. KYB Verification & Document Uploads
- **Strict Separation of User Account vs. Business Profile**:
  - Personal account settings (`fullName`, `preferredCurrency`) live in `ProfileModal`.
  - Corporate entity management lives on `/kyb` (and `/business-profile`) split into two distinct cards:
    1. **Operational Business Details (Always Editable)**: `contactPhone`, `businessEmail`, `businessAddress`, `website`, `primaryCategory`, and `description`. Editable even after KYB is `APPROVED`.
    2. **Statutory KYB Credentials & Supporting Documents (Editable While Unverified)**: `businessName`, `countryCode`, `registrationNumber`, `taxId`, and private R2 document uploads (`CERTIFICATE_OF_INCORPORATION`, `TAX_CLEARANCE_CERTIFICATE`, `DIRECTOR_ID`, `PROOF_OF_ADDRESS`, `OTHER`). Locked with a verified badge once `kybStatus === APPROVED`.
- **Extended Verification Duration Warning (`VerificationWarningBanner`)**:
  - Displayed whenever a supplier edits KYB details or uploads/replaces KYB documents while unverified (`PENDING` / `REJECTED`), informing them that updating an active submission resets their review timestamp and may extend verification duration.

---

## 9. Shared UI Component Library Inventory (`packages/ui`)

Every component below lives in `packages/ui`, accepts data exclusively via props, and fetches zero data directly `[RULES §16, §19; Conflict 9 resolved]`:

| Component Name | Primary States Handled | Description & Role |
| :--- | :--- | :--- |
| **`Button`** | default, hover, active, disabled, loading (spinner), variant (primary, secondary, destructive, outline, ghost) | Standard 44px hit-target button with Phosphor duotone icon slot |
| **`Input`** / **`Textarea`** | default, focus-visible, error (with error-message), disabled, read-only | Form inputs with 8px radius and tabular numeric support |
| **`Select`** / **`Dropdown`** | closed, open, selected, disabled | Accessible custom select menu with duotone checkmark |
| **`Badge`** / **`StatusPill`** | default, primary, success, warning, destructive, outline | Pill-shaped (`9999px`) status label pairing color with duotone icon |
| **`Card`** | default, hover-elevated, selected, interactive | Standard 12px radius container with 1px border and subtle shadow |
| **`Modal`** / **`Dialog`** | closed, entering, open, exiting | 16px radius backdrop overlay for confirmations and decision workflows |
| **`Drawer`** / **`Sheet`** | closed, open (slide-over) | Slide-over panel for mobile nav and admin review details |
| **`OrderTracker`** | 8 milestone states + cancelled state | Responsive horizontal stepper with step numbers, icons, and timestamps |
| **`PriceDisplay`** | single-currency, dual-currency (indicative) | Standardized two-line display with currency code and minor-unit formatting |
| **`MetricCard`** | standard, loading skeleton | Stat card displaying multi-currency totals, active listings, or order volume |
| **`DataTable`** | loading, empty, data, error | Responsive table with tabular figure columns, status badges, and row actions |
| **`EmptyState`** | empty | Domain-specific empty state with duotone illustration, title, and action CTA |
| **`ThemeToggle`** | light, dark, system | Icon toggle switching root theme class and managing client cookie |
| **`CurrencySelector`** | active currency selected | Header dropdown allowing buyer to switch indicative viewing currency |
| **`ViewModeToggle`** | grid, list | Two-state icon toggle switching marketplace presentation layout |
| **`BrandLogo`** / **`BrandMark`**| light, dark | Shared vector component rendering authoritative brand assets from `packages/ui/assets/` |
| **`VerificationWarningBanner`** | default (amber warning) | Informational alert warning unverified suppliers that editing KYB details/docs resets review queue timestamp and may extend verification duration |
| **`BusinessProfileDrawer`** | closed, open, loading | Slide-over `Sheet` displaying a supplier's attached `BusinessProfile`, statutory KYB credentials, uploaded documents (with signed URL preview triggers), and admin decision actions |
