import { BadRequestException } from "@nestjs/common";
import { Role, KybStatus, OrderStatus, ErrorCode } from "@afritrade/shared";
import { DashboardService } from "./dashboard.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("DashboardService", () => {
  let service: DashboardService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      order: {
        count: jest.fn().mockResolvedValue(5),
        findMany: jest.fn().mockResolvedValue([]),
        groupBy: jest.fn().mockResolvedValue([]),
      },
      product: {
        count: jest.fn().mockResolvedValue(10),
      },
      businessProfile: {
        findUnique: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(2),
      },
      user: {
        count: jest.fn().mockResolvedValue(10),
      },
    };
    service = new DashboardService(prisma as unknown as PrismaService);
  });

  describe("Buyer Dashboard", () => {
    it("returns accurate buyer metrics with spend grouped by currency", async () => {
      prisma.order.count
        .mockResolvedValueOnce(8) // totalOrders
        .mockResolvedValueOnce(3) // activeOrders
        .mockResolvedValueOnce(4); // deliveredOrders

      prisma.order.findMany.mockResolvedValueOnce([
        { totalAmount: "1000.00", currency: { code: "NGN" } },
        { totalAmount: "2500.00", currency: { code: "NGN" } },
        { totalAmount: "150.00", currency: { code: "USD" } },
      ]);

      const summary = (await service.summary("buyer-1", Role.BUYER)) as any;
      expect(summary.role).toBe("BUYER");
      expect(summary.totalOrders).toBe(8);
      expect(summary.activeOrders).toBe(3);
      expect(summary.deliveredOrders).toBe(4);
      expect(summary.spendByCurrency).toEqual([
        { currency: "NGN", total: "3500.00" },
        { currency: "USD", total: "150.00" },
      ]);
    });
  });

  describe("Supplier Dashboard", () => {
    it("returns zero metrics when business profile is missing", async () => {
      prisma.businessProfile.findUnique.mockResolvedValueOnce(null);

      const summary = (await service.summary("supplier-no-profile", Role.SUPPLIER)) as any;
      expect(summary.role).toBe("SUPPLIER");
      expect(summary.kybStatus).toBe(KybStatus.NOT_SUBMITTED);
      expect(summary.activeProducts).toBe(0);
      expect(summary.incomingOrders).toBe(0);
      expect(summary.revenueByCurrency).toEqual([]);
    });

    it("calculates line-item revenue per currency for approved supplier", async () => {
      prisma.businessProfile.findUnique.mockResolvedValueOnce({
        id: "profile-1",
        kybStatus: KybStatus.APPROVED,
      });

      prisma.product.count.mockResolvedValueOnce(12); // active products
      prisma.order.count.mockResolvedValueOnce(4); // incoming orders count

      prisma.order.findMany.mockResolvedValueOnce([
        {
          id: "order-1",
          currency: { code: "ZAR" },
          items: [
            { unitPrice: "50.00", quantity: 2 },
            { unitPrice: "25.00", quantity: 4 },
          ],
        },
        {
          id: "order-2",
          currency: { code: "USD" },
          items: [{ unitPrice: "100.00", quantity: 3 }],
        },
      ]);

      const summary = (await service.summary("supplier-1", Role.SUPPLIER)) as any;
      expect(summary.role).toBe("SUPPLIER");
      expect(summary.kybStatus).toBe(KybStatus.APPROVED);
      expect(summary.activeProducts).toBe(12);
      expect(summary.incomingOrders).toBe(4);
      expect(summary.revenueByCurrency).toEqual([
        { currency: "ZAR", total: "200.00" }, // (50*2) + (25*4) = 200
        { currency: "USD", total: "300.00" }, // (100*3) = 300
      ]);
    });
  });

  describe("Admin Dashboard", () => {
    it("returns platform overview with status distribution and trade volume", async () => {
      prisma.user.count
        .mockResolvedValueOnce(50) // buyers
        .mockResolvedValueOnce(20); // suppliers

      prisma.businessProfile.count.mockResolvedValueOnce(3); // pendingKyb
      prisma.product.count.mockResolvedValueOnce(150); // active products
      prisma.order.count.mockResolvedValueOnce(80); // total orders

      prisma.order.findMany.mockResolvedValueOnce([
        { totalAmount: "100000.00", currency: { code: "NGN" } },
        { totalAmount: "45000.00", currency: { code: "NGN" } },
        { totalAmount: "1200.00", currency: { code: "GHS" } },
      ]);

      prisma.order.groupBy.mockResolvedValueOnce([
        { status: OrderStatus.ORDER_PLACED, _count: { status: 10 } },
        { status: OrderStatus.DELIVERED, _count: { status: 70 } },
      ]);

      const summary = (await service.summary("admin-1", Role.ADMIN)) as any;
      expect(summary.role).toBe("ADMIN");
      expect(summary.usersByRole).toEqual({ BUYER: 50, SUPPLIER: 20 });
      expect(summary.pendingKyb).toBe(3);
      expect(summary.activeProducts).toBe(150);
      expect(summary.totalOrders).toBe(80);
      expect(summary.ordersByStatus).toEqual({
        ORDER_PLACED: 10,
        DELIVERED: 70,
      });
      expect(summary.tradeVolumeByCurrency).toEqual([
        { currency: "NGN", total: "145000.00" },
        { currency: "GHS", total: "1200.00" },
      ]);
    });
  });

  it("throws BadRequestException for invalid role", async () => {
    await expect(service.summary("unknown-1", "GUEST" as any)).rejects.toThrow(BadRequestException);
  });
});
