"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@afritrade/shared";
import { useAuth } from "@afritrade/ui";
import { MarketplaceCatalog } from "@/components/MarketplaceCatalog";

export default function MarketplacePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // If already authenticated as a buyer, redirect into the buyer dashboard marketplace
  useEffect(() => {
    if (!loading && user?.role === Role.BUYER) {
      router.replace("/dashboard/marketplace");
    }
  }, [user, loading, router]);

  return <MarketplaceCatalog baseHref="/marketplace" isDashboard={false} />;
}
