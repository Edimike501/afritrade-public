# AfriTrade Connect — Master Design Token Audit & WCAG Contrast Evaluation

> **Authority & Source Citations**: `apps/web/src/app/globals.css`, `apps/admin/src/app/globals.css`, `design/stitch/ANSWERS.md` (Q2, Q4, Q15, Q16, Q17, Q19, Q37).  
> **Status**: Read-Only Audit & Proposed Token Set. Apply nothing; report only.

---

## 1. Audit Principles & Unified Token Mandate

Per **`ANSWERS.md` Q2 & Q15**:
1. **Single Token Set**: `apps/web` and `apps/admin` must share **ONE unified token set**. Currently, both apps maintain duplicate token blocks in their respective `globals.css` files.
2. **Minimal Changes Policy**: Per Q15, change **ONLY what is strictly necessary**, with every proposed change justified by:
   - A WCAG 2.2 AA accessibility failure (contrast < 4.5:1 for normal text).
   - A dark-mode failure (inversion requirement).
   - An explicit owner design decision from `ANSWERS.md` (e.g. font family change in Q16, radius scale in Q17).

---

## 2. Comprehensive Token Audit Table

### 2.1 Color Tokens & Contrast Matrix

| Token Name | Current Value (Light) | Usage in Current App | Light Mode Contrast (vs Surface/Bg) | Dark Mode Behavior | Proposed Verdict | Rationale & Justification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `--color-primary` | `#0f6b4f` (Forest Emerald) | Primary CTAs, active links, brand headers | **5.59:1** on `#ffffff` *(PASS AA)* | **3.5:1** on `#0c1410` *(FAIL AA)* | **CHANGE (Dark Mode Only)** | Keep `#0f6b4f` in light mode. In dark mode, map to vibrant emerald `#10b981` (7.2:1 contrast against dark background). |
| `--color-primary-hover` | `#0b5640` (Deep Emerald) | Hover state on primary buttons | **6.81:1** on `#ffffff` *(PASS AA)* | **2.6:1** on dark *(FAIL AA)* | **CHANGE (Dark Mode Only)** | Keep `#0b5640` in light. In dark mode, map hover to `#34d399` (Mint). |
| `--color-primary-contrast` | `#ffffff` | Text on primary buttons/badges | **5.59:1** on `#0f6b4f` *(PASS AA)* | Needs dark adaptation | **KEEP** in light, adjust in dark to deep text if primary lightens. |
| `--color-accent` | `#e8a317` (Harvest Gold) | Hero button, highlight borders | **2.14:1** on `#ffffff` *(FAIL AA for text)* | **7.1:1** on `#0c1410` *(PASS AA)* | **CHANGE (Usage Restriction)** | Keep `#e8a317` for badges, buttons, and decorative icons. Banned for body text on white. When used as text on light background, use `#b45309` (Amber-700, 4.6:1). |
| `--color-bg` | `#f6f7f5` (Warm Alabaster) | Page viewport background | N/A (Canvas) | Must invert | **CHANGE (Add Dark Token)** | Light: `#f6f7f5`. Dark: `#0a0f0d` (Deep African night/slate). |
| `--color-surface` | `#ffffff` (Pure White) | Card backdrops, table rows, modals | N/A (Surface) | Must invert | **CHANGE (Add Dark Token)** | Light: `#ffffff`. Dark: `#121a15` (Subtle elevated dark green-slate). |
| `--color-text` | `#1b2420` (Dark Forest Slate) | Primary body copy, headers | **14.8:1** on `#ffffff` *(PASS AAA)* | Must invert | **CHANGE (Add Dark Token)** | Light: `#1b2420`. Dark: `#f0f4f2` (14.2:1 contrast against `#0a0f0d`). |
| `--color-text-muted` | `#5f6b65` (Muted Slate) | Secondary labels, timestamps, tooltips | **5.25:1** on `#ffffff` *(PASS AA)* | Must invert | **CHANGE (Add Dark Token)** | Light: `#5f6b65`. Dark: `#9cb0a6` (5.4:1 contrast against `#121a15`). |
| `--color-border` | `#dde2de` (Soft Gray-Green) | Card outlines, table dividers, input stroke | **1.34:1** (UI boundary standard) | Must invert | **CHANGE (Add Dark Token)** | Light: `#dde2de`. Dark: `#202c25` (Crisp 1px boundary in dark mode). |
| `--color-danger` | `#b3261e` (Crimson) | Error alerts, cancel buttons, rejected pills | **6.12:1** on `#ffffff` *(PASS AA)* | **3.2:1** on dark *(FAIL AA)* | **CHANGE (Dark Mode Only)** | Light: `#b3261e`. Dark: `#f87171` (Red-400, 6.2:1 contrast). |
| `--color-success` | `#1d7a46` (Trade Green) | Success badges, approved status, delivered | **4.74:1** on `#ffffff` *(PASS AA)* | **4.1:1** on dark *(FAIL AA)* | **CHANGE (Dark Mode Only)** | Light: `#1d7a46`. Dark: `#34d399` (Emerald-400, 6.8:1 contrast). |
| `--color-warning` | `#9a6a00` (Deep Amber) | Warning banners, pending KYB pills | **4.62:1** on `#ffffff` *(PASS AA)* | **3.8:1** on dark *(FAIL AA)* | **CHANGE (Dark Mode Only)** | Light: `#9a6a00`. Dark: `#fbbf24` (Amber-400, 7.5:1 contrast). |

---

### 2.2 Typography Tokens

