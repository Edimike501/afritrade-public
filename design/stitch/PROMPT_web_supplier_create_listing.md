# Screen 16: Supplier Create Listing (`apps/web` `/supplier/products/new`)

## Purpose & Context
Allows an approved supplier to create a new wholesale commodity or goods listing on AfriTrade Connect. The supplier configures pricing in their native local currency (or USD), sets Minimum Order Quantity (MOQ), available stock, harvest/production season, warehouse fulfillment location, and uploads lot photos.

## Roles & Access Control
- Supplier (`SUPPLIER`), status must be verified (`APPROVED` KYB).
- If supplier KYB is pending or unverified, product creation is gated with a clear notice linking to `/supplier/kyb`.
- Responsive layout: laptop-primary form flow, seamlessly adapting to mobile (single column touch form).

## Data & Actions
- **Gating Check**: Badge showing "KYB Verified: Approved Supplier".
- **Product Title**: e.g., "Premium Grade A Dried Ginger (Split)".
- **Category Selection**: Agriculture & Produce, Spices & Seasonings, Grains & Cereals, Solid Minerals, Processed Food.
- **Origin Country**: Locked/Default to Supplier's country (e.g., Nigeria `NG`, Ghana `GH`, South Africa `ZA`).
- **Pricing**:
  - Currency: Dropdown / selector of supported currencies (`NGN`, `ZAR`, `GHS`, `USD`).
  - Unit Price: Minor-unit / whole unit input (e.g. `₦ 1,850,000` or `1850000`).
  - Unit of Measurement: `Metric Ton (MT)`, `50kg Bag`, `Kilogram (KG)`, `Crate`.
- **Order Limits & Inventory**:
  - Minimum Order Quantity (MOQ): e.g. `5 MT`.
  - Available Stock Quantity: e.g. `120 MT`.
- **Fulfillment & Harvest Specifications**:
  - Warehouse Dispatch Location: City & Country (e.g. `Kano Warehouse Hub, Nigeria`).
  - Harvest / Batch Season: e.g. `2024 Late Harvest`.
  - Shelf Life / Storage condition: Dry warehouse storage.
- **Product Photos**:
  - Upload dropzone with photo preview slots (primary lot image + up to 4 detail shots).
  - Explicit image fallback: `/images/product-placeholder.png`.
- **Actions**:
  - `Publish Listing` (Primary CTA)
  - `Save as Draft` (Secondary CTA)
  - `Cancel` (Back to `/supplier/products`)

## Required States
- Standard form entry state with validation hints.
- Real-time gross order value preview at MOQ (`Unit Price × MOQ`).
- Clear notice: "All payments are processed securely through trade protection. No upfront cash required from unverified buyers."

## Domain & Styling Rules
- Plain everyday English. No banned words: no `arteries`, `corridors`, `parity`, `exporter`. Use `supplier`, `local business`, `wholesale`.
- Brand Tokens:
  - Background: `#FBF9F5` (Warm Alabaster)
  - Surface: `#FFFFFF`
  - Forest Primary: `#1E3A2B`
  - Clay Accent: `#C85A32`
  - Border: `#E5DFD7`
  - Muted: `#6B7280`
- Mobile responsive: 100% responsive down to 320px, minimum 44px tap targets for buttons, inputs, and toggles.
