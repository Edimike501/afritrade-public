import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ErrorCode,
  LedgerEntryType,
  OrderStatus,
  PaymentInitResult,
  PaymentStatus,
} from "@afritrade/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { MockPaymentProvider } from "./providers/mock.provider";
import { PaymentProvider } from "./providers/payment-provider.interface";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mockProvider: MockPaymentProvider,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Provider selection happens in exactly one place (RULES §2).
   * In MVP (mode: simulated), MockPaymentProvider handles every currency without external dependencies.
   */
  providerFor(_currencyCode?: string): PaymentProvider {
    const mode = this.configService.get<string>("PAYMENTS_MODE", "simulated");
    if (mode === "simulated") {
      return this.mockProvider;
    }
    // Live providers are selected per currency row once live mode is active (RULES §2)
    return this.mockProvider;
  }

  async pay(orderId: string, buyerId: string): Promise<PaymentInitResult> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, currency: true, shipment: true },
    });

    if (!order) {
      throw new NotFoundException({
        code: ErrorCode.ORDER_NOT_FOUND,
        message: "Order not found",
      });
    }

    if (order.buyerId !== buyerId) {
      throw new ForbiddenException({
        code: ErrorCode.AUTH_FORBIDDEN,
        message: "You can only pay for your own orders",
      });
    }

    if (
      order.status === OrderStatus.PAYMENT_CONFIRMED ||
      order.payment?.status === PaymentStatus.SUCCESS
    ) {
      throw new BadRequestException({
        code: ErrorCode.ORDER_ALREADY_PAID,
        message: "Order has already been paid",
      });
    }

    const provider = this.providerFor(order.currency.code);
    const reference = `MOCK-${Date.now()}-${order.id.slice(0, 8)}`;
    const initResult = await provider.initiate({
      orderId: order.id,
      amount: order.totalAmount.toString(),
      currencyCode: order.currency.code,
      buyerEmail: "buyer@afritrade.test",
      reference,
    });

    if (initResult.status === PaymentStatus.SUCCESS) {
      await this.applyProviderResult(order, initResult);
    }

    return initResult;
  }

  /**
   * Centralized funnel for all payment provider results (RULES §2).
   * Writes immutable ledger entry, updates payment record, advances order status,
   * and synchronizes shipment milestones in an atomic transaction.
   */
  async applyProviderResult(order: any, result: PaymentInitResult) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Upsert payment record
      const payment = await tx.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          reference: result.reference,
          provider: result.provider as any,
          status: result.status,
          amount: order.totalAmount,
          currencyId: order.currencyId,
        },
        update: {
          reference: result.reference,
          status: result.status,
        },
      });

      // 2. Append immutable ledger entry (RULES §2)
      await tx.paymentLedgerEntry.create({
        data: {
          paymentId: payment.id,
          type: LedgerEntryType.CHARGE_SUCCEEDED,
          amount: order.totalAmount,
          currencyId: order.currencyId,
          reference: result.reference,
          reason: "Wholesale order payment confirmation",
        },
      });

      // 3. Advance order status
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAYMENT_CONFIRMED },
      });

      // 4. Update shipment status and milestone event in sync
      if (order.shipment) {
        await tx.shipment.update({
          where: { orderId: order.id },
          data: { status: OrderStatus.PAYMENT_CONFIRMED },
        });

        await tx.shipmentEvent.create({
          data: {
            shipmentId: order.shipment.id,
            status: OrderStatus.PAYMENT_CONFIRMED,
            note: "Payment confirmed via simulated settlement",
          },
        });
      }
    });
  }

  async verify(reference: string, buyerId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { reference },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException({
        code: ErrorCode.PAYMENT_NOT_FOUND,
        message: "Payment reference not found",
      });
    }

    if (payment.order.buyerId !== buyerId) {
      throw new ForbiddenException({
        code: ErrorCode.AUTH_FORBIDDEN,
        message: "Unauthorized to verify this payment",
      });
    }

    return { reference: payment.reference, status: payment.status };
  }
}
