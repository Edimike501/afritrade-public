"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
} from "lucide-react";
import { Role, OrderStatus } from "@afritrade/shared";
import {
  RequireRole,
  Button,
  Card,
  Badge,
  OrderStatusBadge,
  OrderTracker,
  PriceDisplay,
  SimulatedBadge,
  Modal,
} from "@afritrade/ui";
import { useOrder, usePayOrder, useCancelOrder, ApiError } from "@afritrade/hooks";
import { useBuyerCurrency } from "@/context/CurrencyContext";

export default function BuyerOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { buyerCurrency } = useBuyerCurrency();

  const { data: order, isLoading, error } = useOrder(id, { refetchInterval: 5000 });
  const payOrderMutation = usePayOrder();
  const cancelOrderMutation = useCancelOrder();

  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);

  async function handleSimulatedPayment() {
    if (!order) return;
    setPaymentError(null);

    try {
      await payOrderMutation.mutateAsync(order.id);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setPaymentError(err.message || "Simulated payment failed.");
      } else if (err instanceof Error) {
        setPaymentError(err.message);
      } else {
        setPaymentError("An error occurred during simulated payment.");
      }
    }
  }

  async function handleCancelOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!order || cancelReason.trim().length < 3) {
      setCancelError("Please provide a reason of at least 3 characters.");
      return;
    }
    setCancelError(null);

    try {
      await cancelOrderMutation.mutateAsync({
        orderId: order.id,
        input: { reason: cancelReason.trim() },
      });
      setIsCancelModalOpen(false);
      setCancelReason("");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setCancelError(err.message || "Failed to cancel order.");
      } else if (err instanceof Error) {
        setCancelError(err.message);
      } else {
        setCancelError("An error occurred during cancellation.");
      }
    }
  }

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
            The requested order could not be retrieved or you do not have permission to view it.
          </p>
          <Link href="/orders">
            <Button variant="outline" size="sm">Back to Orders</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const items = order.items || [];
  const currency = order.currency || "USD";
  const isAwaitingPayment =
    order.status === OrderStatus.ORDER_PLACED ||
    order.status === OrderStatus.PAYMENT_PENDING;

  const isCancellable =
    order.status === OrderStatus.ORDER_PLACED ||
    order.status === OrderStatus.PAYMENT_PENDING ||
    order.status === OrderStatus.PAYMENT_CONFIRMED;

  return (
    <RequireRole roles={[Role.BUYER, Role.SUPPLIER, Role.ADMIN]}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Orders List</span>
          </Link>
        </div>

        {/* Order Header Card */}
        <Card className="p-6 bg-card border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Created on {new Date(order.createdAt).toLocaleDateString()} • Verified B2B Contract
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SimulatedBadge />
            {isCancellable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCancelModalOpen(true)}
                className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs font-semibold"
              >
                Cancel Order
              </Button>
            )}
          </div>
        </Card>

        {/* Horizontal Order Tracker Pipeline */}
        <section aria-label="Order Tracking Stepper">
          <OrderTracker currentStatus={order.status} />
        </section>

        {/* Two-Column Grid: Order Details & Payment Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Order Items & Delivery Logistics */}
          <div className="lg:col-span-7 space-y-6">
            {/* Wholesale Line Items */}
            <Card className="p-6 bg-card border-border space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h2 className="font-display font-bold text-base text-foreground">
                  Wholesale Order Items
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
                          Qty: <strong>{item.quantity} units</strong> @ {currency} {item.unitPrice}
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

            {/* Logistics & Delivery Destination Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5 bg-card border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
                    <MapPin size={16} />
                    <span>Destination Jurisdiction</span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-foreground mb-1">
                    Delivery Address
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Regional destination warehouse hub.<br />
                    Buyer ID: <span className="font-mono">{order.buyerId.slice(0, 8)}...</span>
                  </p>
                </div>
              </Card>

              <Card className="p-5 bg-card border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                      <Truck size={16} />
                      <span>Freight Provider</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">Curated</Badge>
                  </div>
                  <h4 className="font-display font-bold text-sm text-foreground mb-1">
                    {order.shipment?.logisticsPartner?.name || "Curated Freight Partner"}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Shipment ID: <strong className="font-mono text-primary">{order.shipment?.id ? `${order.shipment.id.slice(0, 8)}...` : "Pending Assignment"}</strong>
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-border/60 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>Curated logistics status managed by platform operators</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column: Simulated Payment Checkout Card */}
          <div className="lg:col-span-5">
            <Card className="p-6 bg-card border-border shadow-md sticky top-24 space-y-6">
              {/* Demo Mode Notice */}
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/30 space-y-1.5 text-accent-foreground">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <ShieldCheck size={16} />
                  <span>Simulated Transaction Mode</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  All orders in AfriTrade Connect execute via simulated settlements. No bank account or real card will ever be charged.
                </p>
              </div>

              {/* Settlement Summary */}
              <div className="space-y-3 pb-4 border-b border-border">
                <h3 className="font-display font-bold text-base text-foreground">
                  Settlement Breakdown
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Goods Subtotal</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {currency} {Number(order.totalAmount).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Curated Logistics</span>
                  <span className="text-success font-semibold">Included (MVP Demo)</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Statutory Platform Fee</span>
                  <span className="text-foreground tabular-nums">0.00</span>
                </div>
              </div>

              {/* Total Due & Indicative Conversion */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="font-display font-bold text-sm text-foreground block">
                    Authoritative Total
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Settled in {currency}
                  </span>
                </div>
                <PriceDisplay
                  amount={order.totalAmount}
                  currency={currency}
                  preferredCurrency={buyerCurrency}
                  size="lg"
                />
              </div>

              {/* Payment Error */}
              {paymentError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                  {paymentError}
                </div>
              )}

              {/* Simulated Pay Action */}
              {order.status === OrderStatus.CANCELLED ? (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-center space-y-1">
                  <XCircle size={28} className="mx-auto" />
                  <p className="text-xs font-bold">Order Cancelled</p>
                  <p className="text-[11px] text-muted-foreground">
                    Reversing refund entry recorded in ledger.
                  </p>
                </div>
              ) : isAwaitingPayment ? (
                <div className="space-y-2.5">
                  <Button
                    type="button"
                    onClick={handleSimulatedPayment}
                    isLoading={payOrderMutation.isPending}
                    size="lg"
                    className="w-full gap-2 shadow-sm font-bold"
                  >
                    <CreditCard size={20} />
                    <span>Pay Order (Simulated)</span>
                  </Button>
                  <p className="text-[11px] text-center text-muted-foreground">
                    Instant settlement trigger with append-only ledger entry.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-success/10 border border-success/30 text-success text-center space-y-1">
                  <CheckCircle2 size={28} className="mx-auto" />
                  <p className="text-xs font-bold">Payment Settled (Simulated)</p>
                  <p className="text-[11px] text-muted-foreground">
                    Transaction reference confirmed in mock ledger.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Cancellation Modal */}
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title="Cancel Procurement Order"
          description="Are you sure you want to cancel this wholesale order? If payment was already confirmed, a simulated reversing REFUND ledger entry will be recorded."
        >
          <form onSubmit={handleCancelOrder} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="cancel-reason" className="text-xs font-semibold text-foreground">
                Cancellation Reason
              </label>
              <textarea
                id="cancel-reason"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Specification update requested by procurement team..."
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={cancelOrderMutation.isPending}
              />
            </div>

            {cancelError && (
              <div className="p-2.5 rounded bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                {cancelError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={cancelOrderMutation.isPending}
              >
                Keep Order
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                isLoading={cancelOrderMutation.isPending}
              >
                Confirm Cancellation
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </RequireRole>
  );
}
