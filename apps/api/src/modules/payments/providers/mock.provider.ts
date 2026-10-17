import { Injectable } from "@nestjs/common";
import { PaymentInitResult, PaymentProviderType, PaymentStatus } from "@afritrade/shared";
import { InitiatePaymentParams, PaymentProvider, VerifyPaymentParams } from "./payment-provider.interface";

/**
 * Universal simulated provider for MVP (RULES §2).
 * Every payment in every supported currency (NGN, ZAR, GHS, USD) succeeds instantly.
 * No external API dependencies or costs.
 */
@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  async initiate(params: InitiatePaymentParams): Promise<PaymentInitResult> {
    return {
      provider: PaymentProviderType.MOCK,
      reference: params.reference,
      status: PaymentStatus.SUCCESS,
      authorizationUrl: null,
    };
  }

  async verify(params: VerifyPaymentParams): Promise<{ reference: string; status: PaymentStatus }> {
    return {
      reference: params.reference,
      status: PaymentStatus.SUCCESS,
    };
  }
}
