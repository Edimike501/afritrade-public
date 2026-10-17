import {
  CreateOrderSchema,
  CancelOrderSchema,
  OrderDtoSchema,
  OrderItemInputSchema,
  OrderListQuerySchema,
  PaymentInitInputSchema,
  PaymentInitResultSchema,
  PaymentLedgerEntryDtoSchema,
  UpdateShipmentSchema,
  ShipmentEventDtoSchema,
  OrderStatus,
  PaymentProviderType,
  PaymentStatus,
  LedgerEntryType,
} from "../index";

describe("Week 3 Domain Schemas & Contracts", () => {
  const validUuid = "123e4567-e89b-12d3-a456-426614174000";
  const validUuid2 = "987fcdeb-51a2-43f7-9876-543210987654";

  describe("OrderItemInputSchema & CreateOrderSchema", () => {
    it("accepts valid order items and order creation payload", () => {
      const validItem = {
        productId: validUuid,
        quantity: 10,
      };
      expect(OrderItemInputSchema.parse(validItem)).toEqual(validItem);

      const validOrder = {
        items: [validItem],
      };
      const result = CreateOrderSchema.parse(validOrder);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(10);
    });

    it("rejects empty items array", () => {
      expect(() => CreateOrderSchema.parse({ items: [] })).toThrow();
    });

    it("rejects non-UUID product IDs", () => {
      expect(() =>
        OrderItemInputSchema.parse({
          productId: "invalid-uuid",
          quantity: 5,
        })
      ).toThrow();
    });

    it("rejects non-positive, floating, or out-of-range quantities", () => {
      expect(() =>
        OrderItemInputSchema.parse({
          productId: validUuid,
          quantity: 0,
        })
      ).toThrow();

      expect(() =>
        OrderItemInputSchema.parse({
          productId: validUuid,
          quantity: -1,
        })
      ).toThrow();

      expect(() =>
        OrderItemInputSchema.parse({
          productId: validUuid,
          quantity: 1.5,
        })
      ).toThrow();

      expect(() =>
        OrderItemInputSchema.parse({
          productId: validUuid,
          quantity: 100001,
        })
      ).toThrow();
    });

    it("rejects order with more than 50 items", () => {
      const items = Array.from({ length: 51 }, () => ({
        productId: validUuid,
        quantity: 1,
      }));
      expect(() => CreateOrderSchema.parse({ items })).toThrow();
    });
  });

  describe("CancelOrderSchema", () => {
    it("accepts a valid cancellation reason", () => {
      const input = { reason: "Customer requested cancellation prior to dispatch" };
      expect(CancelOrderSchema.parse(input)).toEqual(input);
    });

    it("rejects cancellation reasons that are too short (< 3 characters)", () => {
      expect(() => CancelOrderSchema.parse({ reason: "no" })).toThrow();
      expect(() => CancelOrderSchema.parse({ reason: "   " })).toThrow();
    });

    it("rejects cancellation reasons that exceed 300 characters", () => {
      const longReason = "a".repeat(301);
      expect(() => CancelOrderSchema.parse({ reason: longReason })).toThrow();
    });
  });

  describe("OrderDtoSchema & OrderListQuerySchema", () => {
    it("validates full order DTO structure including shipment and payment", () => {
      const orderDto = {
        id: validUuid,
        buyerId: validUuid2,
        status: OrderStatus.PAYMENT_CONFIRMED,
        currency: "NGN",
        totalAmount: "150000.00",
        items: [
          {
            id: validUuid,
            productId: validUuid2,
            productName: "Premium Nigerian Cocoa Beans",
            quantity: 5,
            unitPrice: "30000.00",
            currency: "NGN",
          },
        ],
        shipment: {
          id: validUuid,
          status: OrderStatus.PAYMENT_CONFIRMED,
          logisticsPartner: {
            id: validUuid2,
            name: "Bolloré Africa Logistics",
          },
        },
        payment: {
          id: validUuid,
          reference: "MOCK-1728900000-12345678",
          status: PaymentStatus.SUCCESS,
          provider: PaymentProviderType.MOCK,
        },
        createdAt: new Date().toISOString(),
      };

      const parsed = OrderDtoSchema.parse(orderDto);
      expect(parsed.id).toBe(validUuid);
      expect(parsed.status).toBe(OrderStatus.PAYMENT_CONFIRMED);
      expect(parsed.payment?.provider).toBe(PaymentProviderType.MOCK);
    });

    it("validates order list query with optional status filter", () => {
      expect(OrderListQuerySchema.parse({ page: 2, limit: 15, status: OrderStatus.ORDER_PLACED })).toEqual({
        page: 2,
        limit: 15,
        status: OrderStatus.ORDER_PLACED,
      });

      expect(OrderListQuerySchema.parse({})).toEqual({
        page: 1,
        limit: 20,
      });
    });
  });

  describe("Payment Schemas", () => {
    it("validates PaymentInitInputSchema", () => {
      expect(PaymentInitInputSchema.parse({ orderId: validUuid })).toEqual({ orderId: validUuid });
      expect(() => PaymentInitInputSchema.parse({ orderId: "bad-id" })).toThrow();
    });

    it("validates PaymentInitResultSchema for mock and redirect providers", () => {
      const mockResult = {
        provider: PaymentProviderType.MOCK,
        reference: "MOCK-1728900000-abcd",
        status: PaymentStatus.SUCCESS,
        authorizationUrl: null,
      };
      expect(PaymentInitResultSchema.parse(mockResult)).toEqual(mockResult);

      const paystackResult = {
        provider: PaymentProviderType.PAYSTACK,
        reference: "PSTK-1728900000-xyz",
        status: PaymentStatus.PENDING,
        authorizationUrl: "https://checkout.paystack.com/access_code",
      };
      expect(PaymentInitResultSchema.parse(paystackResult)).toEqual(paystackResult);
    });

    it("validates PaymentLedgerEntryDtoSchema", () => {
      const ledgerEntry = {
        id: validUuid,
        paymentId: validUuid2,
        type: LedgerEntryType.CHARGE_SUCCEEDED,
        amount: "50000.00",
        currencyCode: "NGN",
        reference: "MOCK-1728900000-abcd",
        reason: "Simulated order checkout settlement",
        createdAt: new Date().toISOString(),
      };
      expect(PaymentLedgerEntryDtoSchema.parse(ledgerEntry)).toEqual(ledgerEntry);
    });
  });

  describe("Shipment & Milestone Schemas", () => {
    it("validates UpdateShipmentSchema", () => {
      const input = {
        status: OrderStatus.LOGISTICS_ASSIGNED,
        logisticsPartnerId: validUuid,
        notes: "Partner assigned for inland haulage",
      };
      expect(UpdateShipmentSchema.parse(input)).toEqual(input);

      expect(() =>
        UpdateShipmentSchema.parse({
          status: OrderStatus.LOGISTICS_ASSIGNED,
          logisticsPartnerId: "not-a-uuid",
        })
      ).toThrow();
    });

    it("validates ShipmentEventDtoSchema", () => {
      const eventDto = {
        id: validUuid,
        shipmentId: validUuid2,
        status: OrderStatus.PICKED_UP,
        note: "Cargo loaded onto transport at warehouse",
        actorId: validUuid,
        createdAt: new Date().toISOString(),
      };
      expect(ShipmentEventDtoSchema.parse(eventDto)).toEqual(eventDto);
    });
  });
});
