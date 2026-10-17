import { defaultApiClient, type ApiClient } from "../client";
import {
  PaymentInitInputSchema,
  type PaymentInitInput,
  type PaymentInitResult,
  type PaymentStatus,
} from "@afritrade/shared";

export type { PaymentInitInput, PaymentInitResult };

export async function payOrder(
  orderId: string,
  client: ApiClient = defaultApiClient,
): Promise<PaymentInitResult> {
  const res = await client.post<PaymentInitResult>(`/orders/${orderId}/pay`);
  return res.data;
}

export async function initiatePayment(
  input: PaymentInitInput,
  client: ApiClient = defaultApiClient,
): Promise<PaymentInitResult> {
  // Fail-fast client validation (RULES §10b, §20)
  const validated = PaymentInitInputSchema.parse(input);
  const res = await client.post<PaymentInitResult>("/payments/initiate", validated);
  return res.data;
}

export async function verifyPayment(
  reference: string,
  client: ApiClient = defaultApiClient,
): Promise<{ reference: string; status: PaymentStatus }> {
  const res = await client.get<{ reference: string; status: PaymentStatus }>(
    `/payments/verify/${encodeURIComponent(reference)}`,
  );
  return res.data;
}
