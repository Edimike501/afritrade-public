"use client";

import React from "react";
import { RequireAdmin, DashboardView } from "@afritrade/ui";
import { useDashboardSummary } from "@afritrade/hooks";
import { Role, type AdminDashboardDto } from "@afritrade/shared";
import { Home } from "lucide-react";
import { OrderDistributionWidget } from "../components/OrderDistributionWidget";

export default function AdminDashboardPage() {
  const { data: summary, isLoading, error } = useDashboardSummary({ refetchInterval: 8000 });
  const adminSummary = summary?.role === Role.ADMIN ? (summary as AdminDashboardDto) : null;

  return (
    <RequireAdmin>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border text-xs font-semibold mb-2">
              <Home size={14} className="text-primary" />
              <span>Operations Control Tower</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground">
              Platform Overview
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Live operational metrics, trade volume, regional compliance, and order oversight.
            </p>
          </div>
        </div>

        {/* Primary Dashboard Metrics View */}
        <DashboardView
          summary={summary as any}
          isLoading={isLoading}
          error={error}
        />

        {/* Order Lifecycle Pipeline Widget */}
        {adminSummary && (
          <OrderDistributionWidget distribution={adminSummary.ordersByStatus} />
        )}
      </div>
    </RequireAdmin>
  );
}
