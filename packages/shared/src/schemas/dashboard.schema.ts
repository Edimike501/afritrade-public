import { z } from "zod";
import { KybStatusSchema } from "../types/enums";

export const CurrencyTotalSchema = z.object({
  currency: z.string().min(3).max(3),
  total: z.string(),
});
export type CurrencyTotal = z.infer<typeof CurrencyTotalSchema>;

export const BuyerDashboardDtoSchema = z.object({
  role: z.literal("BUYER"),
  totalOrders: z.number().int().nonnegative(),
  activeOrders: z.number().int().nonnegative(),
  deliveredOrders: z.number().int().nonnegative(),
  spendByCurrency: z.array(CurrencyTotalSchema),
  recentOrders: z.array(z.any()).optional(),
});
export type BuyerDashboardDto = z.infer<typeof BuyerDashboardDtoSchema>;

export const SupplierDashboardDtoSchema = z.object({
  role: z.literal("SUPPLIER"),
  kybStatus: KybStatusSchema,
  activeProducts: z.number().int().nonnegative(),
  incomingOrders: z.number().int().nonnegative(),
  revenueByCurrency: z.array(CurrencyTotalSchema),
  recentOrders: z.array(z.any()).optional(),
});
export type SupplierDashboardDto = z.infer<typeof SupplierDashboardDtoSchema>;

export const AdminDashboardDtoSchema = z.object({
  role: z.literal("ADMIN"),
  usersByRole: z.record(z.string(), z.number().int().nonnegative()),
  pendingKyb: z.number().int().nonnegative(),
  activeProducts: z.number().int().nonnegative(),
  totalOrders: z.number().int().nonnegative(),
  ordersByStatus: z.record(z.string(), z.number().int().nonnegative()),
  tradeVolumeByCurrency: z.array(CurrencyTotalSchema),
});
export type AdminDashboardDto = z.infer<typeof AdminDashboardDtoSchema>;

export const DashboardSummaryDtoSchema = z.discriminatedUnion("role", [
  BuyerDashboardDtoSchema,
  SupplierDashboardDtoSchema,
  AdminDashboardDtoSchema,
]);
export type DashboardSummaryDto = z.infer<typeof DashboardSummaryDtoSchema>;
