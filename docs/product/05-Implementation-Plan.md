# AfriTrade Connect — Implementation Plan

**Companion to:** 01-PRD.md, 02-TRD.md, 03-App-Flow.md, 04-Backend-Schemas.md
**Timeline:** 1 month, solo developer
**Discipline:** Every week ends with something demoable — never a week of invisible plumbing with nothing to show.

---

## Week 1 — Foundation & Auth

**Goal:** Project skeleton running end-to-end with real authentication, deployed to free-tier hosting.

- Scaffold NestJS backend (modules: `auth`, `users`, `countries`, `currencies` as a starting structure)
- Scaffold Next.js frontend with base layout, routing, and design-token setup (per TRD's editability requirement — colors/spacing as variables from day one, not retrofitted later)
- Set up PostgreSQL via Neon/Supabase free tier; connect Prisma; run first migration
- Seed `Country` and `Currency` reference tables
- Build registration/login for Buyer and Supplier roles (role selection at signup), JWT auth, role guards
- Seed one Admin account directly in the database (no self-registration)
- Deploy backend (Render/Railway free tier) and frontend (Vercel free tier) — even bare-bones, get the pipeline working now, not in week 4

**Definition of done:** A user can register as Buyer or Supplier, log in, and see a role-appropriate empty dashboard shell, live on a public URL.

## Week 2 — Supplier Onboarding, Catalog, Logistics Data

**Goal:** Suppliers can get approved and list products; the logistics data layer exists.

- Build `BusinessProfile` + KYB flow: supplier submits business details → `PENDING` status
- Build Admin KYB queue: approve/reject with reason
- Enforce KYB-gated product creation at the service layer
- Build `Product` CRUD for approved suppliers (create/edit/deactivate)
- Build public + buyer-facing catalog browsing (filter by country/category)
- Seed `LogisticsPartner` table with the real curated partner names
- Write and run the product seed script (target 100+ products across 8–12 seeded supplier businesses)

**Definition of done:** A new supplier can register, get manually approved by admin, and list a product that appears in the public catalog; the catalog already shows 100+ seeded products.

## Week 3 — Orders, Payment Abstraction, Shipment Simulation

**Goal:** The full buyer purchase journey works, end to end, with zero external payment dependency.

- Build `Order` + `OrderItem` creation from a buyer's cart/checkout flow
- Implement `PaymentProvider` interface and `MockPaymentProvider` (instant success, zero cost, zero API keys) — wire this as the default
- Implement `Payment` record creation/linking to orders
- Build `Shipment` record creation on order confirmation, with admin-only manual status update endpoint/UI
- Wire the full order lifecycle state machine (Order Placed → ... → Delivered) across buyer, supplier, and admin views
- *(Stretch, non-blocking)*: implement `PaystackProvider` against the free Paystack sandbox if time allows — toggled via env var, not required for any deliverable

**Definition of done:** A buyer can browse, place an order, "pay" (mock), and watch the order move through shipment statuses as admin updates them — visible on both buyer and supplier dashboards.

## Week 4 — Dashboards, Polish, Testing, Defense Prep

**Goal:** All three simple dashboards are complete, the app is usability-tested, and it's defense-ready.

- Finish Buyer dashboard: order history, current status, basic profile
- Finish Supplier dashboard: listings summary, incoming orders, order status actions
- Finish Admin dashboard: platform summary (user/order/trade-volume counts), KYB queue, logistics partner management
- UI polish pass: consistent styling via the design-token system from Week 1 (makes this fast, not a redesign)
- Run usability testing with at least 30 potential users; collect feedback toward the 80% positive target
- Fix bugs surfaced by testing
- Prepare demo script / walkthrough for the capstone defense
- Write a short README documenting the provider-abstraction pattern (payment, and the logistics-manual-to-API path) so a future team — or future you — can see exactly where Phase 1 plugs in

**Definition of done:** A complete, tested, deployed clickable prototype meeting every SMART metric in the PRD, ready for defense.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Solo dev, 1 month — any slip compounds | Weekly demoable milestones (above) catch slippage early rather than at the end |
| Scope creep toward "real" payments/logistics | Provider abstraction makes "mock now, real later" a config change, not a rewrite — resist the urge to build real integrations this month |
| Free-tier hosting cold starts during defense demo | "Warm up" the deployed app a few minutes before any live demo; keep a local Docker Compose fallback ready |
| Usability testing (30 users) takes longer than expected | Start recruiting testers in Week 2, not Week 4, so testing isn't competing with final bug-fixing |
| Design work alone is time-consuming | Design-token system set up Week 1 keeps styling fast and consistent, avoiding late-stage visual rework |

## What This Plan Deliberately Does Not Include

Per the confirmed MVP scope: no escrow build-out, no real logistics API work, no self-service logistics onboarding, no ZAR/GHS/USD live processing, no paid infrastructure or services of any kind, no multi-language work. These are Phase 1 concerns — the architecture in 02-TRD.md is built so none of this month's work has to be redone to add them later.
