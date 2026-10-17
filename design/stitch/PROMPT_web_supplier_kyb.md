# Screen 19: Supplier KYB Submission (`apps/web` `/supplier/kyb`)

## Purpose & Context
Allows an authenticated supplier to submit business statutory details for manual administrator verification. 
Per SCOPE.md and RULES.md, verification is manual admin approval. No third-party API or document uploads are processed in MVP. The screen gathers company statutory registration number, tax identification number, warehouse dispatch address, contact representative details, and presents the current verification status (`PENDING`, `APPROVED`, or `REJECTED` with review notes).

## Roles & Access Control
- Supplier (`SUPPLIER`).
- Responsive layout: Dedicated left Sidenav layout (Dashboard, Products, Incoming Orders, KYB Verification [active], Settings).
- NO duplicate top horizontal navigation bar.

## Data & Actions
- **Current KYB Status Card**:
  - Badge: `UNDER_REVIEW` (Orange) or `APPROVED` (Green) or `REJECTED` (Red).
  - Review note: "Our compliance team reviews submissions within 24 to 48 business hours. You will receive listing permissions once verified."
- **Statutory Details Form**:
  - Country of Registration: Nigeria 🇳🇬 / South Africa 🇿🇦 / Ghana 🇬🇭.
  - Registered Business Name: e.g. `Savannah Agro Ltd`.
  - Statutory Company Registration Number (CAC / CIPC / RGD): e.g. `RC-1849204`.
  - Tax Identification Number (TIN / SARS): e.g. `TIN-92847102-001`.
  - Primary Commodity Sector: e.g. `Agricultural Produce & Spices`.
  - Registered Warehouse Address: e.g. `Plot 14 Bompai Industrial Area, Kano State, Nigeria`.
  - Contact Person: `Babatunde Adeleke (Operations Director)`.
  - Phone Number & Business Email.
- **Verification Guarantee & Trust Notice**:
  - "Manual Compliance Check: AfriTrade Connect verifies business authenticity to ensure marketplace integrity under AfCFTA guidelines. Identification numbers are kept private and never exposed to buyers."
- **Actions**:
  - `Submit Business Details for Review` (Primary CTA, 44px height)
  - `Save Draft` (Secondary CTA)

## Domain & Styling Rules
- Plain everyday English. No banned words: no `arteries`, `corridors`, `parity`, `exporter`. Use `supplier`, `local business`, `wholesale`.
- Brand Tokens: Warm Alabaster (`#FBF9F5`), Forest Green (`#1E3A2B`), Clay Accent (`#C85A32`), White cards (`#FFFFFF`), Border (`#E5DFD7`).
- 100% mobile responsive down to 320px with minimum 44px tap targets.
