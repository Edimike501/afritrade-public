# AfriTrade Connect — Master Brand Asset Inventory

> **Authority & Source Citations**: Codebase search across `apps/web/public`, `apps/admin/public`, `packages/ui`, `packages/shared`, `docs/`, `design/stitch/ANSWERS.md` (Q6, Q10, Q20).  
> **Status**: Comprehensive Asset Inventory. Copy nothing; report only.

---

## 1. Executive Asset Summary

A complete recursive scan of the repository was conducted for vector graphics (`.svg`), raster images (`.png`, `.jpg`, `.ico`, `.webp`), and web fonts (`.woff`, `.woff2`, `.ttf`).

- **Findings in `apps/web/public`**: All **7 core expected brand assets** are present in `apps/web/public/`.
- **Findings in `apps/admin/public`**: The `apps/admin/public` directory **does not exist**. Zero brand assets or favicons are provisioned for the admin app.
- **Local Font Files**: Zero local font binary files are committed. Fonts rely on Google Fonts CDN / Next.js font optimization.
- **Product Photography**: Zero local product photos exist in the repository; the catalog relies on the neutral placeholder and remote seed URLs.

---

## 2. Inventory of Located Brand Assets

| Asset Name | Repository Path | Format & Viewport / Dimensions | File Size | Brand Colors Extracted | Current References in Codebase |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Brand Logo** | `apps/web/public/logo.svg` | Vector SVG (`viewBox="0 0 340 72"`) | 4.3 KB | `#064e3b`, `#047857`, `#10b981`, `#fbbf24`, `#f59e0b`, `#d97706`, `#64748b` | Referenced in `apps/web/src/components/seo/JsonLd.tsx` (Schema.org `Organization` metadata) and `week-1-implementation-plan.md`. |
| **Brand Crest / Logo Mark** | `apps/web/public/logo-mark.svg` | Vector SVG (`viewBox="0 0 512 512"`) | 5.5 KB | `#064e3b`, `#047857`, `#059669`, `#10b981`, `#34d399`, `#fef08a`, `#fbbf24`, `#f59e0b`, `#d97706` | Embedded emblem featuring hexagonal trade crest, golden agricultural wheat stalk, and sweeping emerald leaf. |
| **Browser Favicon** | `apps/web/public/favicon.ico` | Multi-resolution ICO (Contains 32×32 and 48×48 PNG frames) | 2.5 KB | Dark Emerald `#064e3b` background with gold/emerald emblem | Referenced in `apps/web/src/app/layout.tsx` (`icons.icon`). |
| **Apple Touch Icon** | `apps/web/public/apple-touch-icon.png` | Raster PNG (180×180 px, 8-bit RGB) | 12.8 KB | Matches logo mark on rounded container | Referenced in `apps/web/src/app/layout.tsx` (`icons.apple`) and `apps/web/src/app/manifest.ts`. |
| **PWA Master App Icon** | `apps/web/public/icon.png` | Raster PNG (512×512 px, 8-bit RGB) | 48.2 KB | High-res progressive web app icon | Referenced in `apps/web/src/app/layout.tsx` and `apps/web/src/app/manifest.ts`. |
| **Static OG Social Banner** | `apps/web/public/opengraph-image.png` | Raster PNG (1200×630 px, standard 1.91:1 ratio) | 184 KB | Deep green background `#064e3b` with emerald card and gold badge | Referenced in `apps/web/src/config/site.ts` (`siteConfig.ogImage`). *(Note: dynamic Next.js OG image also exists at `apps/web/src/app/opengraph-image.tsx`)* |
| **Product Placeholder Image** | `apps/web/public/images/product-placeholder.png` | Raster PNG (800×800 px, 1:1 square) | 22.4 KB | Neutral slate-emerald background with duotone commodity sack illustration | Referenced in `apps/web/src/components/ProductImage.tsx` (automatic fallback for missing product URLs). |

---

## 3. Brand Colors Defined in Vector Assets

The vector files `logo.svg` and `logo-mark.svg` define the exact authoritative brand color gradients:

### 3.1 Primary Emerald Gradient (African Growth & Trade)
- `Stop 0%`: `#064e3b` (Deep Forest Green)
- `Stop 60%`: `#047857` (Emerald Base)
- `Stop 100%`: `#022c22` (Deepest Forest Shade)
- Accents: `#059669`, `#10b981` (Vibrant Emerald), `#34d399` (Mint Leaf Vein)

