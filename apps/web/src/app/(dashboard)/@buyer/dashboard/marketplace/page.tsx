"use client";

import { Role } from "@afritrade/shared";
import { RequireRole } from "@afritrade/ui";
import { MarketplaceCatalog } from "@/components/MarketplaceCatalog";

export default function BuyerDashboardMarketplacePage() {
  return (
    <RequireRole roles={[Role.BUYER]}>
      <MarketplaceCatalog
        baseHref="/dashboard/marketplace"
        isDashboard={true}
      />
    </RequireRole>
  );
}
