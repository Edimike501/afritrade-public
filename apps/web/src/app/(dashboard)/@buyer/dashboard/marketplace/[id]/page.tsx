"use client";

import { useParams } from "next/navigation";
import { Role } from "@afritrade/shared";
import { RequireRole } from "@afritrade/ui";
import { ProductDetailView } from "@/components/ProductDetailView";

export default function BuyerDashboardProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <RequireRole roles={[Role.BUYER]}>
      <ProductDetailView
        id={id}
        backHref="/dashboard/marketplace"
        isDashboard={true}
      />
    </RequireRole>
  );
}
