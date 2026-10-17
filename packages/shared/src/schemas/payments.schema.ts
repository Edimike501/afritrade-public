import { z } from "zod";
import { PaymentProviderTypeSchema, PaymentStatusSchema, LedgerEntryTypeSchema } from "../types/enums";

export const PaymentInitInputSchema = z.object({
  orderId: z.string().uuid("Order ID must be a valid UUID"),
});
export type PaymentInitInput = z.infer<typeof PaymentInitInputSchema>;

/**
 * Provider-agnostic payment result. Identical shape whether written by the
 * mock provider or Paystack, so switching providers needs no migration.
 */
export const PaymentInitResultSchema = z.object({
  provider: PaymentProviderTypeSchema,
  reference: z.string(),
  status: PaymentStatusSchema,
  /** Present only for redirect-based providers (Paystack). Mock completes instantly. */
  authorizationUrl: z.string().url().nullable().optional(),
});
export type PaymentInitResult = z.infer<typeof PaymentInitResultSchema>;

export const PaymentLedgerEntryDtoSchema = z.object({
  id: z.string().uuid(),
  paymentId: z.string().uuid().nullable(),
  type: LedgerEntryTypeSchema,
  amount: z.string(),
  currencyCode: z.string(),
  reference: z.string(),
  reason: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});
export type PaymentLedgerEntryDto = z.infer<typeof PaymentLedgerEntryDtoSchema>;
