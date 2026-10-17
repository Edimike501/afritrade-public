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
  Clock,
  AlertTriangle,
  Send,
} from "lucide-react";
import { OrderStatus, ADMIN_SHIPMENT_TRANSITIONS, ORDER_STATUS_LABELS } from "@afritrade/shared";
import {
  RequireAdmin,
  Card,
  Button,
  Badge,
  OrderStatusBadge,
  OrderTracker,
  SimulatedBadge,
  Dropdown,
} from "@afritrade/ui";
import {
  useOrder,
  useUpdateOrderShipment,
  useLogisticsPartners,
  ApiError,
} from "@afritrade/hooks";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const { data: order, isLoading, refetch } = useOrder(orderId, { refetchInterval: 5000 });
  const { data: partners } = useLogisticsPartners();
  const updateShipmentMutation = useUpdateOrderShipment();

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [updateError, setUpdateError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="h-44 bg-muted rounded-xl"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <Card className="p-8 text-center max-w-md mx-auto">
        <AlertTriangle size={40} className="mx-auto text-destructive mb-3" />
        <h2 className="font-display font-bold text-lg mb-2">Order Not Found</h2>
        <Link href="/orders">
          <Button variant="outline" size="sm">Back to Orders Oversight</Button>
        </Link>
      </Card>
    );
  }

  const currentShipmentStatus = order.shipment?.status || order.status;
  const allowedTransitions = ADMIN_SHIPMENT_TRANSITIONS[currentShipmentStatus] || [];

  const partnerOptions = (partners || []).map((p) => ({
    value: p.id,
    label: `${p.name} (${p.countryCoverage.join(", ")})`,
  }));

  const transitionOptions = [
    { value: "", label: "Select Next Shipment Status" },
    ...allowedTransitions.map((status) => ({
      value: status,
      label: ORDER_STATUS_LABELS[status] || status.replace(/_/g, " "),
    })),
  ];

  async function handleAdvanceShipment(e: React.FormEvent) {
    e.preventDefault();
    setUpdateError(null);

    if (!selectedStatus) {
      setUpdateError("Please select a target shipment milestone.");
      return;
    }

    if (
      selectedStatus === OrderStatus.LOGISTICS_ASSIGNED &&
      !selectedPartnerId &&
      !order?.shipment?.logisticsPartner?.id
    ) {
      setUpdateError("A curated freight partner must be selected when assigning logistics.");
      return;
    }

    if (!order) return;
    try {
      await updateShipmentMutation.mutateAsync({
        orderId: order.id,
        input: {
          status: selectedStatus as OrderStatus,
          logisticsPartnerId: selectedPartnerId || order.shipment?.logisticsPartner?.id || undefined,
          notes: notes.trim() || undefined,
        },
      });

      setSelectedStatus("");
      setNotes("");
      refetch();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setUpdateError(err.message || "Failed to advance shipment milestone.");
      } else if (err instanceof Error) {
        setUpdateError(err.message);
      } else {
        setUpdateError("An unexpected error occurred.");
      }
    }
  }

  return (
    <RequireAdmin>
      <div className="space-y-8">
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to All Orders</span>
          </Link>
        </div>

        {/* Order Header */}
        <Card className="p-6 bg-card border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Buyer ID: <span className="font-mono">{order.buyerId}</span> • Created {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <SimulatedBadge />
        </Card>

        {/* Order Progress Stepper */}
        <section aria-label="Shipment Stepper">
          <OrderTracker currentStatus={order.status} />
        </section>

        {/* Inspection & Logistics Transition Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* Items Card */}
            <Card className="p-6 bg-card border-border space-y-4">
              <h3 className="font-display font-bold text-base text-foreground pb-2 border-b border-border">
                Wholesale Order Commodities
              </h3>
              <div className="space-y-3">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 text-xs">
                    <div>
                      <span className="font-bold text-foreground text-sm block">
                        {item.productName || "Commodity Item"}
                      </span>
                      <span className="text-muted-foreground">
                        Quantity: {item.quantity} units @ {order.currency} {item.unitPrice}
                      </span>
                    </div>
                    <span className="font-display font-bold text-sm text-foreground tabular-nums">
                      {order.currency} {(Number(item.unitPrice) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Shipment Reference Info */}
            <Card className="p-5 bg-card border-border space-y-2 text-xs">
              <h4 className="font-bold text-sm text-foreground mb-1">Shipment Identification</h4>
              <p className="text-muted-foreground">
                Shipment Record ID: <span className="font-mono text-foreground font-semibold">{order.shipment?.id || "None"}</span>
              </p>
              <p className="text-muted-foreground">
                Current Freight Partner:{" "}
                <span className="text-foreground font-semibold">
                  {order.shipment?.logisticsPartner?.name || "Unassigned"}
                </span>
              </p>
            </Card>
          </div>

          {/* Right Column: Admin Shipment Transition Controls */}
          <div className="lg:col-span-5">
            <Card className="p-6 bg-card border-border space-y-5">
              <div className="pb-3 border-b border-border">
                <h3 className="font-display font-bold text-base text-foreground">
                  Fulfillment Controls (Admin Simulation)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Advance shipment strictly along canonical ADMIN_SHIPMENT_TRANSITIONS.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Status:</span>
                  <strong className="text-primary">{ORDER_STATUS_LABELS[currentShipmentStatus] || currentShipmentStatus}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Partner:</span>
                  <span>{order.shipment?.logisticsPartner?.name || "Not assigned"}</span>
                </div>
              </div>

              {allowedTransitions.length > 0 ? (
                <form onSubmit={handleAdvanceShipment} className="space-y-4">
                  {/* Quick Select Buttons */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Quick Advance Next Milestone
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allowedTransitions.map((status) => (
                        <Button
                          key={status}
                          type="button"
                          size="sm"
                          variant={selectedStatus === status ? "default" : status === OrderStatus.CANCELLED ? "destructive" : "outline"}
                          onClick={() => setSelectedStatus(status)}
                          className="text-xs font-semibold"
                        >
                          {ORDER_STATUS_LABELS[status] || status.replace(/_/g, " ")}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Target Milestone
                    </label>
                    <Dropdown
                      value={selectedStatus}
                      onChange={setSelectedStatus}
                      options={transitionOptions}
                      fullWidth={true}
                    />
                  </div>

                  {selectedStatus === OrderStatus.LOGISTICS_ASSIGNED && (
                    <div className="space-y-1.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <label className="text-xs font-semibold text-foreground">
                        Select Curated Freight Carrier *
                      </label>
                      <Dropdown
                        value={selectedPartnerId}
                        onChange={setSelectedPartnerId}
                        options={[{ value: "", label: "Select active carrier..." }, ...partnerOptions]}
                        fullWidth={true}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Milestone Notes (Optional Audit Log Reason)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Cleared customs at Apapa port, Lagos"
                      className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {updateError && (
                    <div className="p-3 rounded bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                      {updateError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full text-xs font-bold gap-2"
                    isLoading={updateShipmentMutation.isPending}
                    disabled={!selectedStatus}
                  >
                    <Send size={14} />
                    <span>Apply Milestone Transition</span>
                  </Button>
                </form>
              ) : (
                <div className="p-4 rounded-lg bg-muted text-center text-xs text-muted-foreground">
                  Order is in terminal milestone: <strong>{ORDER_STATUS_LABELS[currentShipmentStatus] || currentShipmentStatus}</strong>. No further admin transitions allowed.
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
}
