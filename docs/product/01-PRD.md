# AfriTrade Connect — Product Requirements Document (PRD)

**Stage:** Academic Capstone MVP
**Owner / Solo Developer:** DevMyke
**Timeline:** 1 month
**Status:** Confirmed scope — ready for implementation

---

## 1. Vision

AfriTrade Connect is a digital B2B marketplace that connects African manufacturers, exporters, wholesalers, and buyers, paired with a simplified logistics layer, to demonstrate how technology can reduce intra-African trade friction under the AfCFTA framework.

This MVP is a **functional, demo-grade clickable prototype** built to satisfy a capstone defense — not a production system carrying real money or real users. Every requirement below is scoped against that reality: one developer, one month, zero infrastructure budget.

## 2. Problem Statement

African SMEs currently discover trading partners and coordinate logistics through fragmented, informal channels (WhatsApp, email, referrals). This creates:

- Difficulty finding verified trading partners across borders
- Poor visibility of available products across African markets
- Disconnected logistics coordination and high transportation costs
- Complex, manual customs documentation
- Limited trust and payment security between trading partners

AfriTrade Connect demonstrates a single digital ecosystem that reduces this friction — even in a simplified prototype form.

## 3. Goals for This Phase

1. Prove that a unified marketplace + logistics-visibility concept is usable and understandable to real evaluators/testers.
2. Demonstrate the full trade journey: discover → register → list/browse → order → (simulated) fulfillment.
3. Meet the capstone's own SMART success criteria without taking on cost, scale, or compliance risk that doesn't belong in an academic prototype.

## 4. Scope Boundaries (Explicit)

### In scope for MVP
- Three user-facing roles: **Buyer**, **Supplier**, **Admin** — each with registration and a simple dashboard
- Manual, admin-driven KYC/KYB approval (no third-party verification API)
- Product catalog (target: 100+ seeded sample products) across Nigeria, South Africa, and Ghana
- Buyer → Supplier ordering flow (browse, order, track status)
- A **curated, admin-managed logistics partner list** (real partner names, no live API integration) with **manual shipment status updates** simulating tracking
- Payments: built behind a provider-abstraction interface, defaulting to a **mock payment provider** (zero cost, zero external dependency) with a real Paystack (NGN) adapter ready to swap in without refactoring
- Currency-ready data model for NGN, ZAR, GHS, USD — only NGN functionally processed
- English-only UI
- A simple, role-appropriate dashboard for each of the three roles (not full analytics suites)

### Explicitly out of scope for MVP
- Escrow (concrete requirement for Phase 1, not now)
- Real logistics/freight API integrations
- Logistics-provider self-onboarding (admin-curated only)
- Multi-language support
- Real ZAR/GHS/USD payment processing
- Any paid infrastructure, paid verification services, or paid design tooling
- Advanced analytics, trade finance referrals, warehousing, API/enterprise integrations (all future-phase revenue streams from the business model)

## 5. Users & Roles

| Role | MVP Capability |
|---|---|
| **Buyer** | Register, browse verified supplier catalog, place orders, view a simple dashboard (order history/status) |
| **Supplier** | Register with business info, submit for manual KYB approval, manage product catalog, view/manage incoming orders, simple dashboard (listings, order summary) |
| **Admin** | Approve/reject KYB submissions, manage the curated logistics-partner list, manually update shipment status per order, moderate product listings, view a platform-wide simple dashboard (users, orders, trade volume) |
| **Logistics Partner** (represented, not self-service) | Appears as admin-curated data only; no login/dashboard in MVP |

## 6. Core User Journeys

1. **Supplier onboarding:** Register → submit business details → "Pending KYB" state → Admin approves → Supplier can list products.
2. **Buyer discovery & ordering:** Register → browse catalog by country/category → view supplier/product detail → place order → mock (or Paystack NGN) payment → order confirmation.
3. **Order fulfillment (simulated):** Admin assigns a curated logistics partner to the order → manually advances shipment status (Pending → Picked Up → In Transit → Customs → Delivered) → buyer and supplier see status reflected on their dashboards.
4. **Admin oversight:** Review pending KYB queue, manage logistics partner list, monitor trade volume and order counts on a simple analytics view.

## 7. Success Metrics

This phase is measured against the capstone proposal's existing SMART criteria — no additional metrics defined:

- One functional clickable prototype completed before project defense
- Registration workflow live for buyers, suppliers, and admin (logistics represented via curated admin data, per confirmed scope)
- Marketplace displaying at least 100 sample products
- Shipment tracking simulation integrated into the order flow
- User testing with at least 30 potential users
- At least 80% positive usability feedback
- Prototype completed within the 1-month timeline

## 8. Constraints & Assumptions

- **Zero infrastructure cost** is a hard constraint — every technical decision in the TRD defaults to free-tier or local-only tooling.
- Solo developer — scope is deliberately kept lean; nothing in this PRD assumes a team.
- No real users or real money at this stage; all "trust" and "compliance" features are illustrative, not production-grade.
- The platform must be **built for extensibility**: payment provider swap, logistics API integration, new country/currency support, additional roles, and design handoff to a future team are all expected in Phase 1 — architecture decisions in the TRD reflect this even though none of it is built now.

## 9. Phase 1 Preview (Not Built Now, Referenced for Context)

- Real escrow payment flow
- Live logistics/freight API integrations
- Logistics-provider self-onboarding
- Multi-currency live processing (ZAR, GHS, USD)
- Expanded dashboards and analytics
- Team-based content/design editing (CMS-style)
