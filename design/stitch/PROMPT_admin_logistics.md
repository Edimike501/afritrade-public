# Screen 22: Admin Logistics Management (`apps/admin` `/logistics`)

## Purpose & Context
Allows platform administrators to curate, configure, activate, and deactivate verified logistics partners (freight handlers, freight forwarders, clearing agents, and haulage companies across Nigeria, South Africa, and Ghana).
Per RULES.md and SCOPE.md, logistics in MVP is manual/curated by administrators (no external carrier APIs). This screen provides the operational registry to manage partners and assign them to orders.

## Roles & Access Control
- Administrator (`ADMIN`), protected by `RequireAdmin`.
- Dedicated Left Sidenav Layout (Overview, Orders, Logistics Partners [active], Users group).
- NO duplicate top horizontal navigation bar. Minimal top bar with search and "+ Add Logistics Partner" action.

## Data & Actions
- **Header**: Logistics Partner Network (Manual Curated Registry).
- **Curated Partner Roster (Seed / Active Partners)**:
  - Partner Name: e.g. `Kobo360 Haulage`, `DHL Global Forwarding West Africa`, `Imperial Logistics SA`, `Bolloré Africa Logistics Ghana`.
  - Country of Operation: Nigeria 🇳🇬, South Africa 🇿🇦, Ghana 🇬🇭, or Multi-Country Cross-Border.
  - Fulfillment Mode: Road Haulage / Cross-Border Trucking, Sea Freight, Air Cargo.
  - Active Shipments Assigned: e.g. `14 Active Orders`.
  - Operational Status: `ACTIVE` (Green) or `INACTIVE` (Gray).
  - Quick Toggle: Activate / Deactivate Partner.
- **Actions**:
  - `Add Logistics Partner` (Modal form: Name, Country, Fleet/Transport Type, Dispatch Contact, Operating Status).
  - `Edit Partner Details`.
  - `Deactivate Partner`.

## Domain & Styling Rules
- Plain everyday English. No banned words: no `arteries`, `corridors`, `parity`, `exporter`.
- Brand Tokens: Warm Alabaster (`#FBF9F5`), Forest Green (`#1E3A2B`), Clay Accent (`#C85A32`), White cards (`#FFFFFF`), Border (`#E5DFD7`).
- 100% mobile responsive down to 320px with minimum 44px tap targets.
