import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ErrorCode,
  LedgerEntryType,
  OrderStatus,
  PaymentProviderType,
  PaymentStatus,
} from "@afritrade/shared";
import { PaymentsService } from "./payments.service";
import { PrismaService } from "../../prisma/prisma.service";
import { MockPaymentProvider } from "./providers/mock.provider";

describe("PaymentsService", () => {
  let service: PaymentsService;
  let prisma: any;
  let mockProvider: MockPaymentProvider;
  let configService: ConfigService;

  beforeEach(() => {
    prisma = {
      order: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
      },
      paymentLedgerEntry: {
        create: jest.fn(),
      },
      shipment: {
        update: jest.fn(),
      },
      shipmentEvent: {
        create: jest.fn(),
      },
      $transaction: jest.fn((cb) => cb(prisma)),
    };
    mockProvider = new MockPaymentProvider();
    configService = {
      get: jest.fn().mockReturnValue("simulated"),
    } as unknown as ConfigService;
    service = new PaymentsService(prisma as unknown as PrismaService, mockProvider, configService);
  });

  describe("pay", () => {
    it("throws NotFoundException if order does not exist", async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await expect(service.pay("ord-none", "buyer-1")).rejects.toThrow(NotFoundException);
      await expect(service.pay("ord-none", "buyer-1")).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.ORDER_NOT_FOUND }),
      });
    });

    it("throws ForbiddenException if buyer does not own the order", async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: "ord-1",
        buyerId: "other-buyer",
        status: OrderStatus.ORDER_PLACED,
        currency: { code: "NGN" },
      });

      await expect(service.pay("ord-1", "buyer-1")).rejects.toThrow(ForbiddenException);
      await expect(service.pay("ord-1", "buyer-1")).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.AUTH_FORBIDDEN }),
      });
    });

    it("rejects payment with BadRequestException if order status is already PAYMENT_CONFIRMED", async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: "ord-1",
        buyerId: "buyer-1",
        status: OrderStatus.PAYMENT_CONFIRMED,
        totalAmount: 5000,
        currency: { code: "NGN" },
        payment: null,
      });

      await expect(service.pay("ord-1", "buyer-1")).rejects.toThrow(BadRequestException);
      await expect(service.pay("ord-1", "buyer-1")).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.ORDER_ALREADY_PAID }),
      });
    });

    it("rejects payment with BadRequestException if order payment status is already SUCCESS", async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: "ord-1",
        buyerId: "buyer-1",
        status: OrderStatus.ORDER_PLACED,
        totalAmount: 5000,
        currency: { code: "NGN" },
        payment: { status: PaymentStatus.SUCCESS },
      });

      await expect(service.pay("ord-1", "buyer-1")).rejects.toThrow(BadRequestException);
      await expect(service.pay("ord-1", "buyer-1")).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.ORDER_ALREADY_PAID }),
      });
    });

    it.each(["NGN", "ZAR", "GHS", "USD"])(
      "processes simulated payment across launch currency %s and records immutable ledger entry",
      async (currencyCode) => {
        const orderId = `ord-${currencyCode.toLowerCase()}`;
        const currencyId = `curr-${currencyCode.toLowerCase()}`;
        const shipmentId = `ship-${currencyCode.toLowerCase()}`;
        const totalAmount = "150000.00";

        prisma.order.findUnique.mockResolvedValue({
          id: orderId,
          buyerId: "buyer-1",
          status: OrderStatus.ORDER_PLACED,
          totalAmount,
          currencyId,
          currency: { code: currencyCode },
          payment: null,
          shipment: { id: shipmentId },
        });

        prisma.payment.upsert.mockResolvedValue({
          id: "pmt-1",
          orderId,
          amount: totalAmount,
          currencyId,
        });

        const result = await service.pay(orderId, "buyer-1");

        expect(result.provider).toBe(PaymentProviderType.MOCK);
        expect(result.status).toBe(PaymentStatus.SUCCESS);
        expect(result.reference).toMatch(/^MOCK-\d+-ord-/);

        // 1. Payment upsert
        expect(prisma.payment.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { orderId },
            create: expect.objectContaining({
              orderId,
              provider: PaymentProviderType.MOCK,
              status: PaymentStatus.SUCCESS,
              amount: totalAmount,
              currencyId,
            }),
          })
        );

        // 2. Append-only ledger entry (RULES §2)
        expect(prisma.paymentLedgerEntry.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              paymentId: "pmt-1",
              type: LedgerEntryType.CHARGE_SUCCEEDED,
              amount: totalAmount,
              currencyId,
              reference: result.reference,
              reason: "Wholesale order payment confirmation",
            }),
          })
        );

        // 3. Order status advanced
        expect(prisma.order.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: orderId },
            data: { status: OrderStatus.PAYMENT_CONFIRMED },
          }),
        );

        // 4. Shipment status advanced and milestone event created
        expect(prisma.shipment.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { orderId },
            data: { status: OrderStatus.PAYMENT_CONFIRMED },
          }),
        );
        expect(prisma.shipmentEvent.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              shipmentId,
              status: OrderStatus.PAYMENT_CONFIRMED,
              note: "Payment confirmed via simulated settlement",
            }),
          }),
        );
      }
    );
  });

  describe("verify", () => {
    it("returns payment reference and status when reference exists and buyer matches", async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: "pmt-1",
        reference: "MOCK-123",
        status: PaymentStatus.SUCCESS,
        order: { buyerId: "buyer-1" },
      });

      const res = await service.verify("MOCK-123", "buyer-1");
      expect(res).toEqual({
        reference: "MOCK-123",
        status: PaymentStatus.SUCCESS,
      });
    });

    it("throws NotFoundException if payment reference does not exist", async () => {
      prisma.payment.findUnique.mockResolvedValue(null);

      await expect(service.verify("NON-EXISTENT", "buyer-1")).rejects.toThrow(NotFoundException);
      await expect(service.verify("NON-EXISTENT", "buyer-1")).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.PAYMENT_NOT_FOUND }),
      });
    });

    it("throws ForbiddenException if buyer does not own the order associated with the payment", async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: "pmt-1",
        reference: "MOCK-123",
        status: PaymentStatus.SUCCESS,
        order: { buyerId: "different-buyer" },
      });

      await expect(service.verify("MOCK-123", "buyer-1")).rejects.toThrow(ForbiddenException);
      await expect(service.verify("MOCK-123", "buyer-1")).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.AUTH_FORBIDDEN }),
      });
    });
  });
});
