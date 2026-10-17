# AfriTrade Connect — Technical Constraints & Frontend Styling Architecture

> **Authority & Source Citations**: `design/stitch/ANSWERS.md` (Q4, Q16, Q21, Q35, Q36, Q37, Q38, Q40), `RULES.md` (§16 amended, §18, §19), `scripts/ci/policy-checks.sh`.  
> **Status**: Technical Specification Pack for Stitch Output & Implementation Handoff.

---

## 1. Current Styling Approach vs. Decided Architectural Migration

### 1.1 The Legacy Baseline
In the initial scaffold, styling is handled via raw CSS custom properties defined independently in:
- `apps/web/src/app/globals.css` (lines 5–30)
- `apps/admin/src/app/globals.css` (lines 4–29)

Both files use plain CSS classes (`.container`, `.card`, `.btn`, `.row`, `.stack`, `.grid`, `.alert`, `.badge`) without a utility framework or design system build step. Neither file implements dark mode or responsive token maps.

### 1.2 The Decided Architecture: Tailwind CSS + shadcn/ui (`ANSWERS.md` Q35)
Per **`ANSWERS.md` Q35** and **`RULES.md §16` (amended)**:
- **Framework Choice**: Both `apps/web` and `apps/admin` migrate to **Tailwind CSS + shadcn/ui**.
- **Single Source of Truth**: Design tokens live in **one place** as CSS variables mapped directly into the Tailwind configuration (`tailwind.config.ts`).
- **Shared Component Isolation**: Shared components live in `packages/ui` and **never fetch data directly** (`RULES.md §16`, `§19`).
- **Unified Branding**: A single design system governs both public/buyer/supplier views (`apps/web`) and the internal operations portal (`apps/admin`) (`ANSWERS.md` Q2).

---

## 2. Iconography: Phosphor Duotone as shadcn Icon Library

Per **`ANSWERS.md` Q21 & Q36**:
- **Icon Library**: **Phosphor Icons** (`@phosphor-icons/react`), weight **Duotone** (Free, MIT License).
- **Integration**: Phosphor Duotone replaces the default Lucide library used by stock shadcn/ui.
- **Visual Rationale**:
  - The duotone weight combines a saturated primary stroke with a 15–20% translucent secondary fill, providing depth and an authoritative, industrial feel suited to logistics, customs, and agro-commodities.
  - Consistent icon rendering across order stepper stages, navigation menus, and category badges.

---

## 3. Typography & Glyph Coverage Mandates

Per **`ANSWERS.md` Q16 & Q36**:
- **Font Provider**: **Google Fonts only** (Zero-cost, open-source web fonts).
- **Maximum Families**: Strictly limited to **2 families**:

| Hierarchy | Font Family | Weights Used | Role & Rationale |
| :--- | :--- | :--- | :--- |
| **Headings & Display** | **Bricolage Grotesque** | 700 (Bold), 800 (ExtraBold) | Expressive, bold, architectural proportions. Projects industrial confidence and distinct character without generic SaaS monotony. |
| **Body, Labels & UI** | **Noto Sans** | 400 (Regular), 500 (Medium), 600 (SemiBold) | Workhorse pan-African legibility. Comprehensive Latin-extended unicode coverage. |
| **Numbers, Prices & IDs** | **Noto Sans** (Tabular) | Tabular Figures (`font-variant-numeric: tabular-nums`) | Clean column alignment for monetary minor units, order IDs, and weights. |

### 3.1 Strict African Diacritic Glyph Coverage
Per `ANSWERS.md` Q16, body typography must support regional West and Southern African orthographies without font fallback distortion:
- **Target Diacritics**: `ọ`, `ẹ`, `ṣ` (Yoruba), `ɛ`, `ɔ` (Twi / Akan), plus Hausa implosives and Afrikaans diacritics.
- **Verification**: Stitch and subsequent code implementations must verify glyph rendering in Noto Sans without browser tofu (missing character glyph boxes).

---

## 4. Visual Language & Token Scales

Per **`ANSWERS.md` Section D**:
- **Border Radius Scale**:
  - Small elements / Inputs: `8px` (`--radius-sm`)
  - Cards & Containers: `12px` (`--radius-md`)
  - Modals & Hero Panels: `16px` (`--radius-lg`)
  - Badges & Chips: **Pills only** (`9999px`)
