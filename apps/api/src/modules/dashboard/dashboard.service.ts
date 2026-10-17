import { Injectable, BadRequestException } from "@nestjs/common";
import {
  KybStatus,
  OrderStatus,
  Role,
  ErrorCode,
  type DashboardSummaryDto,
} from "@afritrade/shared";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(userId: string, role: Role): Promise<DashboardSummaryDto> {
    if (role === Role.BUYER) {
      const [totalOrders, activeOrders, deliveredOrders, paidOrders] = await Promise.all([
        this.prisma.order.count({ where: { buyerId: userId } }),
        this.prisma.order.count({
          where: {
            buyerId: userId,
            status: { notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] },
          },
        }),
        this.prisma.order.count({
          where: { buyerId: userId, status: OrderStatus.DELIVERED },
        }),
        this.prisma.order.findMany({
          where: { buyerId: userId, status: { not: OrderStatus.CANCELLED } },
          include: { currency: true },
        }),
      ]);

      const spendMap = new Map<string, number>();
      for (const ord of paidOrders) {
        const curr = ord.currency.code;
        spendMap.set(curr, (spendMap.get(curr) ?? 0) + Number(ord.totalAmount));
      }

      const spendByCurrency = Array.from(spendMap.entries()).map(([currency, total]) => ({
        currency,
        total: total.toFixed(2),
      }));

      return {
        role: "BUYER",
        totalOrders,
        activeOrders,
        deliveredOrders,
        spendByCurrency,
      };
    }

    if (role === Role.SUPPLIER) {
      const profile = await this.prisma.businessProfile.findUnique({ where: { userId } });
      const kybStatus = (profile?.kybStatus as unknown as KybStatus) ?? KybStatus.NOT_SUBMITTED;

      if (!profile) {
        return {
          role: "SUPPLIER",
          kybStatus,
          activeProducts: 0,
          incomingOrders: 0,
          revenueByCurrency: [],
        };
      }

      const [activeProducts, incomingOrdersCount, incomingOrders] = await Promise.all([
        this.prisma.product.count({
          where: { businessProfileId: profile.id, isActive: true },
        }),
        this.prisma.order.count({
          where: { items: { some: { product: { businessProfileId: profile.id } } } },
        }),
        this.prisma.order.findMany({
          where: {
            status: { not: OrderStatus.CANCELLED },
            items: { some: { product: { businessProfileId: profile.id } } },
          },
          include: {
            currency: true,
            items: {
              where: { product: { businessProfileId: profile.id } },
            },
          },
        }),
      ]);

      const revenueMap = new Map<string, number>();
      for (const ord of incomingOrders) {
        const curr = ord.currency.code;
        const supplierItemSubtotal = ord.items.reduce(
          (sum: number, item: any) => sum + Number(item.unitPrice) * item.quantity,
          0,
        );
        revenueMap.set(curr, (revenueMap.get(curr) ?? 0) + supplierItemSubtotal);
      }

      const revenueByCurrency = Array.from(revenueMap.entries()).map(([currency, total]) => ({
        currency,
        total: total.toFixed(2),
      }));

      return {
        role: "SUPPLIER",
        kybStatus,
        activeProducts,
        incomingOrders: incomingOrdersCount,
        revenueByCurrency,
      };
    }

    if (role === Role.ADMIN) {
      const [buyers, suppliers, pendingKyb, activeProducts, totalOrders, nonCancelledOrders] =
        await Promise.all([
          this.prisma.user.count({ where: { role: Role.BUYER } }),
          this.prisma.user.count({ where: { role: Role.SUPPLIER } }),
          this.prisma.businessProfile.count({ where: { kybStatus: KybStatus.PENDING } }),
          this.prisma.product.count({ where: { isActive: true } }),
          this.prisma.order.count(),
          this.prisma.order.findMany({
            where: { status: { not: OrderStatus.CANCELLED } },
            include: { currency: true },
          }),
        ]);

      const statusCounts = await this.prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
      });
      const ordersByStatus: Record<string, number> = {};
      for (const sc of statusCounts) {
        ordersByStatus[sc.status] = sc._count.status;
      }

      const volumeMap = new Map<string, number>();
      for (const ord of nonCancelledOrders) {
        const curr = ord.currency.code;
        volumeMap.set(curr, (volumeMap.get(curr) ?? 0) + Number(ord.totalAmount));
      }

      const tradeVolumeByCurrency = Array.from(volumeMap.entries()).map(([currency, total]) => ({
        currency,
        total: total.toFixed(2),
      }));

      return {
        role: "ADMIN",
        usersByRole: { [Role.BUYER]: buyers, [Role.SUPPLIER]: suppliers },
        pendingKyb,
        activeProducts,
        totalOrders,
        ordersByStatus,
        tradeVolumeByCurrency,
      };
    }

    throw new BadRequestException({
      code: ErrorCode.DASHBOARD_INVALID_ROLE,
      message: `Invalid role: ${role}`,
    });
  }
}
