"use client";

import { useState } from "react";
import Link from "next/link";
import { Role, KybStatus } from "@afritrade/shared";
import { RequireRole, useAuth, Badge, Button } from "@afritrade/ui";
import {
  useDashboardSummary,
  useSupplierOrders,
  useSupplierProducts,
  useMyBusinessProfile,
} from "@afritrade/hooks";
import { DashboardView } from "@/components/DashboardView";
import { CurrencySelector } from "@/components/CurrencySelector";
import { ProfileModal } from "@/components/ProfileModal";
import { Package, ShieldCheck, RefreshCw, Settings } from "lucide-react";

export default function SupplierDashboardPage() {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 3-Tier Data Fetching Architecture (RULES §19) with live polling
  const { data: summary, isLoading, error, refetch: refetchSummary } = useDashboardSummary({ refetchInterval: 8000 });
  const { data: orders = [], refetch: refetchOrders } = useSupplierOrders({ refetchInterval: 8000 });
  const { data: products = [] } = useSupplierProducts({ refetchInterval: 8000 });
  const { data: profile } = useMyBusinessProfile();

  const handleRefresh = () => {
    refetchSummary();
    refetchOrders();
  };

  const isKybApproved = profile?.kybStatus === KybStatus.APPROVED;

  return (
    <RequireRole roles={[Role.SUPPLIER]}>
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Supplier Dashboard{user ? `, ${user.fullName}` : ""}
              </h1>
              <Badge variant="outline" className="text-xs font-semibold uppercase">
                Supplier
              </Badge>
              {user?.countryCode && (
                <Badge variant="secondary" className="text-xs font-mono font-medium">
                  {user.countryCode}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Catalog inventory lots, revenue settlements, and incoming wholesale orders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-1.5 text-xs"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsProfileOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Settings size={14} />
              <span>Profile Settings</span>
            </Button>
            <Button asChild size="sm" className="gap-1.5 text-xs" disabled={!isKybApproved}>
              <Link href="/products/new">
                <Package size={14} />
                <span>Add Product</span>
              </Link>
            </Button>
            <CurrencySelector showLabel={true} size="sm" />
          </div>
        </header>

        {/* Presentational Dashboard View */}
        <DashboardView
          summary={summary}
          recentOrders={orders}
          isLoading={isLoading}
          error={error}
        />

        {/* Supplier Profile Settings Modal */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      </div>
    </RequireRole>
  );
}
