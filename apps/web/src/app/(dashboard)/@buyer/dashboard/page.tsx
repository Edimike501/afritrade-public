"use client";

import { useState } from "react";
import { Role } from "@afritrade/shared";
import { RequireRole, useAuth, Badge, Button } from "@afritrade/ui";
import { useDashboardSummary, useBuyerOrders } from "@afritrade/hooks";
import { DashboardView } from "@/components/DashboardView";
import { CurrencySelector } from "@/components/CurrencySelector";
import { ProfileModal } from "@/components/ProfileModal";
import { Settings } from "lucide-react";

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 3-Tier Data Fetching Architecture (RULES §19) with live polling
  const { data: summary, isLoading, error } = useDashboardSummary({ refetchInterval: 8000 });
  const { data: orders = [] } = useBuyerOrders({ refetchInterval: 8000 });

  return (
    <RequireRole roles={[Role.BUYER]}>
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome{user ? `, ${user.fullName}` : ""}
              </h1>
              <Badge variant="outline" className="text-xs font-semibold uppercase">
                Buyer
              </Badge>
              {user?.countryCode && (
                <Badge variant="secondary" className="text-xs font-mono font-medium">
                  {user.countryCode}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Wholesale procurement overview, spend metrics, and active orders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsProfileOpen(true)}
              className="gap-2 text-xs"
            >
              <Settings size={15} />
              <span>Profile Settings</span>
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
          onEditProfile={() => setIsProfileOpen(true)}
        />

        {/* Buyer Profile Settings Modal */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      </div>
    </RequireRole>
  );
}
