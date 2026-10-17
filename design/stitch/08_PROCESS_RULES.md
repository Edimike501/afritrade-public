# AfriTrade Connect — Standing Process Rules & Governance

> **Authority & Source Citations**: `.agents/rules/RULES.md` (§16 amended, §21, §22, §23), `AGENTS.md`, `design/stitch/ANSWERS.md` (Q1, Q5, Q28, Q35).  
> **Status**: Standing Governance Specifications. List only; no unauthorized edits applied.

---

## 1. Canonical Process Rules (Exact Verbatim Text)

The following four standing rules govern all UI/UX design generation, frontend development, and administrative scope in AfriTrade Connect:

### 1.1 Rule 21: Design-First (Stitch) — Standing Rule
```
Any new screen or significant UI change is designed in Stitch and approved BEFORE any implementation code. Source of truth: design/stitch/DESIGN.md.
No ad-hoc visual decisions in code. A new component must exist in DESIGN.md first.
```
- **Operational Enforcement**:
  - Developers and AI coding assistants are prohibited from writing `.tsx` component markup or adjusting styling parameters without an approved visual reference in `design/stitch/DESIGN.md`.
  - Handoff flow: `User Prompt` ➔ `Stitch MCP Generation` ➔ `Owner Review & Approval` ➔ `Code Implementation`.

### 1.2 Rule 22: Order Tracker Evolution
```
Horizontal stepper now. At the first major launch it becomes map-like.
Tracker work must keep the status data model (shared ORDER_STATUS_TRANSITIONS) unchanged so the visual can swap without touching logic.
```
- **Operational Enforcement**:
  - The MVP implements a clean, 8-stage **Horizontal Stepper** with explicit handling for the `CANCELLED` status.
  - The backend status transition graph (`ORDER_STATUS_TRANSITIONS`) and database models (`OrderStatus`) are locked and decoupled from the UI representation.
  - When the map-like geographic corridor tracker is implemented in Phase 1, the frontend visual component swaps cleanly without requiring backend modifications.

### 1.3 Rule 16 (Amended): Styling Stack Migration
```
Tailwind + shadcn/ui. Design tokens remain in ONE place as CSS variables mapped into the Tailwind theme.
Shared components live in packages/ui and never fetch data (3-tier rule, section 19).
Update ARCHITECTURE.md rule 7 and docs/INFRA.md in the same PR (section 17).
```
- **Operational Enforcement**:
  - All bespoke raw CSS classes across `apps/web` and `apps/admin` are retired in favor of Tailwind CSS utility classes and shadcn/ui primitives.
  - Design tokens (colors, radii, shadows, spacing) reside strictly as CSS custom properties in `globals.css` and map into `tailwind.config.ts`.
  - Components in `packages/ui` must be pure presentation components accepting props and callbacks only.

### 1.4 Rule 23: Scope Guard for New Admin Screens
```
Admin "Users" group (Buyers, Suppliers, KYB, KYC placeholder) is DESIGN-ONLY until SCOPE.md is updated. KYC is a non-functional placeholder; no KYC logic, upload, or API.
```
- **Operational Enforcement**:
  - Screens generated for Admin Users (Buyers Directory, Suppliers Directory, KYB Review, KYC Placeholder) are strictly **`DESIGN-ONLY`**.
  - No backend routes, controllers, Prisma migrations, or public API endpoints may be created for these screens until a formal scope-change review amends `SCOPE.md`.
  - The KYC screen must render strictly as an informative "Coming soon" placeholder with zero interactive upload or verification scaffolding.

---

## 2. Monorepo File Update Checklist (Pending Adoption)

When the design pack is approved and implementation commences, the following repository files must be updated concurrently in the implementation PR (`RULES.md §17`):

| File Path | Required Modification Upon Adoption |
| :--- | :--- |
| **`.agents/rules/RULES.md`** | Incorporate amended §16, §21 (Design-First), §22 (Order Tracker), and §23 (Admin Users Scope Guard). |
| **`AGENTS.md`** | Mirror rules §16, §21, §22, and §23 in the assistant instruction set. |
| **`ARCHITECTURE.md`** | Update Rule 7 (replace raw CSS variables reference with Tailwind + shadcn/ui mapped architecture) and update Component/UI layer description. |
| **`docs/INFRA.md`** | Document the zero-cost styling toolchain dependencies (Tailwind CLI, PostCSS, Radix primitives, Phosphor Icons). |
| **`scripts/ci/policy-checks.sh`** | Update mechanical scanning heuristics if theme persistence adoption requires an authorized policy-allow exception. |
| **`apps/web/package.json` & `apps/admin/package.json`** | Add `tailwindcss`, `postcss`, `autoprefixer`, and `@phosphor-icons/react` dependencies. |
| **`packages/ui/package.json`** | Add Tailwind and Radix UI primitives dependencies. |
| **`eslint.config.mjs` / Jest configs** | Ensure Tailwind class sorting or styling linters are wired without conflicts. |
| **`SCOPE.md`** | Update when the platform owner formally approves promoting Admin Users screens from `DESIGN-ONLY` to active implementation. |
