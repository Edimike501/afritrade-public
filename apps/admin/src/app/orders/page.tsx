"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  ArrowRight,
  Eye,
  CheckCircle2,
  Truck,
  AlertTriangle,
} from "lucide-react";
import { OrderStatus } from "@afritrade/shared";
import {
  RequireAdmin,
  Card,
  Button,
  Input,
  Badge,
  OrderStatusBadge,
  EmptyState,
  SimulatedBadge,
  PriceDisplay,
} from "@afritrade/ui";
import { useAdminOrders } from "@afritrade/hooks";

export default function AdminOrdersPage() {
  const { data: orders, isLoading, refetch } = useAdminOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const orderList = orders || [];

  const filtered = orderList.filter((o) => {
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchesSearch =
      !search.trim() ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.buyerId.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <RequireAdmin>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border text-xs font-semibold mb-2">
              <ClipboardList size={14} className="text-primary" />
              <span>Operations Orders · Platform Oversight</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground">
              Orders Oversight
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Monitor cross-border wholesale order lifecycles, payments, and regional logistics transitions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SimulatedBadge />
            <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
              Refresh
            </Button>
          </div>
        </div>

        {/* Directory Card */}
        <Card className="p-5 bg-card border-border space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:max-w-md">
              <Input
                id="order-search"
                placeholder="Search by order ID or buyer ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search size={16} />}
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs overflow-x-auto w-full sm:w-auto">
              {[
                "ALL",
                OrderStatus.ORDER_PLACED,
                OrderStatus.PAYMENT_CONFIRMED,
                OrderStatus.LOGISTICS_ASSIGNED,
                OrderStatus.IN_TRANSIT,
                OrderStatus.CUSTOMS,
                OrderStatus.DELIVERED,
                OrderStatus.CANCELLED,
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === s
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s === "ALL" ? "All Orders" : s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-muted rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No Orders Found"
              description="No wholesale orders matching the selected status or search query."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Order ID / Date</th>
                    <th className="py-3 px-3">Buyer ID</th>
                    <th className="py-3 px-3">Settlement Total</th>
                    <th className="py-3 px-3">Lifecycle Status</th>
                    <th className="py-3 px-3">Logistics Partner</th>
                    <th className="py-3 px-3 text-right">Inspection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-display font-bold text-sm text-foreground">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="text-muted-foreground text-[11px] tabular-nums">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono text-xs text-foreground">
                          {order.buyerId.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="py-3 px-3 font-display font-bold text-sm tabular-nums">
                        {order.currency} {Number(order.totalAmount).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-foreground font-medium">
                          {order.shipment?.logisticsPartner?.name || "Unassigned"}
                        </div>
                        <div className="text-muted-foreground font-mono text-[10px]">
                          Shipment ID: {order.shipment?.id ? `${order.shipment.id.slice(0, 8)}...` : "None"}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <span>Review</span>
                          <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </RequireAdmin>
  );
}
