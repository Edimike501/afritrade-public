"use client";

import React from "react";
import Link from "next/link";
import { OrderStatus, ORDER_STATUS_LABELS } from "@afritrade/shared";
import { Card } from "@afritrade/ui";
import { ArrowRight, Layers } from "lucide-react";

interface OrderDistributionWidgetProps {
  distribution: Record<string, number>;
}

const LIFECYCLE_STATUSES: { status: OrderStatus; color: string }[] = [
  { status: OrderStatus.ORDER_PLACED, color: "bg-amber-500" },
  { status: OrderStatus.PAYMENT_CONFIRMED, color: "bg-emerald-500" },
  { status: OrderStatus.LOGISTICS_ASSIGNED, color: "bg-blue-500" },
  { status: OrderStatus.PICKED_UP, color: "bg-indigo-500" },
  { status: OrderStatus.IN_TRANSIT, color: "bg-purple-500" },
  { status: OrderStatus.CUSTOMS, color: "bg-teal-500" },
  { status: OrderStatus.DELIVERED, color: "bg-green-600" },
  { status: OrderStatus.CANCELLED, color: "bg-rose-500" },
];

export function OrderDistributionWidget({ distribution }: OrderDistributionWidgetProps) {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  return (
    <Card className="p-6 bg-card border-border space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-primary" />
          <h3 className="font-display font-bold text-base text-foreground">
            Order Fulfillment Lifecycle Pipeline
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-medium text-muted-foreground">
            {total} Total Orders
          </span>
          <Link href="/orders" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            <span>Manage Orders</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Segmented Pipeline Progress Bar */}
      {total > 0 ? (
        <div className="w-full h-3 rounded-full bg-muted/60 overflow-hidden flex">
          {LIFECYCLE_STATUSES.map(({ status, color }) => {
            const count = distribution[status] ?? 0;
            if (count === 0) return null;
            const pct = (count / total) * 100;
            return (
              <div
                key={status}
                className={`${color} transition-all duration-300 relative group`}
                style={{ width: `${pct}%` }}
                title={`${ORDER_STATUS_LABELS[status] || status}: ${count} (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>
      ) : (
        <div className="w-full h-2 rounded-full bg-muted" />
      )}

      {/* Status Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {LIFECYCLE_STATUSES.map(({ status, color }) => {
          const count = distribution[status] ?? 0;
          const pct = total > 0 ? ((count / total) * 100).toFixed(0) : "0";
          return (
            <Link
              key={status}
              href={`/orders?status=${status}`}
              className="p-3 rounded-lg bg-muted/40 border border-border/60 hover:border-primary/40 transition-colors group flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate group-hover:text-primary transition-colors">
                  {ORDER_STATUS_LABELS[status] || status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-display font-extrabold text-xl text-foreground tabular-nums">
                  {count}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {pct}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
