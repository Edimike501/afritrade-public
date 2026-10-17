import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ErrorCode, OrderStatus } from "@afritrade/shared";
import { LogisticsService } from "./logistics.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("LogisticsService", () => {
  let service: LogisticsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      logisticsPartner: {
        findMany: jest.fn().mockResolvedValue([{ id: "lp-1", name: "Bolloré Africa Logistics", isActive: true }]),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      order: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      shipment: {
        update: jest.fn(),
      },
      shipmentEvent: {
        create: jest.fn(),
      },
      adminAuditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn((cb) => cb(prisma)),
    };
    service = new LogisticsService(prisma as unknown as PrismaService);
  });

  it("lists logistics partners", async () => {
    const partners = await service.listPartners();
    expect(partners).toHaveLength(1);
    expect(partners[0].name).toBe("Bolloré Africa Logistics");
  });

  describe("updateShipment", () => {
    it("throws ORDER_NOT_FOUND if order or shipment does not exist", async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateShipment("ord-none", "admin-1", { status: OrderStatus.LOGISTICS_ASSIGNED })
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.ORDER_NOT_FOUND }),
      });
    });

    it("rejects invalid shipment transition per ADMIN_SHIPMENT_TRANSITIONS", async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: "ord-1",
        shipment: { id: "ship-1", status: OrderStatus.ORDER_PLACED },
      });

      // ORDER_PLACED cannot jump directly to DELIVERED
      await expect(
        service.updateShipment("ord-1", "admin-1", { status: OrderStatus.DELIVERED }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.SHIPMENT_INVALID_TRANSITION }),
      });
    });

    it("asserts admin cannot manually move order into or out of payment states (RULES §12)", async () => {
      // From ORDER_PLACED to PAYMENT_CONFIRMED
      prisma.order.findUnique.mockResolvedValue({
        id: "ord-1",
        shipment: { id: "ship-1", status: OrderStatus.ORDER_PLACED },
      });
      await expect(
        service.updateShipment("ord-1", "admin-1", { status: OrderStatus.PAYMENT_CONFIRMED }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.SHIPMENT_INVALID_TRANSITION }),
      });

      // From PAYMENT_PENDING to PAYMENT_CONFIRMED
      prisma.order.findUnique.mockResolvedValue({
        id: "ord-1",
        shipment: { id: "ship-1", status: OrderStatus.PAYMENT_PENDING },
      });
      await expect(
        service.updateShipment("ord-1", "admin-1", { status: OrderStatus.PAYMENT_CONFIRMED }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.SHIPMENT_INVALID_TRANSITION }),
      });
    });

    it("requires logisticsPartnerId with SHIPMENT_CARRIER_REQUIRED when moving to LOGISTICS_ASSIGNED", async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: "ord-1",
        shipment: { id: "ship-1", status: OrderStatus.PAYMENT_CONFIRMED },
      });

      await expect(
        service.updateShipment("ord-1", "admin-1", {
          status: OrderStatus.LOGISTICS_ASSIGNED,
        }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.SHIPMENT_CARRIER_REQUIRED }),
      });
    });

    it("throws SHIPMENT_CARRIER_NOT_FOUND if carrier does not exist or is inactive", async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: "ord-1",
        shipment: { id: "ship-1", status: OrderStatus.PAYMENT_CONFIRMED },
      });
      prisma.logisticsPartner.findUnique.mockResolvedValue({
        id: "lp-inactive",
        name: "Old Cargo Co",
        isActive: false,
      });

      await expect(
        service.updateShipment("ord-1", "admin-1", {
          status: OrderStatus.LOGISTICS_ASSIGNED,
          logisticsPartnerId: "lp-inactive",
        }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: ErrorCode.SHIPMENT_CARRIER_NOT_FOUND }),
      });
    });

    it("advances shipment status, records append-only ShipmentEvent and AdminAuditLog", async () => {
      const orderId = "ord-1";
      const shipmentId = "ship-1";
      const carrierId = "lp-1";
      const adminId = "admin-user-1";
      const notes = "Assigned for cold chain transport";

      prisma.order.findUnique.mockResolvedValue({
        id: orderId,
        shipment: { id: shipmentId, status: OrderStatus.PAYMENT_CONFIRMED },
      });
      prisma.logisticsPartner.findUnique.mockResolvedValue({
        id: carrierId,
        name: "Bolloré Africa Logistics",
        isActive: true,
      });
      prisma.shipment.update.mockResolvedValue({
        id: shipmentId,
        status: OrderStatus.LOGISTICS_ASSIGNED,
        logisticsPartnerId: carrierId,
      });

      const result = await service.updateShipment(orderId, adminId, {
        status: OrderStatus.LOGISTICS_ASSIGNED,
        logisticsPartnerId: carrierId,
        notes,
      });

      expect(result.status).toBe(OrderStatus.LOGISTICS_ASSIGNED);

      // 1. Order status update
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: OrderStatus.LOGISTICS_ASSIGNED },
      });

      // 2. ShipmentEvent append-only record
      expect(prisma.shipmentEvent.create).toHaveBeenCalledWith({
        data: {
          shipmentId,
          status: OrderStatus.LOGISTICS_ASSIGNED,
          note: notes,
          actorId: adminId,
        },
      });

      // 3. AdminAuditLog record (RULES §4)
      expect(prisma.adminAuditLog.create).toHaveBeenCalledWith({
        data: {
          adminId,
          action: "UPDATE_SHIPMENT_STATUS",
          targetType: "Shipment",
          targetId: shipmentId,
          reason: notes,
          metadata: {
            previousStatus: OrderStatus.PAYMENT_CONFIRMED,
            newStatus: OrderStatus.LOGISTICS_ASSIGNED,
            carrierId,
          },
        },
      });
    });

    it.each([
      [OrderStatus.LOGISTICS_ASSIGNED, OrderStatus.PICKED_UP],
      [OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT],
      [OrderStatus.IN_TRANSIT, OrderStatus.CUSTOMS],
      [OrderStatus.CUSTOMS, OrderStatus.DELIVERED],
    ])("successfully transitions from %s to %s and logs milestone", async (fromStatus, toStatus) => {
      const orderId = "ord-milestone";
      const shipmentId = "ship-milestone";
      const adminId = "admin-user-1";

      prisma.order.findUnique.mockResolvedValue({
        id: orderId,
        shipment: { id: shipmentId, status: fromStatus },
      });
      prisma.shipment.update.mockResolvedValue({
        id: shipmentId,
        status: toStatus,
      });

      const result = await service.updateShipment(orderId, adminId, {
        status: toStatus,
        notes: `Advanced to ${toStatus}`,
      });

      expect(result.status).toBe(toStatus);
      expect(prisma.shipmentEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          shipmentId,
          status: toStatus,
          actorId: adminId,
        }),
      });
      expect(prisma.adminAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adminId,
          action: "UPDATE_SHIPMENT_STATUS",
          targetId: shipmentId,
        }),
      });
    });
  });
});
