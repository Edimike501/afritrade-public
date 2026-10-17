# AfriTrade Connect — Provider Abstraction Architecture & Phase 1 Migration Guide

## 1. Architectural Motivation & Core Principles

In cross-border trade across Africa, payment rails and logistics infrastructures are highly heterogeneous:
- **Nigeria (NGN)**: Settled predominantly via Paystack, bank transfers (NIBSS), and local virtual accounts.
- **Ghana (GHS)**: Settled via Mobile Money (MTN, Vodafone) and card rails via Flutterwave or Paystack.
- **South Africa (ZAR)**: Settled via EFT (Ozow/SiD) and Visa/Mastercard processing.
- **Regional Freight**: Transitioning between localized road freight forwarders (e.g., Kobo360, GIGX) and international carriers (e.g., DHL Global Forwarding).

Tightly coupling the order state machine or ledger logic to a specific vendor's SDK creates extreme technical debt, brittle unit tests, and security risks. 

AfriTrade Connect adopts the **Hexagonal Architecture (Ports and Adapters) pattern**:
1. **Domain Isolation**: Core domain services (`OrdersService`, `PaymentsService`, `LogisticsService`) interact only with abstract TypeScript interfaces (Ports).
2. **Pluggable Adapters**: Real or simulated external gateways are implemented as independent classes that adhere to the interface contract.
3. **Configuration-Driven Binding**: Provider selection is driven by environment variables and database configuration rows (`currencies.payment_provider`), requiring **zero code changes to switch providers or go live**.

```
   ┌─────────────────────────────────────────────────────────┐
   │                    Core Domain Layer                    │
   │       OrdersService  │  PaymentsService  │  Ledger      │
   └────────────────────────────┬────────────────────────────┘
                                │ Calls Port
                                ▼
   ┌─────────────────────────────────────────────────────────┐
   │             PaymentProvider (Port Interface)            │
   │  initiatePayment()  │  verifyPayment()  │  refund()     │
   └───────────────┬─────────────────────────┬───────────────┘
                   │                         │
     Implements    │                         │   Implements
     (MVP Phase)   ▼                         ▼   (Phase 1 Live)
        ┌──────────────────────┐  ┌─────────────────────────┐
        │ MockPaymentProvider  │  │ PaystackPaymentProvider │
        │ (Simulated, zero cost│  │ FlutterwaveProvider     │
        └──────────────────────┘  └─────────────────────────┘
```

---

## 2. Payment Provider Port Interface

The payment gateway contract is defined in `apps/api/src/modules/payments/interfaces/payment-provider.interface.ts`:

```typescript
export interface PaymentInitParams {
  orderId: string;
  amountMinor: bigint | number;
  currency: string;
  customerEmail: string;
  idempotencyKey: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  reference: string;
  amountMinor: bigint;
  currency: string;
  provider: 'MOCK' | 'PAYSTACK' | 'FLUTTERWAVE';
  timestamp: Date;
  rawResponse?: Record<string, any>;
}

export interface PaymentProvider {
  initiatePayment(params: PaymentInitParams): Promise<PaymentResult>;
  verifyPayment(reference: string): Promise<PaymentResult>;
  refundPayment(reference: string, amountMinor: bigint, reason: string): Promise<PaymentResult>;
}
```

### 2.1 Provider Resolution Strategy
Resolution of the active provider happens in exactly one place: `PaymentsService.providerFor(currency: string)`:
1. **Mode Check**: Reads `PAYMENTS_MODE` from the environment (`simulated` vs `live`).
2. **Simulated Mode (Default in MVP)**: In `simulated`, the `MockPaymentProvider` is unconditionally returned. Live credentials are never checked or required.
3. **Live Mode (Phase 1)**: In `live`, `PaymentsService` queries the `currencies` table for `currencies.payment_provider` matching the currency code and instantiates the respective adapter (`PaystackPaymentProvider` for NGN, `FlutterwavePaymentProvider` for GHS/ZAR).

---

## 3. Financial Ledger & Idempotency Safeguards

Regardless of whether a payment was processed by `MockPaymentProvider` or a live gateway, provider execution funnels through a single method:

```typescript
PaymentsService.applyProviderResult(result: PaymentResult, tx: PrismaTransaction)
```

This guarantees:
1. **Zero Divergence**: There are no duplicate code paths for mock versus live results.
2. **Append-Only Immutability**: Writes directly to `payment_ledger_entries`. Entries are never updated or deleted. Corrections write new `REFUND` or `ADJUSTMENT` entries.
3. **Database-Level Idempotency**: `reference` has a unique database index constraint. Duplicate webhooks or retried payments are structurally incapable of recording double payments.
4. **Historical Separation**: Historical simulated payments (`provider = 'MOCK'`) are excluded from real revenue calculations once live processing begins.

---

## 4. Phase 1 Migration: Step-by-Step Activation Guide

Transitioning from simulated payments to live settlements in Phase 1 requires no structural database or order logic refactoring. Follow these operational steps:

### Step 1: Secure Credentials & Environment Configuration
Set required environment variables in production:
```bash
PAYMENTS_MODE=live
NODE_ENV=production

# Paystack (Nigeria NGN)
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_WEBHOOK_SECRET=whsec_...

# Flutterwave (Ghana GHS, South Africa ZAR)
FLUTTERWAVE_SECRET_KEY=FLWSECK_LIVE-...
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_LIVE-...
FLUTTERWAVE_WEBHOOK_SECRET=flw_sec_...
```

> **Boot Guard**: The API's configuration validator (`apps/api/src/config/configuration.ts`) will fail to boot if `PAYMENTS_MODE=live` is set while any provider key referenced in the `currencies` table is missing.

### Step 2: Database Currency Provider Binding
Activate live processing for one currency at a time via a database migration or seed update:
```sql
-- Enable Paystack for Nigerian Naira
UPDATE currencies 
SET payment_provider = 'PAYSTACK', updated_at = NOW() 
WHERE code = 'NGN';

-- Enable Flutterwave for Ghanaian Cedi and South African Rand
UPDATE currencies 
SET payment_provider = 'FLUTTERWAVE', updated_at = NOW() 
WHERE code IN ('GHS', 'ZAR');
```

### Step 3: Implement Inbound Webhook Handlers
Per Engineering Rule 5, when enabling inbound webhooks:
1. Verify the cryptographic HMAC signature (`x-paystack-signature` or `verif-hash`) **before** parsing payload fields.
2. Store the raw payload in `raw_webhook_payload`.
3. Map external fields explicitly into internal types.
4. Dispatch to `PaymentsService.applyProviderResult()`.

---

## 5. Logistics Provider Abstraction

Logistics follows an identical architectural abstraction:

```typescript
export interface LogisticsProvider {
  assignShipment(orderId: string, partnerId: string): Promise<ShipmentAssignmentResult>;
  updateMilestone(shipmentId: string, event: ShipmentMilestoneEvent): Promise<ShipmentEventResult>;
  getTrackingDetails(trackingNumber: string): Promise<TrackingStatusResult>;
}
```

- **MVP Implementation**: `ManualLogisticsProvider` — uses an admin-curated partner directory (`logistics_partners`), and milestone progression is initiated manually by platform administrators.
- **Phase 1 Integration**: A future `CarrierApiLogisticsProvider` (integrating Kobo360 or DHL APIs) implements the same interface, emitting events directly into the append-only `shipment_events` log without changing the order tracker UI or order state transitions.
