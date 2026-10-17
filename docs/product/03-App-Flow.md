# AfriTrade Connect — Web App Flow

**Companion to:** 01-PRD.md, 02-TRD.md
**Platform:** Web app (responsive, desktop-first for demo/defense context)

---

## 1. Global / Public Flow (Unauthenticated)

```mermaid
flowchart TD
    A[Landing Page] --> B[Browse Marketplace - public catalog view]
    A --> C[Register]
    A --> D[Login]
    B --> E[Product / Supplier Detail Page]
    E --> C
    C --> F{Select Role}
    F -->|Buyer| G[Buyer Registration Form]
    F -->|Supplier| H[Supplier Registration Form - business details]
    G --> I[Buyer Dashboard]
    H --> J[Pending KYB Status Screen]
```

- Landing page communicates the value proposition and links straight into a public, browsable product catalog — evaluators should be able to see the marketplace without logging in.
- Registration asks the user to select a role up front (Buyer or Supplier); Admin accounts are not self-registrable — seeded directly for the prototype.

## 2. Supplier Flow

```mermaid
flowchart TD
    A[Supplier Registration] --> B[Business Details Form - name, country, contact]
    B --> C[Pending KYB Status Screen]
    C --> D{Admin Review}
    D -->|Approved| E[Supplier Dashboard]
    D -->|Rejected| F[Rejection Notice + Reason]
    E --> G[Manage Product Catalog - add/edit/remove]
    E --> H[View Incoming Orders]
    H --> I[Update Order Status - e.g. Accepted, Preparing]
    E --> J[Simple Analytics - listings count, order count]
```

- Supplier cannot list products until KYB status is `APPROVED` — enforced at the API level, not just hidden in the UI.
- Supplier dashboard stays intentionally simple: product list, order list, a couple of summary numbers. No advanced analytics in MVP.

## 3. Buyer Flow

```mermaid
flowchart TD
    A[Buyer Registration] --> B[Buyer Dashboard]
    B --> C[Browse Catalog - filter by country/category]
    C --> D[Product Detail Page]
    D --> E[Place Order]
    E --> F[Checkout - Payment Step]
    F --> G{Payment Provider}
    G -->|Mock, default| H[Instant Success]
    G -->|Paystack NGN, if enabled| I[Real Payment Flow]
    H --> J[Order Confirmation]
    I --> J
    J --> B
    B --> K[Order History / Status Tracking]
```

- Checkout uses whichever `PaymentProvider` is active per the TRD's provider-abstraction design — the buyer-facing UI is identical either way.
- Buyer dashboard is simple: active orders with current shipment status, past orders, basic profile info.

## 4. Admin Flow

```mermaid
flowchart TD
    A[Admin Login] --> B[Admin Dashboard]
    B --> C[Pending KYB Queue]
    C --> D[Review Supplier Submission]
    D --> E{Decision}
    E -->|Approve| F[Supplier Activated]
    E -->|Reject| G[Supplier Notified]
    B --> H[Logistics Partner Management - curated list CRUD]
    B --> I[Order Oversight - all orders]
    I --> J[Assign Logistics Partner to Order]
    J --> K[Manually Advance Shipment Status]
    K --> L[Buyer + Supplier see updated status]
    B --> M[Platform Summary - total users, orders, trade volume]
```

- Admin is the operational backbone of the MVP: every piece of "automation" the real platform will eventually have (verification, logistics API, payment processing) is a manual admin action in this prototype.
- Logistics partner management is simple CRUD on the curated list — no integration, no credentials.

## 5. Order Lifecycle (Cross-Role State Machine)

```mermaid
stateDiagram-v2
    [*] --> OrderPlaced
    OrderPlaced --> PaymentPending
    PaymentPending --> PaymentConfirmed
    PaymentConfirmed --> LogisticsAssigned : Admin assigns partner
    LogisticsAssigned --> PickedUp : Admin updates manually
    PickedUp --> InTransit
    InTransit --> Customs
    Customs --> Delivered
    Delivered --> [*]
```

- This single state machine drives what the Buyer sees (order status), what the Supplier sees (order status), and what the Admin controls (status transitions) — one source of truth across all three dashboards.

## 6. Navigation Summary by Role

| Role | Primary Nav Items |
|---|---|
| Public | Home, Browse Marketplace, Login, Register |
| Buyer | Dashboard, Browse Marketplace, My Orders, Profile |
| Supplier | Dashboard, My Products, Incoming Orders, Profile/KYB Status |
| Admin | Dashboard, KYB Queue, Logistics Partners, All Orders, Platform Summary |
