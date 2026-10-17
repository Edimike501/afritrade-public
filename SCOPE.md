# Scope — MVP (academic capstone)

Single source of truth for "is this in this phase?". Mirrors `docs/product/01-PRD.md`.

## In scope
- Roles: **Buyer**, **Supplier**, **Admin** — each with registration/login (admin is seeded) and a simple dashboard.
- Manual KYB & Business Profile: supplier submits/edits KYB registration details and uploads KYB verification documents (stored privately in zero-cost Cloudflare R2 S3-compatible storage; served via short-lived signed URLs with access audit logging) while unverified → admin inspects documents and approves/rejects with a reason. Suppliers can also edit operational business profile details (`contactPhone`, `businessEmail`, `businessAddress`, `website`, `description`, `primaryCategory`) at any time. Product creation is gated on `APPROVED` in the API.
- Admin Users & Verification Oversight: unified paginated Admin Users Directory (`All Users`) with live role/corridor filtering, slide-over inspection of each supplier's attached `BusinessProfile` and KYB documents, and ability to edit business KYB status (`APPROVED`, `PENDING`, `REJECTED`) even after verification. Individual Buyer KYC remains a non-functional placeholder.
- Catalog: 100+ seeded products across Nigeria, South Africa, Ghana; public browsing with country/category/search filters.
- Orders: buyer places order → pays (mock by default) → order lifecycle visible to buyer, supplier, admin.
- Logistics: admin-curated partner list (CRUD) + manual shipment status updates. **No integration.**
- Payments behind a provider interface; mock default; Paystack NGN adapter built but disabled.
- Currency-ready: NGN, ZAR, GHS, USD exist as data; only NGN is "live" (others always use the mock path).
- English only. Zero paid infrastructure.
- Strict hybrid auth: short-lived in-memory access tokens + HttpOnly refresh token rotation & reuse detection via zero-cost Redis (local Docker / free tier).

## Out of scope (Phase 1+)
Escrow · real carrier/freight APIs · logistics-provider self-onboarding & login · multi-language ·
real ZAR/GHS/USD processing · third-party automated KYC/KYB verification APIs & individual Buyer KYC · advanced analytics ·
trade-finance, warehousing, enterprise APIs · email/SMS notifications · MongoDB (Redis is restricted strictly to zero-cost auth session & token caching in MVP).


## Success criteria (from the capstone proposal)
Clickable prototype by defense · registration for buyers, suppliers (+ admin; logistics represented as admin data) ·
100+ sample products · shipment-tracking simulation in the order flow · 30 test users · ≥80% positive usability · done in 1 month.
