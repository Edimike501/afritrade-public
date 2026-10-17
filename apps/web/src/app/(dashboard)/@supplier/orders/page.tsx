"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Truck,
  ArrowRight,
  RefreshCw,
  Search,
  AlertCircle,
} from "lucide-react";
import { Role, type OrderStatus } from "@afritrade/shared";
import { useSupplierOrders } from "@afritrade/hooks";
import {
  RequireRole,
  Card,
  CardContent,
  CardHeader,
  Badge,
  Button,
  EmptyState,
} from "@afritrade/ui";

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case "PAYMENT_CONFIRMED":
    case "DELIVERED":
      return <Badge variant="success">{status.replace(/_/g, " ")}</Badge>;
    case "ORDER_PLACED":
    case "PAYMENT_PENDING":
      return <Badge variant="warning">{status.replace(/_/g, " ")}</Badge>;
    case "LOGISTICS_ASSIGNED":
    case "PICKED_UP":
    case "IN_TRANSIT":
    case "CUSTOMS":
      return <Badge variant="default">{status.replace(/_/g, " ")}</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">{status.replace(/_/g, " ")}</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

export default function SupplierOrdersPage() {
  const { data: orders = [], isLoading, error, refetch } = useSupplierOrders();
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filteredOrders = orders.filter((order) => {
    if (filter === "PENDING" && order.status !== "ORDER_PLACED" && order.status !== "PAYMENT_PENDING") return false;
    if (filter === "CONFIRMED" && order.status !== "PAYMENT_CONFIRMED") return false;
    if (filter === "IN_TRANSIT" && order.status !== "IN_TRANSIT" && order.status !== "PICKED_UP" && order.status !== "CUSTOMS") return false;
    if (filter === "DELIVERED" && order.status !== "DELIVERED") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchItem = order.items.some((item) => item.productName.toLowerCase().includes(q));
      if (!matchId && !matchItem) return false;
    }
    return true;
  });

  return (
    <RequireRole roles={[Role.SUPPLIER]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Incoming Orders
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Wholesale procurement orders placed by cross-border buyers. Read-only status tracking in MVP.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 self-start sm:self-center"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "ALL", label: "All Orders" },
              { id: "PENDING", label: "Pending" },
              { id: "CONFIRMED", label: "Paid / Confirmed" },
              { id: "IN_TRANSIT", label: "In Transit" },
              { id: "DELIVERED", label: "Delivered" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search by ID or item…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm mt-3">Loading incoming orders…</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm">
              Failed to load incoming orders: {error instanceof Error ? error.message : "Network error"}
            </p>
          </div>
        )}

        {/* Orders List / Empty State */}
        {!isLoading && !error && filteredOrders.length === 0 && (
          <EmptyState
            title="No incoming orders found"
            description={
              search || filter !== "ALL"
                ? "No orders match your filter criteria."
                : "You have not received any wholesale purchase orders yet. Ensure your products are active and priced attractively."
            }
            action={
              <Button asChild size="sm">
                <Link href="/products">View My Products</Link>
              </Button>
            }
          />
        )}

        {!isLoading && !error && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="overflow-hidden border border-border hover:border-primary/40 transition-colors shadow-sm"
              >
                <CardHeader className="bg-muted/20 border-b border-border/60 py-3.5 px-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Received {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="font-mono text-sm font-bold text-foreground">
                      {order.currency} {Number(order.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-muted/40 border border-border text-xs"
                        >
                          <span className="font-medium text-foreground">{item.productName}</span>
                          <span className="text-muted-foreground">× {item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {order.shipment?.logisticsPartner && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                        <Truck size={14} className="text-primary" />
                        <span>Carrier: <strong>{order.shipment.logisticsPartner.name}</strong></span>
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <Button asChild variant="outline" size="sm" className="gap-1.5 w-full sm:w-auto">
                      <Link href={`/orders/${order.id}`}>
                        <span>View Order Details</span>
                        <ArrowRight size={14} />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  );
}