- **Elevation & Shadows**:
  - Subtle, low-elevation shadows (`0 1px 3px rgba(0,0,0,0.08)`) combined with crisp **1px low-contrast borders** (`--border` / `--color-border`). Maximum 2 soft elevation levels.
- **Motion & Micro-interactions**:
  - Duration: `150ms – 250ms`, easing: `ease-out`.
  - Accessibility: Must strictly honor `@media (prefers-reduced-motion: reduce)` by disabling transitions.
- **Data Display**:
  - Keep metrics simple and scannable; avoid complex chart widgets or over-designed visualizers (`ANSWERS.md` Q23).

---

## 5. Accessibility (WCAG 2.2 AA) & Performance Guardrails

Per **`ANSWERS.md` Q37**:
- **Target Standard**: **WCAG 2.2 AA** compliance across light AND dark modes.
- **Touch Target Size**: Minimum **44×44 px** interactive hit areas on all buttons, links, and dropdown items (critical for mobile wholesale buyers).
- **Typography Sizing**: Minimum **16px** (`1rem`) body font size to prevent mobile browser zoom anomalies.
- **Status Not by Color Alone**: Every state or status indicator (e.g. `Delivered`, `Pending`, `Approved`) must pair color with an **explicit text label and duotone icon**.
- **Low-End Android & Slow Network Optimization**:
  - Lightweight imagery (SVG icons, compressed WebP/PNG).
  - Shimmering skeleton loaders for all asynchronous data queries.
  - Zero heavy 3D canvases, large video backgrounds, or client-side chart libraries.

---

## 6. Light & Dark Mode Architecture

Per **`ANSWERS.md` Q4**:
- **Default Behavior**: Follows the user's operating system setting (`prefers-color-scheme`).
- **User Override**: An accessible icon toggle (Sun / Moon) in the header and sidebar allows immediate manual override.

### 6.1 Critical Architectural Issue: Theme Persistence vs. Policy Checks
> [!IMPORTANT]
> **Policy Check Conflict (`scripts/ci/policy-checks.sh` line 23)**:  
> The mechanical enforcement script `policy-checks.sh` scans all application code with:  
> `scan "No localStorage/sessionStorage in app code (RULES §18)" '\b(localStorage|sessionStorage)\b' "${SRC[@]}"`  
> Any naive implementation of theme toggling that executes `localStorage.setItem('theme', ...)` or `localStorage.getItem('theme')` will trigger an immediate **pre-push and CI build failure**.

### 6.2 Adopted Architectural Decision: Cookie-Based Theme Persistence (`Conflict 4 / Policy Decision`)
To satisfy `scripts/ci/policy-checks.sh` (which prohibits `localStorage`/`sessionStorage` in application code per `RULES.md §18`) and eliminate hydration flicker (FOUC):

- **Mechanism**: Theme preference is stored in a lightweight, non-sensitive client cookie:  
  `theme=dark; path=/; max-age=31536000; SameSite=Lax`
- **Hydration Resilience**: Next.js server root `layout.tsx` inspects the `theme` cookie during server rendering to pre-render the matching `<html class="dark">` or `<html class="light">` root tag.
- **Client Toggle**: The accessible `<ThemeToggle />` component dispatches a cookie update and toggles the root `.dark` class dynamically.
- **Zero Policy Violations**: Completely avoids `localStorage`, passing automated CI policy checks with zero exceptions.

---

## 7. Stitch MCP Generation Plan & Variant Allocations

Per **`ANSWERS.md` Q38 & Q40**:
- **Variant Strategy**:
  - **2 Variants** generated for Hero/Core conversion screens:
    1. Screen 01: Landing Page
    2. Screen 02: Onboarding & Registration
    3. Screen 04: Marketplace Catalog
    4. Screen 05: Order Detail, Payment & Order Tracker
  - **1 Variant** generated for all other secondary and administrative screens.
- **Code Output Requirement (`ANSWERS.md` Q40)**:
  - Stitch generation prompts must mandate **clean, semantic HTML/CSS** formatted with standard classes, enabling straightforward manual review and direct porting into `@afritrade/ui` and Next.js components.
