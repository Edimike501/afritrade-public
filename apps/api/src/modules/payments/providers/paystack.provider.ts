import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentProviderType, PaymentStatus, type PaymentInitResult } from "@afritrade/shared";
import type { InitiatePaymentParams, PaymentProvider, VerifyPaymentParams } from "./payment-provider.interface";

const BASE = "https://api.paystack.co";

/**
 * Real Paystack (NGN) adapter. Built but OFF by default — enable with
 * PAYMENT_PROVIDER=paystack + PAYSTACK_SECRET_KEY. Not a blocker for any
 * MVP deliverable. Amounts go to Paystack in the minor unit (kobo).
 */
@Injectable()
export class PaystackPaymentProvider implements PaymentProvider {
  readonly type = PaymentProviderType.PAYSTACK;
  constructor(private readonly config: ConfigService) {}

  private headers() {
    return {
      Authorization: `Bearer ${this.config.getOrThrow<string>("PAYSTACK_SECRET_KEY")}`,
      "Content-Type": "application/json",
    };
  }

  async initiate(params: InitiatePaymentParams): Promise<PaymentInitResult> {
    const res = await fetch(`${BASE}/transaction/initialize`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        email: params.buyerEmail,
        amount: Math.round(Number(params.amount) * 100),
        currency: params.currencyCode,
        reference: params.reference,
        callback_url: this.config.get<string>("PAYSTACK_CALLBACK_URL"),
        metadata: { orderId: params.orderId },
      }),
    });
    const json = (await res.json()) as { status: boolean; data?: { authorization_url: string } };
    if (!res.ok || !json.status || !json.data) throw new BadGatewayException("Paystack initialization failed");
    return {
      provider: PaymentProviderType.PAYSTACK,
      reference: params.reference,
      status: PaymentStatus.PENDING,
      authorizationUrl: json.data.authorization_url,
    };
  }

  async verify(params: VerifyPaymentParams): Promise<{ reference: string; status: PaymentStatus }> {
    const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(params.reference)}`, {
      headers: this.headers(),
    });
    const json = (await res.json()) as { status: boolean; data?: { status: string } };
    if (!res.ok || !json.status || !json.data) throw new BadGatewayException("Paystack verification failed");
    
    let status = PaymentStatus.PENDING;
    if (json.data.status === "success") {
      status = PaymentStatus.SUCCESS;
    } else if (json.data.status === "failed" || json.data.status === "abandoned") {
      status = PaymentStatus.FAILED;
    }

    return { reference: params.reference, status };
  }
}
