# Screen 17: Supplier Edit Listing (`apps/web` `/supplier/products/[id]/edit`)

## Purpose & Context
Allows an approved supplier to update an existing wholesale commodity listing (e.g., price updates, quantity adjustments, active/inactive status toggle, updating harvest batch notes, adding new warehouse batch photos).

## Roles & Access Control
- Supplier (`SUPPLIER`), status `APPROVED` KYB. Must own the product listing.
- Responsive design: laptop-primary with clean mobile-responsive form reflow.

## Data & Actions
- **Header**: Listing identifier (e.g. `PRD-NG-0419: Premium Grade A Dried Ginger (Split)`), Status Badge (`ACTIVE` - Green), Origin Badge (`Nigeria`).
- **Quick Status Toggle**: Switch between `Active (Visible on Marketplace)` and `Inactive (Hidden from Marketplace)`.
- **Existing Fields Pre-populated**:
  - Listing Title: `Premium Grade A Dried Ginger (Split) - 2024 Late Harvest`
  - Category: `Agriculture & Produce > Spices`
  - Currency: `NGN (Nigerian Naira)`
  - Unit Price: `₦ 1,850,000 per MT`
  - Minimum Order Quantity (MOQ): `5 MT`
  - Total Available Stock: `120 MT` (with quick update note: "Stock updated 3 days ago")
  - Dispatch Hub: `Kano Central Commodity Terminal, Nigeria`
  - Photos: 3 active uploaded images with delete and reorder buttons + add more photos slot (`/images/product-placeholder.png` fallback).
- **Actions**:
  - `Save Changes` (Primary CTA)
  - `Deactivate Listing` (Secondary outline CTA)
  - `Delete Listing` (Destructive text link with confirmation dialog)
  - `Cancel` (Link back to `/supplier/products`)

## Domain & Styling Rules
- Plain everyday English. No banned words: no `arteries`, `corridors`, `parity`, `exporter`. Use `supplier`, `local business`, `wholesale`.
- Brand Tokens: Warm Alabaster (`#FBF9F5`), Forest Green (`#1E3A2B`), Clay Accent (`#C85A32`), White cards (`#FFFFFF`), Border (`#E5DFD7`).
- 100% mobile responsive down to 320px with minimum 44px tap targets.