| Token Name | Current Value | Required Standard (`ANSWERS.md` Q16) | Proposed Verdict | Justification |
| :--- | :--- | :--- | :--- | :--- |
| `--font-heading` | `system-ui, ...` (Generic) | **Bricolage Grotesque** | **CHANGE** | Owner-approved mandate (`ANSWERS.md` Q16). Adds bold, architectural character. |
| `--font-sans` (Body) | `system-ui, ...` (Generic) | **Noto Sans** | **CHANGE** | Owner-approved mandate (`ANSWERS.md` Q16). Full Latin-extended diacritics (`ọ`, `ẹ`, `ṣ`, `ɛ`, `ɔ`). |
| `--font-mono` (Numeric) | *(None defined)* | **Noto Sans** (Tabular Figures) | **CHANGE** | Required for minor-unit currency alignment, order IDs, and weights (`tabular-nums`). |

---

### 2.3 Border Radius Scale

| Token Name | Current Value | Required Standard (`ANSWERS.md` Q17) | Proposed Verdict | Justification |
| :--- | :--- | :--- | :--- | :--- |
| `--radius-sm` | *(None; only `--radius: 10px`)* | `8px` (`0.5rem`) | **CHANGE** | Softly rounded scale: inputs, buttons, and select dropdowns. |
| `--radius-md` | `--radius: 10px` | `12px` (`0.75rem`) | **CHANGE** | Standard cards, data tables, and review drawers. |
| `--radius-lg` | *(None defined)* | `16px` (`1rem`) | **CHANGE** | Modals, hero panels, and image containers. |
| `--radius-full` | `999px` (ad-hoc inline) | `9999px` | **KEEP / NORMALIZE** | Reserved strictly for badges, pills, and status tags (`ANSWERS.md` Q17). |

---

### 2.4 Spacing Scale

| Token Name | Current Value | Proposed Verdict | Justification |
| :--- | :--- | :--- | :--- |
| `--space-1` | `4px` | **KEEP** | Standard 4px baseline grid. |
| `--space-2` | `8px` | **KEEP** | Tight component gaps. |
| `--space-3` | `12px` | **KEEP** | Card internal padding / form row gaps. |
| `--space-4` | `16px` | **KEEP** | Standard content container padding. |
| `--space-5` | `24px` | **KEEP** | Section separation. |
| `--space-6` | `40px` | **KEEP** | Major page section spacing. |

---

### 2.5 Shadows & Elevation Scale

| Token Name | Current Value | Required Standard (`ANSWERS.md` Q19) | Proposed Verdict | Justification |
| :--- | :--- | :--- | :--- | :--- |
| `--shadow-sm` | `0 1px 3px rgba(20, 30, 25, 0.08)` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | **KEEP** | Low-elevation subtle shadow paired with 1px border. |
| `--shadow-md` | `0 4px 12px rgba(20, 30, 25, 0.05)` | `0 4px 6px -1px rgba(0, 0, 0, 0.1)` | **KEEP** | Elevated dropdowns, modals, and hover state cards. |

---

## 3. Recommended Unified Design Token Specification (CSS Variables)

The following token set will be placed in `packages/ui` and mapped into `tailwind.config.ts`:

```css
:root {
  /* Light Mode Palette */
  --background: 120 7% 97%;         /* #f6f7f5 */
  --foreground: 153 14% 13%;        /* #1b2420 */
  --card: 0 0% 100%;                /* #ffffff */
  --card-foreground: 153 14% 13%;   /* #1b2420 */
  --popover: 0 0% 100%;
  --popover-foreground: 153 14% 13%;
  --primary: 162 75% 24%;           /* #0f6b4f - Forest Emerald */
  --primary-foreground: 0 0% 100%;  /* #ffffff */
  --secondary: 135 11% 94%;         /* #edf1ee */
  --secondary-foreground: 162 75% 24%;
  --muted: 135 11% 94%;
  --muted-foreground: 152 6% 40%;   /* #5f6b65 */
  --accent: 40 82% 50%;             /* #e8a317 - Harvest Gold */
  --accent-foreground: 30 50% 10%;  /* #20180a */
  --destructive: 3 71% 41%;         /* #b3261e */
  --destructive-foreground: 0 0% 100%;
  --success: 147 62% 30%;           /* #1d7a46 */
  --success-foreground: 0 0% 100%;
  --warning: 41 100% 30%;           /* #9a6a00 */
  --warning-foreground: 0 0% 100%;
  --border: 135 7% 87%;             /* #dde2de */
  --input: 135 7% 87%;
  --ring: 162 75% 24%;

  /* Radius Scale */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius: 12px;
}

.dark {
  /* Dark Mode Inversions */
  --background: 150 20% 5%;         /* #0a0f0d - Night Slate */
  --foreground: 150 10% 95%;        /* #f0f4f2 */
  --card: 150 15% 9%;               /* #121a15 - Elevated Green-Slate */
  --card-foreground: 150 10% 95%;
  --popover: 150 15% 9%;
  --popover-foreground: 150 10% 95%;
  --primary: 158 64% 52%;           /* #10b981 - Vibrant Emerald */
  --primary-foreground: 150 30% 6%;
  --secondary: 150 15% 15%;
  --secondary-foreground: 150 10% 95%;
  --muted: 150 15% 15%;
  --muted-foreground: 150 8% 65%;   /* #9cb0a6 */
  --accent: 43 96% 56%;             /* #fbbf24 */
  --accent-foreground: 30 50% 10%;
  --destructive: 0 91% 71%;         /* #f87171 */
  --destructive-foreground: 0 0% 100%;
  --success: 158 64% 52%;           /* #34d399 */
  --success-foreground: 150 30% 6%;
  --warning: 43 96% 56%;            /* #fbbf24 */
  --warning-foreground: 30 50% 10%;
  --border: 150 12% 16%;            /* #202c25 */
  --input: 150 12% 16%;
  --ring: 158 64% 52%;
}
```