### 3.2 Harvest Gold Gradient (Agriculture & Wealth)
- `Stop 0%`: `#fef08a` (Light Harvest Wheat)
- `Stop 30%`: `#fbbf24` (Amber Gold)
- `Stop 70%`: `#f59e0b` (Deep Amber)
- `Stop 100%`: `#d97706` (Ochre Gold)

---

## 4. Missing Asset Audit Against Expected Set

Per the prompt specification, the expected asset set was evaluated across both applications:

| Expected Asset Name | Status in `apps/web` | Status in `apps/admin` | Missing Severity & Action |
| :--- | :--- | :--- | :--- |
| `favicon.ico` | **Present** (`apps/web/public/favicon.ico`) | **MISSING** (Directory missing) | Need symlink or copy to `apps/admin/public/` |
| `apple-touch-icon.png` | **Present** (`apps/web/public/apple-touch-icon.png`) | **MISSING** (Directory missing) | Need symlink or copy to `apps/admin/public/` |
| `icon.png` | **Present** (`apps/web/public/icon.png`) | **MISSING** (Directory missing) | Need symlink or copy to `apps/admin/public/` |
| `opengraph-image.png` | **Present** (`apps/web/public/opengraph-image.png`) | **MISSING** (Directory missing) | Admin portal is internal; low severity |
| `logo.svg` | **Present** (`apps/web/public/logo.svg`) | **MISSING** (Directory missing) | Need in `apps/admin/public/` for header brand |
| `logo-mark.svg` | **Present** (`apps/web/public/logo-mark.svg`) | **MISSING** (Directory missing) | Need in `apps/admin/public/` for collapsed sidebar |
| `images/product-placeholder.png` | **Present** (`apps/web/public/images/...`) | **MISSING** (Directory missing) | Admin order detail views require this placeholder |

### 4.1 Asset Deficit Summary
- In `apps/web`, **0 assets are missing** from the expected set.
- In `apps/admin`, **all 7 assets are currently missing** because `apps/admin/public/` has not been created or symlinked.

---

## 5. Single-Source-of-Truth Architecture for Monorepo Brand Assets (Owner Decision)

Per owner instruction (*"brand assets must be stored in one place and accessed by both applications"*), static brand assets must not be manually duplicated across `apps/web/public` and `apps/admin/public`.

### 5.1 Architecture: Canonical Package (`packages/ui` / `packages/assets`)
To satisfy this constraint across Next.js and pnpm workspaces without infrastructure overhead or paid services:

1. **Master Canonical Storage**:
   - Store all authoritative brand assets in a single shared directory:  
     `packages/ui/assets/` (or `packages/assets/brand/`).
   - Contents: `logo.svg`, `logo-mark.svg`, `favicon.ico`, `icon.png`, `apple-touch-icon.png`, `opengraph-image.png`, `images/product-placeholder.png`.

2. **Vector Graphics: Shared React Components (`@afritrade/ui`)**:
   - Rather than referencing static file paths via `<img>` tags, export vector assets as first-class React components in `packages/ui/src/components/brand/`:
     - `<BrandLogo className="..." />` (Full wordmark + crest)
     - `<BrandMark className="..." />` (Compact trade crest badge)
   - Both `apps/web` (Header, Landing, Footer) and `apps/admin` (AdminHeader, Sidebar) import these components directly from `@afritrade/ui`.
   - **Advantages**: Single source of truth in code, instant dark/light mode token synchronization via Tailwind/CSS variables, zero HTTP requests, infinite sharpness.

3. **Browser Root Files (`favicon.ico`, `icon.png`, `apple-touch-icon.png`)**:
   - Browsers specifically request `/favicon.ico` and mobile homescreens request `/apple-touch-icon.png` from root static URLs.
   - **Strategy A (Next.js Dynamic Metadata Handlers — Recommended)**:
     Next.js App Router natively supports `app/icon.tsx`, `app/apple-icon.tsx`, and `app/opengraph-image.tsx`. Both `apps/web` and `apps/admin` import the shared mark from `@afritrade/ui`, generating dynamic high-res icons and social banners without maintaining loose static PNGs.
   - **Strategy B (Automated Workspace Build Sync Hook)**:
     In `package.json`, add an automated workspace lifecycle script:
     ```json
     "predev": "pnpm sync-assets",
     "prebuild": "pnpm sync-assets"
     ```
     Where `sync-assets` creates filesystem symlinks (or copies) from `packages/ui/assets/` into `apps/web/public/` and `apps/admin/public/`. This prevents manual file divergence while guaranteeing that static servers and reverse proxies serve root favicons seamlessly.

