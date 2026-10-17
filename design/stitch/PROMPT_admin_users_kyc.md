# Stitch Generation Prompt — Screen 10: Admin Users > KYC Placeholder

- **App & Route**: `apps/admin` ➔ `/users/kyc`
- **Device Target**: `DESKTOP` (Laptop-primary admin operations)
- **Variant Target**: 1 Variant
- **Role**: Platform Administrator
- **Priority Tier**: Tier 1 (Generation Order #10)
- **Scope Status**: DESIGN-ONLY / Non-Functional Placeholder (Per Standing Rule 23 Scope Guard)

---

## 1. Screen Purpose & Design Direction
A non-functional, informative placeholder screen inside the Admin Ops portal (`apps/admin`) clearly communicating that Individual KYC (Know Your Customer) identity verification is reserved for a future release (Phase 2), while current MVP verification operates strictly at the business level via manual KYB review (`/users/kyb`).

Tone is transparent, calm, structured, and informative. Clean plain English only — zero banned jargon (no "arteries", no "corridors", no "parity", no "exporter"). No escrow claims.

---

## 2. Layout & Key Elements

### 2.1 Admin Shell Layout
- **Sidebar Navigation** (`apps/admin` portal):
  - Brand: "AfriTrade Ops"
  - Operations: Overview, Orders Oversight, Logistics Partners.
  - **Users Group** (DESIGN-ONLY):
    - Buyers (`/users/buyers`)
    - Suppliers (`/users/suppliers`)
    - KYB Review (`/users/kyb`)
    - **KYC Verification** (Active menu item with gold "Coming soon" pill)
  - Bottom Profile: "Favour Okafor (Super Admin)".
- **Top Header Bar**:
  - Breadcrumb: "Users > Individual Identity (KYC Placeholder)"
  - Status Badges: `[DESIGN-ONLY Screen — Rule 23]` and `Demo Simulation Mode (Zero Risk)`

### 2.2 Centered Placeholder & Architectural Guard Card
A clean, elegant, centered status container:
1. **Status Icon**: Shield with clock or info outline (`verified_user` / `schedule`) in soft pine green and warm gold.
2. **Headline**: "Individual KYC Verification (Coming Soon)"
3. **Subheadline**: "Individual identity verification workflows are scheduled for Phase 2 expansion."
4. **Scope Guard & Architectural Context (Per Standing Rule 23)**:
   - A structured 3-part card explaining current vs future capability:
     * **Current MVP Scope**: "All cross-border merchant verification in the MVP is manual business entity approval (KYB) conducted through the [KYB Review Queue](/users/kyb). No personal biometric or individual ID collection is required."
     * **Zero Third-Party Cost Constraint**: "To maintain the strict zero-cost infrastructure architecture, third-party ID verification APIs (e.g. Smile Identity, Persona) are intentionally deferred."
     * **Planned Phase 2 Expansion**: "Future integration will introduce automated director National ID (NIN, South African ID, Ghana Card) verification upon production go-live."
5. **Direct Navigation CTA**:
   - Primary button: "Go to Active KYB Review Queue" (deep pine green `#00513a`, links to `/users/kyb`).
   - Secondary button: "Return to Admin Overview" (outline button, links to `/`).
6. **Immutable Audit Notice**: "🔒 Non-functional placeholder. No KYC data, uploads, or endpoints are active in this environment."

---

## 3. Design Tokens & Styling (Per DESIGN.md)
- **Primary**: Deep Pine Green (`#00513a`)
- **Secondary / Accent**: Warm Gold (`#feb62f`)
- **Canvas / Surface**: Light Alabaster (`#f2fcf5`) and Card White (`#ffffff`)
- **Borders**: Soft Neutral (`#bec9c2`)
- **Typography**: `Bricolage Grotesque` (Headings) & `Noto Sans` (Body)
