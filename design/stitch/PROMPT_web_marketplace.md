# Stitch Generation Prompt — Screen 05: Marketplace Catalog

- **App & Route**: `apps/web` ➔ `/marketplace`
- **Device Target**: Responsive (`DESKTOP` & `MOBILE`)
- **Variant Target**: 2 Variants (Variant 1: Grid View; Variant 2: List View with interactive toggle)
- **Role**: Public Visitor, Wholesale Commercial Buyer
- **Priority Tier**: Tier 1 (Generation Order #5)

---

## 1. Screen Purpose & Design Direction
A high-converting, accessible wholesale marketplace catalog for AfriTrade Connect. It enables commercial buyers to easily discover, filter, and compare wholesale agricultural and packaged goods across Nigeria, South Africa, and Ghana.

Tone is commercial, efficient, and transparent. Everyday plain English only — zero banned jargon (no "arteries", no "corridors", no "parity", no "exporter" — use "supplier" or "local business").

---

## 2. Core Structure & Content Requirements

### 2.1 Navigation & Global Controls
- Sticky header with logo, navigation links ("Marketplace" active, "How Verification Works", "About"), currency switcher (`USD ($)`), and user actions (Log In / Dashboard).
- Responsive mobile drawer support with hamburger toggle.

### 2.2 Search & Filter Toolbar
- **Search Bar**: Full-width or prominent input: "Search commodities, e.g. Yellow Maize, Cashew Nuts, Sesame..."
- **Quick Country Filter Chips**:
  - `All Countries`
  - `🇳🇬 Nigeria`
  - `🇿🇦 South Africa`
  - `🇬🇭 Ghana`
- **Category Filter Pills**:
  - `All Categories`, `Grains & Seeds`, `Nuts & Produce`, `Oils & Fats`, `Packaged Goods`
- **View Toggle**:
  - Grid View button (icon: `grid_view`) vs List View button (icon: `view_list`)
- **Sort Dropdown**: "Sort by: Newest Listings", "Price: Low to High", "MOQ: Low to High"

### 2.3 Wholesale Product Cards (Per Domain Rules)
Each product listing displays:
1. **Product Photo**: Clean photograph with origin country badge (`NG`, `ZA`, `GH`).
2. **Title**: e.g., "Yellow Maize (Grade A)", "Raw Cashew Nuts", "Soybeans (Bulk)", "Dried Ginger".
3. **Supplier Info & Verification**: "Savannah Agro Ltd" + "Verified Supplier" badge.
4. **Origin Location**: e.g., "Kano, Nigeria" or "Sunyani, Ghana".
5. **Dual-Price Display**:
   - Primary: Native supplier price (e.g. `₦25,000 / bag` or `GH₵ 450 / bag`).
   - Secondary: Converted indicative estimate (e.g. `≈ R 290` or `≈ ₦45,000`).
6. **Stock & MOQ**: e.g., "500 Bags available • Min Order: 50 Bags".
7. **Action CTA**: "View Details & Order" button.

### 2.4 Active States
- **Grid View**: Responsive 3-column desktop / 2-column tablet / 1-column mobile card layout.
- **List View**: Dense horizontal row layout showing specs, photo, and direct purchase button.
- **Empty State**: Friendly alert when no products match filters with a "Reset All Filters" button.

---

## 3. Design Tokens & Styling (Per DESIGN.md)
- **Primary**: Deep Pine Green (`#00513a`)
- **Secondary**: Warm Gold (`#feb62f`)
- **Surface**: Mint White (`#f2fcf5`) and Card White (`#ffffff`)
- **Borders**: Soft Neutral (`#bec9c2`)
- **Typography**: `Bricolage Grotesque` (Headlines) & `Noto Sans` (Body/Prices)
- **Touch Targets**: Minimum 44px on all filter chips, toggles, and card buttons.
