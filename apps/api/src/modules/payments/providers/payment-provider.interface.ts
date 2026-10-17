import type { PaymentInitResult, PaymentStatus } from "@afritrade/shared";

export interface InitiatePaymentParams {
  orderId: string;
  amount: string;
  currencyCode: string;
  buyerEmail: string;
  reference: string;
}

export interface VerifyPaymentParams {
  reference: string;
}

export interface PaymentProvider {
  initiate(params: InitiatePaymentParams): Promise<PaymentInitResult>;
  verify(params: VerifyPaymentParams): Promise<{ reference: string; status: PaymentStatus }>;
}

export const PAYMENT_PROVIDER = Symbol("PAYMENT_PROVIDER");
