import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { MockPaymentProvider } from "./providers/mock.provider";
import { PaystackPaymentProvider } from "./providers/paystack.provider";
import { PAYMENT_PROVIDER } from "./providers/payment-provider.interface";

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    MockPaymentProvider,
    PaystackPaymentProvider,
    {
      provide: PAYMENT_PROVIDER,
      useExisting: MockPaymentProvider,
    },
  ],
  exports: [PaymentsService, PAYMENT_PROVIDER],
})
export class PaymentsModule {}
