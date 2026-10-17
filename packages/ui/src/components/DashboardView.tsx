"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  Store,
  Users,
  ShieldCheck,
  Truck,
  ClipboardList,
  Coins,
  ArrowRight,
  Receipt,
  UserCheck,
  Clock,
} from "lucide-react";
import {
  Role,
  KybStatus,
  type DashboardSummaryDto,
  type BuyerDashboardDto,
  type SupplierDashboardDto,
  type AdminDashboardDto,
} from "@afritrade/shared";
import { useDashboardSummary } from "@afritrade/hooks";
import {
  Card,
  Button,
  Badge,
  KybBadge,
  MetricCard,
  SimulatedBadge,
  OrderStatusBadge,
} from "@afritrade/ui";

export type Totals = { currency: string; total: string }[];

export interface DashboardViewProps {
  summary?: DashboardSummaryDto;
  recentOrders?: any[];
  isLoading?: boolean;
  error?: any;
  adminRoutePrefix?: string;
  onEditProfile?: () => void;
}

export function BuyerDashboardView({
  summary,
  recentOrders = [],
  onEditProfile,
}: {
  summary: BuyerDashboardDto;
  recentOrders?: any[];
  onEditProfile?: () => void;
}) {
  const activeOrdersList = recentOrders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED",
  );

  return (
    <div className="space-y-8">
      {/* Simulated Disclosure Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <SimulatedBadge />
          <span className="text-xs text-muted-foreground">
            All wholesale procurement transactions are settled via the Simulated Mock Provider (zero financial liability).
          </span>
        </div>
        {onEditProfile && (
          <Button variant="outline" size="sm" onClick={onEditProfile} className="gap-2 shrink-0">
            <UserCheck size={16} />
            <span>Profile Settings</span>
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          label="Total Orders"
          value={summary.totalOrders}
          icon={<ClipboardList size={22} />}
        />
        <MetricCard
          label="In Flight / Active"
          value={summary.activeOrders}
          icon={<Truck size={22} />}
        />
        <MetricCard
          label="Delivered"
          value={summary.deliveredOrders}
          icon={<Package size={22} />}
        />
        <MetricCard
          label="Settled Spend"
          value={
            summary.spendByCurrency.length > 0 ? (
              <div className="space-y-1 text-lg">
                {summary.spendByCurrency.map((s) => (
                  <div key={s.currency} className="tabular-nums font-bold">
                    {s.currency} {Number(s.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                ))}
              </div>
            ) : (
              "0.00"
            )
          }
          icon={<Coins size={22} />}
        />
      </div>

      {/* Active Orders Highlight */}
      {activeOrdersList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              <span>Active Orders In Transit</span>
            </h2>
            <Link href="/orders">
              <span className="text-xs text-primary hover:underline font-medium">All orders ({summary.totalOrders})</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrdersList.slice(0, 4).map((order) => (
              <Card key={order.id} className="p-4 border-border flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-xs font-mono font-medium text-muted-foreground block">
                      Order #{order.id.slice(0, 8)}
                    </span>
                    <span className="font-semibold text-sm block mt-0.5">
                      {order.items?.map((i: any) => `${i.quantity}x ${i.productName}`).join(", ") || "Procurement Lot"}
                    </span>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {order.currency} {Number(order.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-primary">
                      <span>Track Order</span>
                      <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Overview Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Recent Order History</h2>
          <Link href="/orders">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              <span>View All Orders</span>
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <ClipboardList size={36} className="mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="font-medium text-sm text-foreground">No orders placed yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Browse our cross-border marketplace to source wholesale agricultural and commodity lots across Africa.
            </p>
            <Link href="/marketplace" className="inline-block mt-4">
              <Button size="sm" className="gap-2">
                <Store size={16} />
                <span>Browse Marketplace</span>
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Settlement</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium">#{ord.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-xs">
                      {ord.items?.map((i: any) => `${i.quantity}x ${i.productName}`).join(", ") || "Lot items"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-xs tabular-nums">
                      {ord.currency} {Number(ord.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={ord.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/orders/${ord.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          Details →
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Action Navigation */}
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Link href="/marketplace">
          <Button size="lg" className="gap-2 shadow-xs">
            <Store size={20} />
            <span>Browse Marketplace</span>
          </Button>
        </Link>
        <Link href="/orders">
          <Button variant="outline" size="lg" className="gap-2">
            <ClipboardList size={20} />
            <span>View All Orders</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function SupplierDashboardView({
  summary,
  incomingOrders = [],
}: {
  summary: SupplierDashboardDto;
  incomingOrders?: any[];
}) {
  const isKybApproved = summary.kybStatus === KybStatus.APPROVED;

  return (
    <div className="space-y-8">
      {/* KYB Compliance Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Compliance Verification:</span>
            <KybBadge status={summary.kybStatus} />
          </div>
          {isKybApproved ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hidden sm:inline">
              Verified Exporter. Public marketplace listing enabled.
            </span>
          ) : (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium hidden sm:inline">
              Verification required before wholesale lots can be purchased.
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/business-profile">
            <Button size="sm" variant="outline" className="text-xs shrink-0 gap-1.5">
              <Store size={14} />
              <span>Edit Business Profile</span>
            </Button>
          </Link>
          {!isKybApproved && (
            <Link href="/kyb">
              <Button size="sm" variant="primary" className="text-xs shrink-0">
                Complete KYB Verification →
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Simulated Disclosure Banner */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
        <SimulatedBadge />
        <span>
          Wholesale order settlement is processed through the Simulated Mock Provider (zero actual funds liability).
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          label="Active Product Lots"
          value={summary.activeProducts}
          icon={<Package size={22} />}
        />
        <MetricCard
          label="Incoming Orders"
          value={summary.incomingOrders}
          icon={<Receipt size={22} />}
        />
        <MetricCard
          label="Settled Revenue (Simulated)"
          value={
            summary.revenueByCurrency.length > 0 ? (
              <div className="space-y-1 text-lg">
                {summary.revenueByCurrency.map((r) => (
                  <div key={r.currency} className="tabular-nums font-bold">
                    {r.currency} {Number(r.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                ))}
              </div>
            ) : (
              "0.00"
            )
          }
          icon={<Coins size={22} />}
        />
      </div>

      {/* Incoming Orders Feed (Read-Only per SCOPE.md and AGENTS.md) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Incoming Fulfillment Orders</h2>
            <p className="text-xs text-muted-foreground">
              Wholesale orders placed by cross-border buyers. Order milestones are updated by Admin operations.
            </p>
          </div>
          <Link href="/orders">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              <span>View All Orders</span>
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        {incomingOrders.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <Receipt size={36} className="mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="font-medium text-sm text-foreground">No incoming orders yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Once verified buyers purchase your lots, orders will appear here with live tracking status.
            </p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Settlement</th>
                  <th className="px-4 py-3">Fulfillment Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {incomingOrders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium">#{ord.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-xs">
                      {ord.items?.map((i: any) => `${i.quantity}x ${i.productName}`).join(", ") || "Lot items"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-xs tabular-nums">
                      {ord.currency} {Number(ord.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={ord.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/orders/${ord.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          View Tracking →
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Link href="/products">
          <Button size="lg" className="gap-2 shadow-xs">
            <Package size={20} />
            <span>Manage Product Lots</span>
          </Button>
        </Link>
        <Link href="/products/new">
          <Button variant="outline" size="lg" className="gap-2" disabled={!isKybApproved}>
            <span>Add New Lot</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function AdminDashboardView({ summary }: { summary: AdminDashboardDto }) {
  return (
    <div className="space-y-8">
      {/* Platform Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <MetricCard
          label="Registered Buyers"
          value={summary.usersByRole[Role.BUYER] ?? 0}
          icon={<Users size={22} />}
        />
        <MetricCard
          label="Verified Suppliers"
          value={summary.usersByRole[Role.SUPPLIER] ?? 0}
          icon={<Store size={22} />}
        />
        <MetricCard
          label="Pending KYB Queue"
          value={summary.pendingKyb}
          icon={<ShieldCheck size={22} />}
        />
        <MetricCard
          label="Active Marketplace Lots"
          value={summary.activeProducts}
          icon={<Package size={22} />}
        />
        <MetricCard
          label="Total Orders Handled"
          value={summary.totalOrders}
          icon={<ClipboardList size={22} />}
        />
        <MetricCard
          label="Trade Volume (Simulated)"
          value={
            summary.tradeVolumeByCurrency.length > 0 ? (
              <div className="space-y-1 text-lg">
                {summary.tradeVolumeByCurrency.map((v) => (
                  <div key={v.currency} className="tabular-nums font-bold">
                    {v.currency} {Number(v.total).toLocaleString()}
                  </div>
                ))}
              </div>
            ) : (
              "0.00"
            )
          }
          icon={<Coins size={22} />}
        />
      </div>

      {/* Operational Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/kyb"
          className="p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
              <ShieldCheck size={20} />
            </div>
            {summary.pendingKyb > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                {summary.pendingKyb} Pending
              </span>
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
              KYB Verification Queue
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Review and approve pending supplier compliance documents and business licenses.
            </p>
          </div>
        </Link>

        <Link
          href="/orders"
          className="p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600">
              <ClipboardList size={20} />
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {summary.totalOrders} recorded
            </span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
              Orders Oversight
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Advance order fulfillment milestones, assign freight partners, and inspect payment status.
            </p>
          </div>
        </Link>

        <Link
          href="/logistics"
          className="p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600">
              <Truck size={20} />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
              Logistics Network
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Curate freight forwarders, transit carriers, and cross-border transport routes.
            </p>
          </div>
        </Link>
      </div>

      {/* Orders by Status Pipeline Breakdown */}
      <Card className="p-6 bg-card border-border space-y-4">
        <h3 className="font-display font-bold text-base text-foreground">
          Orders Status Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Object.entries(summary.ordersByStatus).map(([status, count]) => (
            <div key={status} className="p-3 rounded-lg bg-muted/40 border border-border">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block truncate">
                {status.replace(/_/g, " ")}
              </span>
              <span className="font-display font-extrabold text-xl text-foreground tabular-nums">
                {count}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function DashboardView({
  summary: propSummary,
  recentOrders = [],
  isLoading: propLoading,
  error: propError,
  adminRoutePrefix = "",
  onEditProfile,
}: DashboardViewProps) {
  // If summary was provided via props, use it directly (RULES §19 compliant)
  // Otherwise fall back to hook for backwards compatibility
  const hookResult = useDashboardSummary();
  const summary = propSummary || (hookResult.data as unknown as DashboardSummaryDto);
  const isLoading = propLoading !== undefined ? propLoading : hookResult.isLoading;
  const error = propError !== undefined ? propError : hookResult.error;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-xl" />
        ))}
      </div>
    );
  }

  if (error || !summary) {
    return (
      <Card className="p-6 bg-destructive/10 border-destructive/30 text-destructive text-sm">
        {error instanceof Error ? error.message : "Failed to load dashboard metrics."}
      </Card>
    );
  }

  // 1. BUYER DASHBOARD
  if (summary.role === Role.BUYER) {
    return (
      <BuyerDashboardView
        summary={summary as BuyerDashboardDto}
        recentOrders={recentOrders}
        onEditProfile={onEditProfile}
      />
    );
  }

  // 2. SUPPLIER DASHBOARD
  if (summary.role === Role.SUPPLIER) {
    return (
      <SupplierDashboardView
        summary={summary as SupplierDashboardDto}
        incomingOrders={recentOrders}
      />
    );
  }

  // 3. ADMIN PLATFORM OVERVIEW
  return <AdminDashboardView summary={summary as AdminDashboardDto} />;
}
