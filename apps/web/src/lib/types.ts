// Response shapes returned by the API (mirrors apps/api toProductDto / toOrderDto).
import type { KybStatus, OrderStatus, PaymentProviderType, PaymentStatus } from "@afritrade/shared";

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  currencyCode?: string;
  currency?: {
    id?: string;
    code: string;
    isLive?: boolean;
  };
  imageUrl: string | null;
  isActive: boolean;
  createdAt?: string;
  supplier?: { id: string; businessName: string; countryCode: string; countryName: string };
  businessProfile?: {
    id: string;
    businessName: string;
    country: { isoCode: string; name: string };
  };
}

export interface OrderDto {
  id: string; status: OrderStatus; currencyCode: string; totalAmount: string; createdAt: string; updatedAt: string;
  buyer: { id: string; fullName: string; email: string };
  items: { id: string; productId: string; productName: string; supplierName: string; quantity: number; unitPrice: string }[];
  payment: { provider: PaymentProviderType; status: PaymentStatus; reference: string } | null;
  shipment: { status: OrderStatus; updatedAt: string; logisticsPartner: { id: string; name: string } | null } | null;
}

export interface PartnerDto {
  id: string; name: string; countryCoverage: string[]; contactEmail: string | null;
  contactPhone: string | null; notes: string | null; isActive: boolean;
}

export interface BusinessProfileDto {
  id: string; businessName: string; contactPhone: string | null; kybStatus: KybStatus;
  kybRejectReason: string | null; country: { isoCode: string; name: string };
  user: { email: string; fullName: string };
}

export type Totals = { currency: string; total: string }[];
export type DashboardSummary =
  | { role: "BUYER"; totalOrders: number; activeOrders: number; deliveredOrders: number; spendByCurrency: Totals }
  | { role: "SUPPLIER"; kybStatus: KybStatus; activeProducts: number; incomingOrders: number; revenueByCurrency: Totals }
  | {
      role: "ADMIN"; usersByRole: Record<string, number>; pendingKyb: number; activeProducts: number;
      totalOrders: number; ordersByStatus: Record<string, number>; tradeVolumeByCurrency: Totals;
    };
