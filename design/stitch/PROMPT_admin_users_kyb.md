# Stitch Generation Prompt — Screen 09: Admin Users > KYB Review Queue & Decision

- **App & Route**: `apps/admin` ➔ `/users/kyb`
- **Device Target**: `DESKTOP` (Laptop-primary operations)
- **Variant Target**: 1 Variant
- **Role**: Platform Compliance Administrator
- **Priority Tier**: Tier 1 (Generation Order #9)
- **Scope Status**: DESIGN-ONLY (Per Standing Rule 23 Scope Guard)

---

## 1. Screen Purpose & Design Direction
An operational verification review queue where administrators inspect supplier business registration details, examine private statutory document previews, and issue an explicit Approve or Reject decision with a mandatory audit reason (per RULES.md §3, §4).

Tone is rigorous, confidential, compliance-driven, and institutional. Everyday plain English only — zero banned jargon (no "arteries", no "corridors", no "parity", no "exporter"). No escrow claims.

---

## 2. Layout & Key Elements

### 2.1 Admin Shell Layout
- **Sidebar Navigation** (`apps/admin` portal):
  - Brand: "AfriTrade Ops"
  - Operations: Overview, Orders Oversight, Logistics Partners.
  - **Users Group** (DESIGN-ONLY):
    - Buyers (`/users/buyers`)
    - Suppliers (`/users/suppliers`)
    - **KYB Review** (Active link with amber badge "4 Pending")
    - KYC Verification (`/users/kyc`, "Coming Soon" badge)
  - Bottom Profile: "Favour Okafor (Super Admin)".
- **Top Header Bar**:
  - Breadcrumb: "Users > KYB Verification Review"
  - Safeguard Badges: `[DESIGN-ONLY Screen — Rule 23]` and `[Confidential Audit Log Active — RULES §3]`
  - Quick Search and Filter triggers.

### 2.2 Split-Screen / Master-Detail Layout
The screen uses an efficient two-column operational inspection layout:
- **Left Column (Pending Queue Table, ~40% width)**:
  - List of suppliers awaiting verification review:
    1. `Sunyani Harvest Co` (Ghana 🇬🇭 • Submitted 3 hours ago • Urgent)
    2. `Kaduna Spice Hub Ltd` (Nigeria 🇳🇬 • Submitted 6 hours ago)
    3. `Veld Valley Organics` (South Africa 🇿🇦 • Submitted 1 day ago)
    4. `Accra Grain Exchange Ltd` (Ghana 🇬🇭 • Submitted 1 day ago)
  - Filter by Country (`All`, `NG`, `ZA`, `GH`).
- **Right Column (Active Verification Dossier & Decision Panel, ~60% width)**:
  - Header: "Business Verification Dossier: Sunyani Harvest Co" (Ghana 🇬🇭).
  - Statutory Identity Details:
    * Legal Entity Name: `Sunyani Harvest Co-Operative Ltd`
    * Company Registration / Tax ID: `GH-REG-2024-88192` (Masked per Rules §3)
    * Principal Office Address: `Plot 18 Sunyani Agribusiness Hub, Bono Region, Ghana`
    * Authorized Representative: `Kwame Boateng (Managing Director)`
    * Contact: `kwame@sunyaniharvest.gh` • `+233 20 488 9201`
  - Statutory Document Inspection (Private Signed URLs):
    * Document 1: `Ghana Registrar General Certificate of Incorporation` (PDF preview card with "View Secure Document" and access logging stamp: `Access logged to verification_access_logs`).
    * Document 2: `GRA Tax Clearance Certificate (2026)` (PDF preview card).
    * Document 3: `Bank Reference Letter / Proof of Commercial Facility` (PDF preview card).
  - Decision & Audit Action Card:
    * Rejection Reason Selector (Dropdown): "Select reason if rejecting..." (Options: `Incomplete documentation`, `Unverifiable business registration number`, `Mismatched company name or director details`, `Invalid tax clearance`).
    * Administrator Notes Field (Optional review comments).
    * Dual Action Buttons:
      - **Approve Business Verification** button: Deep pine green (`#00513a`), high contrast, active click trigger.
      - **Reject Verification** button: Warning red outline (`#ba1a1a`).
    * Audit Stamp: "Every admin action is permanently recorded in `admin_audit_logs` with admin ID, action, and reason."

---

## 3. Design Tokens & Styling (Per DESIGN.md)
- **Primary**: Deep Pine Green (`#00513a`)
- **Secondary / Accent**: Warm Gold (`#feb62f`)
- **Alert / Rejection**: Dark Red (`#ba1a1a`)
- **Canvas / Surface**: Light Alabaster (`#f2fcf5`) and Card White (`#ffffff`)
- **Typography**: `Bricolage Grotesque` (Headings) & `Noto Sans` (Dossier forms and document metadata)
