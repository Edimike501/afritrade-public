import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import {
  ErrorCode,
  LedgerEntryType,
  OrderStatus,
  PaymentStatus,
  Role,
  type CreateOrderInput,
  type OrderDto,
} from "@afritrade/shared";
import { PrismaService } from "../../prisma/prisma.service";

export const orderInclude = {
  currency: true,
  items: { include: { product: true } },
  shipment: { include: { logisticsPartner: true } },
  payment: true,
};

export function toOrderDto(order: any): OrderDto {
  return {
    id: order.id,
    buyerId: order.buyerId,
    status: order.status,
    currency: order.currency.code,
    totalAmount: String(order.totalAmount),
    items: order.items.map((i: any) => ({
      id: i.id,
      productId: i.productId,
      productName: i.product?.name ?? "",
      quantity: i.quantity,
      unitPrice: String(i.unitPrice),
      currency: order.currency.code,
    })),
    shipment: order.shipment
      ? {
          id: order.shipment.id,
          status: order.shipment.status,
          logisticsPartner: order.shipment.logisticsPartner
            ? { id: order.shipment.logisticsPartner.id, name: order.shipment.logisticsPartner.name }
            : null,
        }
      : null,
    payment: order.payment
      ? {
          id: order.payment.id,
          reference: order.payment.reference,
          status: order.payment.status,
          provider: order.payment.provider,
        }
      : null,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
  };
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(buyerId: string, input: CreateOrderInput): Promise<OrderDto> {
    if (!input.items || input.items.length === 0) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: "Order must contain at least one item",
      });
    }

    const productIds = input.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { currency: true },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException({
        code: ErrorCode.CATALOG_PRODUCT_NOT_FOUND,
        message: "One or more products were not found or are inactive",
      });
    }

    // Enforce single currency rule (RULES §1)
    const currencyIds = new Set(products.map((p) => p.currencyId));
    if (currencyIds.size > 1) {
      throw new BadRequestException({
        code: ErrorCode.ORDER_CROSS_CURRENCY_REJECTED,
        message: "All products in an order must use the same currency",
      });
    }

    const currency = products[0].currency;
    let total = 0;
    const itemsData = input.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      const priceNum = Number(prod.price);
      total += priceNum * item.quantity;
      return {
        productId: prod.id,
        quantity: item.quantity,
        unitPrice: prod.price,
      };
    });

    const order = await this.prisma.order.create({
      data: {
        buyerId,
        currencyId: currency.id,
        totalAmount: total.toFixed(2) as any,
        status: OrderStatus.ORDER_PLACED,
        items: { create: itemsData },
        shipment: {
          create: {
            status: OrderStatus.ORDER_PLACED,
          },
        },
      },
      include: orderInclude,
    });

    return toOrderDto(order);
  }

  async cancel(orderId: string, userId: string, role: string, reason: string): Promise<OrderDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException({
        code: ErrorCode.ORDER_NOT_FOUND,
        message: "Order not found",
      });
    }

    // Authorization check
    if (role === Role.BUYER && order.buyerId !== userId) {
      throw new ForbiddenException({
        code: ErrorCode.AUTH_FORBIDDEN,
        message: "You can only cancel your own orders",
      });
    }

    // Only allowed before shipment is picked up or in transit
    const cancellableStates = [
      OrderStatus.ORDER_PLACED,
      OrderStatus.PAYMENT_PENDING,
      OrderStatus.PAYMENT_CONFIRMED,
    ];
    if (!cancellableStates.includes(order.status as any)) {
      throw new BadRequestException({
        code: ErrorCode.ORDER_CANNOT_BE_CANCELLED,
        message: `Order cannot be cancelled once logistics processing has started (${order.status})`,
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED },
      });

      if (order.shipment) {
        await tx.shipment.update({
          where: { id: order.shipment.id },
          data: { status: OrderStatus.CANCELLED },
        });

        await tx.shipmentEvent.create({
          data: {
            shipmentId: order.shipment.id,
            status: OrderStatus.CANCELLED,
            note: `Order cancelled by ${role}: ${reason}`,
            actorId: userId,
          },
        });
      }

      // Write reversing ledger entry if payment was confirmed (RULES §2)
      if (order.payment && order.payment.status === PaymentStatus.SUCCESS) {
        await tx.paymentLedgerEntry.create({
          data: {
            paymentId: order.payment.id,
            type: LedgerEntryType.REFUND,
            amount: order.totalAmount,
            currencyId: order.currencyId,
            reference: `REFUND-${Date.now()}-${order.id.slice(0, 8)}`,
            reason: `Order cancelled: ${reason}`,
          },
        });
      }
    });

    const updated = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });
    return toOrderDto(updated);
  }

  async listForBuyer(buyerId: string, page = 1, limit = 20): Promise<OrderDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { buyerId },
      include: orderInclude,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return orders.map(toOrderDto);
  }

  async listForSupplier(userId: string, page = 1, limit = 20): Promise<OrderDto[]> {
    const profile = await this.prisma.businessProfile.findUnique({ where: { userId } });
    if (!profile) return [];

    const orders = await this.prisma.order.findMany({
      where: {
        items: {
          some: {
            product: { businessProfileId: profile.id },
          },
        },
      },
      include: orderInclude,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return orders.map(toOrderDto);
  }

  async listAll(page = 1, limit = 20, status?: string): Promise<OrderDto[]> {
    const where: any = {};
    if (status) where.status = status;

    const orders = await this.prisma.order.findMany({
      where,
      include: orderInclude,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return orders.map(toOrderDto);
  }

  async getForUser(id: string, userId: string, role: string): Promise<OrderDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
    if (!order) {
      throw new NotFoundException({
        code: ErrorCode.ORDER_NOT_FOUND,
        message: "Order not found",
      });
    }

    if (role === "ADMIN") return toOrderDto(order);
    if (role === "BUYER" && order.buyerId === userId) return toOrderDto(order);
    if (role === "SUPPLIER") {
      const profile = await this.prisma.businessProfile.findUnique({ where: { userId } });
      const hasProduct = order.items.some((i: any) => i.product.businessProfileId === profile?.id);
      if (hasProduct) return toOrderDto(order);
    }

    throw new ForbiddenException({
      code: ErrorCode.AUTH_FORBIDDEN,
      message: "You do not have permission to view this order",
    });
  }
}
