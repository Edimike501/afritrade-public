import { z } from "zod";

/**
 * Enums that mirror the Prisma enums (apps/api/prisma/schema.prisma).
 * NOTE: Country and Currency are intentionally NOT enums — they are database
 * reference tables so that adding a market is a data task, not a code change.
 */
export enum Role {
  BUYER = "BUYER",
  SUPPLIER = "SUPPLIER",
  ADMIN = "ADMIN",
}
export const RoleSchema = z.nativeEnum(Role);

export enum SelfRegistrableRole {
  BUYER = "BUYER",
  SUPPLIER = "SUPPLIER",
}
export const SelfRegistrableRoleSchema = z.nativeEnum(SelfRegistrableRole);

export enum KybStatus {
  NOT_SUBMITTED = "NOT_SUBMITTED",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}
export const KybStatusSchema = z.nativeEnum(KybStatus);

export enum KybDocumentType {
  CERTIFICATE_OF_INCORPORATION = "CERTIFICATE_OF_INCORPORATION",
  TAX_CLEARANCE_CERTIFICATE = "TAX_CLEARANCE_CERTIFICATE",
  DIRECTOR_ID = "DIRECTOR_ID",
  PROOF_OF_ADDRESS = "PROOF_OF_ADDRESS",
  OTHER = "OTHER",
}
export const KybDocumentTypeSchema = z.nativeEnum(KybDocumentType);

export enum OrderStatus {
  ORDER_PLACED = "ORDER_PLACED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",
  LOGISTICS_ASSIGNED = "LOGISTICS_ASSIGNED",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  CUSTOMS = "CUSTOMS",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}
export const OrderStatusSchema = z.nativeEnum(OrderStatus);

export enum PaymentProviderType {
  MOCK = "MOCK",
  PAYSTACK = "PAYSTACK",
  FLUTTERWAVE = "FLUTTERWAVE",
}
export const PaymentProviderTypeSchema = z.nativeEnum(PaymentProviderType);

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}
export const PaymentStatusSchema = z.nativeEnum(PaymentStatus);

export enum LedgerEntryType {
  CHARGE_SUCCEEDED = "CHARGE_SUCCEEDED",
  REFUND = "REFUND",
}
export const LedgerEntryTypeSchema = z.nativeEnum(LedgerEntryType);

/**
 * Single source of truth for the order lifecycle (03-App-Flow.md §5).
 * Used by the API to validate admin transitions and by the web admin UI
 * to render only the legal "next status" actions.
 *
 * Payment steps (ORDER_PLACED → PAYMENT_PENDING → PAYMENT_CONFIRMED) are
 * driven by the system, not by admin shipment updates.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.ORDER_PLACED]: [OrderStatus.PAYMENT_PENDING, OrderStatus.CANCELLED],
  [OrderStatus.PAYMENT_PENDING]: [OrderStatus.PAYMENT_CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.PAYMENT_CONFIRMED]: [OrderStatus.LOGISTICS_ASSIGNED, OrderStatus.CANCELLED],
  [OrderStatus.LOGISTICS_ASSIGNED]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
  [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.CUSTOMS],
  [OrderStatus.CUSTOMS]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Restricted transition table for Admin actions (RULES §12).
 * Admin cannot transition an order from PAYMENT_PENDING to PAYMENT_CONFIRMED
 * through shipment updates without actual payment processing.
 */
export const ADMIN_SHIPMENT_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.ORDER_PLACED]: [],
  [OrderStatus.PAYMENT_PENDING]: [],
  [OrderStatus.PAYMENT_CONFIRMED]: [OrderStatus.LOGISTICS_ASSIGNED, OrderStatus.CANCELLED],
  [OrderStatus.LOGISTICS_ASSIGNED]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
  [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.CUSTOMS],
  [OrderStatus.CUSTOMS]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export function canAdminTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ADMIN_SHIPMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.ORDER_PLACED]: "Order placed",
  [OrderStatus.PAYMENT_PENDING]: "Payment pending",
  [OrderStatus.PAYMENT_CONFIRMED]: "Payment confirmed",
  [OrderStatus.LOGISTICS_ASSIGNED]: "Logistics assigned",
  [OrderStatus.PICKED_UP]: "Picked up",
  [OrderStatus.IN_TRANSIT]: "In transit",
  [OrderStatus.CUSTOMS]: "At customs",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.CANCELLED]: "Cancelled",
};
