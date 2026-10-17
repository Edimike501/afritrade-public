"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  Building2,
} from "lucide-react";
import { Role, OrderStatus } from "@afritrade/shared";
import {
  RequireRole,
  Button,
  Card,
  Badge,
  OrderStatusBadge,
  OrderTracker,
  SimulatedBadge,
} from "@afritrade/ui";
import { useOrder } from "@afritrade/hooks";

export default function SupplierOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: order, isLoading, error } = useOrder(id, { refetchInterval: 5000 });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-44 bg-muted rounded-xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-96 bg-muted rounded-xl"></div>
            <div className="lg:col-span-5 h-96 bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8 text-center max-w-md mx-auto">
          <AlertTriangle size={40} className="mx-auto text-destructive mb-3" />
          <h2 className="font-display font-bold text-lg mb-2">Order Not Found</h2>
          <p className="text-xs text-muted-foreground mb-6">
            The requested incoming order could not be found or you do not have permission to view it.
          </p>
          <Link href="/orders">
            <Button variant="outline" size="sm">Back to Incoming Orders</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const items = order.items || [];
  const currency = order.currency || "USD";

  return (
    <RequireRole roles={[Role.SUPPLIER, Role.ADMIN]}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Incoming Orders</span>
          </Link>
        </div>

        {/* Order Header Card */}
        <Card className="p-6 bg-card border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground">
                Incoming Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Purchased by Verified Buyer <span className="font-mono">{order.buyerId.slice(0, 8)}...</span> • Placed {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Supplier View (Read-Only)
            </Badge>
            <SimulatedBadge />
          </div>
        </Card>

        {/* Horizontal Order Tracker Pipeline (Read-Only) */}
        <section aria-label="Shipment Progress Stepper">
          <OrderTracker currentStatus={order.status} />
        </section>

        {/* Two-Column Grid: Items & Supplier Fulfillment Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Line Items */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6 bg-card border-border space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h2 className="font-display font-bold text-base text-foreground">
                  Wholesale Procurement Items
                </h2>
                <span className="text-xs text-muted-foreground font-semibold">
                  {items.length} Line Item{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-4 py-2 border-b border-border/50 last:border-0">
                    <div className="w-16 h-16 rounded-md bg-muted/60 flex items-center justify-center shrink-0 border border-border">
                      <Package size={30} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-sm text-foreground truncate">
                        {item.productName || "Commodity Item"}
                      </h3>
                      <div className="flex items-baseline justify-between text-xs mt-2">
                        <span className="text-muted-foreground">
                          Order Qty: <strong>{item.quantity} units</strong> @ {currency} {item.unitPrice}
                        </span>
                        <span className="font-bold font-display text-sm text-foreground tabular-nums">
                          {currency} {(Number(item.unitPrice) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Logistics Status & Operator Guidance */}
            <Card className="p-5 bg-card border-border space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Truck size={16} />
                <span>Logistics & Freight Handover</span>
              </div>
              <div className="text-xs space-y-2 text-muted-foreground">
                <p>
                  <strong>Assigned Partner:</strong>{" "}
                  <span className="text-foreground">
                    {order.shipment?.logisticsPartner?.name || "Curated Partner Assignment in Progress"}
                  </span>
                </p>
                <p>
                  <strong>Shipment Reference:</strong>{" "}
                  <span className="font-mono text-primary">
                    {order.shipment?.id ? `${order.shipment.id.slice(0, 8)}...` : "Pending"}
                  </span>
                </p>
                <div className="p-3 bg-muted/40 rounded-md border border-border text-[11px] flex items-start gap-2 mt-2">
                  <Info size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>
                    Per platform AfCFTA procurement rules, order status progression (Logistics Assigned ➔ Picked Up ➔ In Transit ➔ Customs ➔ Delivered) is managed directly by platform operations and verified freight handlers.
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Settlement & Revenue Info */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 bg-card border-border shadow-md space-y-6">
              <div className="space-y-1.5 pb-4 border-b border-border">
                <h3 className="font-display font-bold text-base text-foreground">
                  Order Settlement
                </h3>
                <p className="text-xs text-muted-foreground">
                  Settled in supplier listing currency ({currency}).
                </p>
              </div>

              <div className="space-y-3 pb-4 border-b border-border text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Gross Order Value</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {currency} {Number(order.totalAmount).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Platform Commission (MVP)</span>
                  <span className="text-success font-semibold">0.00 (Demo Tier)</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="font-display font-bold text-sm text-foreground block">
                    Total Supplier Proceeds
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Authoritative settlement
                  </span>
                </div>
                <span className="font-display font-extrabold text-xl text-foreground tabular-nums">
                  {currency} {Number(order.totalAmount).toLocaleString()}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-success/10 border border-success/30 text-success text-center space-y-1">
                <CheckCircle2 size={24} className="mx-auto" />
                <p className="text-xs font-bold">
                  {order.status === OrderStatus.CANCELLED
                    ? "Order Cancelled (Refunded in Ledger)"
                    : order.status === OrderStatus.ORDER_PLACED || order.status === OrderStatus.PAYMENT_PENDING
                    ? "Awaiting Buyer Settlement"
                    : "Payment Confirmed via Simulated Settlement"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  All transactions are verified against the immutable platform ledger.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
