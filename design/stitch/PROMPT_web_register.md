# Stitch Generation Prompt — Screen 03: User Onboarding & Registration

- **App & Route**: `apps/web` ➔ `/register`
- **Device Target**: Mobile-First & Desktop Responsive (`MOBILE` & `DESKTOP`)
- **Variant Target**: 2 Variants (Variant 1: Buyer Active; Variant 2: Supplier Active with KYB Pre-notice)
- **Role**: Prospective Wholesale Buyer / Prospective Supplier
- **Priority Tier**: Tier 1 (Hero Component per `ANSWERS.md` Q34)

---

## 1. Screen Purpose & Design Direction
A clean, welcoming, and confidence-inspiring onboarding screen for AfriTrade Connect. It features an interactive segmented role switcher (`Buyer` vs `Supplier`) that dynamically tailors the context, form helper copy, and post-signup expectations.

Tone is straightforward, accessible, and professional. Plain English only — zero dense jargon (no "arteries", no "corridors", no "parity", no "exporter" — use "supplier" or "local business").

---

## 2. Core Structure & Form Elements

### 2.1 Header / Top Bar
- Minimal brand header: AfriTrade Connect logo mark + title, with a link back to `/` or "Already have an account? Log In" link.

### 2.2 Segmented Role Selector (Hero Component)
A high-contrast 2-option switcher at the top of the form:
- Option A: **Wholesale Buyer** — "Source verified agricultural & commercial lots"
- Option B: **Verified Supplier** — "Sell wholesale goods across Nigeria, South Africa & Ghana"

### 2.3 Registration Form Fields (Per `RegisterSchema`)
1. **Full Name** (`fullName`): Input with placeholder "e.g., Amara Okafor"
2. **Business / Work Email** (`email`): Input with placeholder "e.g., amara@africatrade.com"
3. **Password** (`password`): Secure password field with show/hide toggle and helper: "At least 8 characters"
4. **Operating Country** (`countryCode`): Accessible dropdown with flags/codes:
   - 🇳🇬 Nigeria (NG)
   - 🇿🇦 South Africa (ZA)
   - 🇬🇭 Ghana (GH)
5. **Preferred Viewing Currency** (`preferredCurrency`):
   - Automatically synchronizes with the country (NGN for Nigeria, ZAR for South Africa, GHS for Ghana, or USD).
6. **Terms Agreement Checkbox**: Simple checkbox acknowledging terms and the simulated demo mode.

### 2.4 Dynamic Role Callout Box
- **When Buyer is Selected**:  
  *Light mint badge:* "Instant access: Explore over 100+ verified wholesale products and simulate sample bulk orders risk-free."
- **When Supplier is Selected**:  
  *Warm amber/gold badge:* "Verification Notice: After registration, you will be guided to submit your company registration (CAC, CIPC, or RGD). Our team reviews documents within 24–48 hours before product listings can be published."

### 2.5 Form Actions & Evaluation Aids
- **Primary Submit Button**: "Create Buyer Account" or "Create Supplier Account" (min 48px height, deep pine green `#00513a` or warm gold `#feb62f`, full-width).
- **Demo Fill Pills**: Quick evaluator buttons to auto-populate sample test data:
  - `[Demo: Fill Sample Buyer (NG)]`
  - `[Demo: Fill Sample Supplier (GH)]`
- **Link**: "Already registered? Log In here"

### 2.6 Form Validation States
- Inline error styling for `AUTH_EMAIL_ALREADY_EXISTS` ("This email is already registered. Please log in.")
- Field validation highlighting for passwords under 8 characters.

---

## 3. Design Tokens & Styling
- **Primary**: Deep Pine Green (`#00513a`)
- **Secondary**: Warm Gold (`#feb62f`)
- **Surface**: Mint White (`#f2fcf5`) and Card White (`#ffffff`)
- **Borders**: Soft Neutral (`#bec9c2`)
- **Typography**: `Bricolage Grotesque` (Headings) & `Noto Sans` (Form labels/inputs)
- **Touch Targets**: Minimum 44px–48px on all interactive inputs and buttons.
