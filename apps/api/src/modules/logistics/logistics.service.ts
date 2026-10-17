import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  ADMIN_SHIPMENT_TRANSITIONS,
  ErrorCode,
  OrderStatus,
  type UpdateShipmentInput,
  type UpsertLogisticsPartnerInput,
} from "@afritrade/shared";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class LogisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPartners() {
    return this.prisma.logisticsPartner.findMany({ orderBy: { name: "asc" } });
  }

  async createPartner(input: UpsertLogisticsPartnerInput) {
    return this.prisma.logisticsPartner.create({
      data: {
        name: input.name,
        countryCoverage: input.countryCoverage,
        contactEmail: input.contactEmail ?? null,
        contactPhone: input.contactPhone ?? null,
        notes: input.notes ?? null,
        isActive: input.isActive ?? true,
      },
    });
  }

  async updatePartner(id: string, input: Partial<UpsertLogisticsPartnerInput>) {
    const partner = await this.prisma.logisticsPartner.findUnique({ where: { id } });
    if (!partner) {
      throw new NotFoundException({
        code: ErrorCode.LOGISTICS_PARTNER_NOT_FOUND,
        message: "Logistics partner not found",
      });
    }

    return this.prisma.logisticsPartner.update({
      where: { id },
      data: input,
    });
  }

  async updateShipment(orderId: string, adminId: string, input: UpdateShipmentInput) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { shipment: true },
    });

    if (!order || !order.shipment) {
      throw new NotFoundException({
        code: ErrorCode.ORDER_NOT_FOUND,
        message: "Order or shipment not found",
      });
    }

    const currentStatus = order.shipment.status;
    const allowed = ADMIN_SHIPMENT_TRANSITIONS[currentStatus] ?? [];

    if (!allowed.includes(input.status)) {
      throw new BadRequestException({
        code: ErrorCode.SHIPMENT_INVALID_TRANSITION,
        message: `Invalid shipment transition from ${currentStatus} to ${input.status}`,
      });
    }

    // Carrier validation for LOGISTICS_ASSIGNED
    if (input.status === OrderStatus.LOGISTICS_ASSIGNED) {
      if (!input.logisticsPartnerId) {
        throw new BadRequestException({
          code: ErrorCode.SHIPMENT_CARRIER_REQUIRED,
          message: "Logistics partner must be selected when assigning logistics",
        });
      }

      const carrier = await this.prisma.logisticsPartner.findUnique({
        where: { id: input.logisticsPartnerId },
      });
      if (!carrier || !carrier.isActive) {
        throw new BadRequestException({
          code: ErrorCode.SHIPMENT_CARRIER_NOT_FOUND,
          message: "Selected logistics carrier does not exist or is inactive",
        });
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedShipment = await tx.shipment.update({
        where: { id: order.shipment!.id },
        data: {
          status: input.status,
          logisticsPartnerId: input.logisticsPartnerId ?? undefined,
          lastUpdatedBy: adminId,
        },
        include: { logisticsPartner: true },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: input.status },
      });

      // Record milestone event (RULES §6, §12)
      await tx.shipmentEvent.create({
        data: {
          shipmentId: order.shipment!.id,
          status: input.status,
          note: input.notes ?? `Milestone updated to ${input.status}`,
          actorId: adminId,
        },
      });

      // Append admin audit trail (RULES §4)
      await tx.adminAuditLog.create({
        data: {
          adminId,
          action: "UPDATE_SHIPMENT_STATUS",
          targetType: "Shipment",
          targetId: order.shipment!.id,
          reason: input.notes ?? `Advanced status to ${input.status}`,
          metadata: {
            previousStatus: currentStatus,
            newStatus: input.status,
            carrierId: input.logisticsPartnerId,
          },
        },
      });

      return updatedShipment;
    });
  }
}
