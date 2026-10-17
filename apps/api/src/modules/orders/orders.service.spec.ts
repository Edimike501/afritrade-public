import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import {
  ErrorCode,
  LedgerEntryType,
  OrderStatus,
  PaymentStatus,
  Role,
} from "@afritrade/shared";
import { OrdersService } from "./orders.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("OrdersService", () => {
  let service: OrdersService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      product: {
        findMany: jest.fn(),
      },
      order: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      shipment: {
        update: jest.fn(),
      },
      shipmentEvent: {
        create: jest.fn(),
      },
      paymentLedgerEntry: {
        create: jest.fn(),
      },
      businessProfile: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn((cb) => cb(prisma)),
    };
    service = new OrdersService(prisma as unknown as PrismaService);
  });

  describe("create", () => {
    it("throws BadRequestException when order has no items", async () => {
      await expect(service.create("buyer-1", { items: [] })).rejects.toThrow(BadRequestException);
    });

    it("rejects with CATALOG_PRODUCT_NOT_FOUND if one or more products are missing or inactive", async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: "p1", currencyId: "curr-ngn", currency: { code: "NGN" }, price: 100 },
      ]);

      await expect(
        service.create("buyer-1", {
          items: [
            { productId: "p1", quantity: 1 },
            { productId: "p2-missing", quantity: 1 },
          ],
        }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.CATALOG_PRODUCT_NOT_FOUND }),
      });
    });

    it("rejects cross-currency carts with ORDER_CROSS_CURRENCY_REJECTED", async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: "p1", currencyId: "curr-ngn", currency: { code: "NGN" }, price: 100 },
        { id: "p2", currencyId: "curr-usd", currency: { code: "USD" }, price: 50 },
      ]);

      await expect(
        service.create("buyer-1", {
          items: [
            { productId: "p1", quantity: 1 },
            { productId: "p2", quantity: 1 },
          ],
        }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.ORDER_CROSS_CURRENCY_REJECTED }),
      });
    });

    it("creates single-currency order with initial shipment", async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: "p1", currencyId: "curr-ngn", currency: { code: "NGN" }, price: 1000 },
      ]);
      prisma.order.create.mockResolvedValue({
        id: "ord-1",
        buyerId: "buyer-1",
        status: OrderStatus.ORDER_PLACED,
        currency: { code: "NGN" },
        totalAmount: 2000,
        items: [{ id: "i1", productId: "p1", quantity: 2, unitPrice: 1000, product: { name: "Rice" } }],
        shipment: { id: "ship-1", status: OrderStatus.ORDER_PLACED, logisticsPartner: null },
        payment: null,
        createdAt: new Date(),
      });

      const order = await service.create("buyer-1", {
        items: [{ productId: "p1", quantity: 2 }],
      });

      expect(order.id).toBe("ord-1");
      expect(order.totalAmount).toBe("2000");
      expect(order.status).toBe(OrderStatus.ORDER_PLACED);
      expect(order.shipment?.status).toBe(OrderStatus.ORDER_PLACED);
    });
  });

  describe("cancel", () => {
    it("throws NotFoundException if order does not exist", async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.cancel("non-existent", "buyer-1", Role.BUYER, "Mistake")).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.ORDER_NOT_FOUND }),
      });
    });

    it("throws ForbiddenException if buyer tries to cancel someone else's order", async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: "ord-1",
        buyerId: "other-buyer",
        status: OrderStatus.ORDER_PLACED,
      });

      await expect(service.cancel("ord-1", "buyer-1", Role.BUYER, "Mistake")).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.AUTH_FORBIDDEN }),
      });
    });

    it.each([
      OrderStatus.LOGISTICS_ASSIGNED,
      OrderStatus.PICKED_UP,
      OrderStatus.IN_TRANSIT,
      OrderStatus.CUSTOMS,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
    ])("throws ORDER_CANNOT_BE_CANCELLED when order is in state: %s", async (status) => {
      prisma.order.findUnique.mockResolvedValue({
        id: "ord-1",
        buyerId: "buyer-1",
        status,
      });

      await expect(service.cancel("ord-1", "buyer-1", Role.BUYER, "Cancel request")).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.ORDER_CANNOT_BE_CANCELLED }),
      });
    });

    it("cancels unpaid order without refund ledger write", async () => {
      prisma.order.findUnique
        .mockResolvedValueOnce({
          id: "ord-1",
          buyerId: "buyer-1",
          status: OrderStatus.ORDER_PLACED,
          shipment: { id: "ship-1" },
          payment: null,
        })
        .mockResolvedValueOnce({
          id: "ord-1",
          buyerId: "buyer-1",
          status: OrderStatus.CANCELLED,
          currency: { code: "NGN" },
          totalAmount: 1000,
          items: [],
          shipment: { id: "ship-1", status: OrderStatus.CANCELLED, logisticsPartner: null },
          payment: null,
          createdAt: new Date(),
        });

      const res = await service.cancel("ord-1", "buyer-1", Role.BUYER, "Changed my mind");

      expect(res.status).toBe(OrderStatus.CANCELLED);
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "ord-1" },
          data: { status: OrderStatus.CANCELLED },
        })
      );
      expect(prisma.shipment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "ship-1" },
          data: { status: OrderStatus.CANCELLED },
        })
      );
      expect(prisma.shipmentEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            shipmentId: "ship-1",
            status: OrderStatus.CANCELLED,
            note: expect.stringContaining("Changed my mind"),
          }),
        })
      );
      expect(prisma.paymentLedgerEntry.create).not.toHaveBeenCalled();
    });

    it("cancels paid order and writes reversing REFUND ledger entry", async () => {
      const orderId = "ord-paid";
      const paymentId = "pmt-1";
      const currencyId = "curr-ngn";
      const totalAmount = "75000.00";

      prisma.order.findUnique
        .mockResolvedValueOnce({
          id: orderId,
          buyerId: "buyer-1",
          status: OrderStatus.PAYMENT_CONFIRMED,
          totalAmount,
          currencyId,
          currency: { code: "NGN" },
          shipment: { id: "ship-1" },
          payment: {
            id: paymentId,
            status: PaymentStatus.SUCCESS,
            reference: "MOCK-12345",
          },
        })
        .mockResolvedValueOnce({
          id: orderId,
          buyerId: "buyer-1",
          status: OrderStatus.CANCELLED,
          currency: { code: "NGN" },
          totalAmount,
          items: [],
          shipment: { id: "ship-1", status: OrderStatus.CANCELLED, logisticsPartner: null },
          payment: {
            id: paymentId,
            status: PaymentStatus.SUCCESS,
            reference: "MOCK-12345",
            provider: "MOCK",
          },
          createdAt: new Date(),
        });

      const res = await service.cancel(orderId, "buyer-1", Role.BUYER, "Supplier out of stock");

      expect(res.status).toBe(OrderStatus.CANCELLED);
      expect(prisma.paymentLedgerEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            paymentId,
            type: LedgerEntryType.REFUND,
            amount: totalAmount,
            currencyId,
            reference: expect.stringMatching(/^REFUND-\d+-ord-paid/),
            reason: expect.stringContaining("Supplier out of stock"),
          }),
        })
      );
    });
  });
});
