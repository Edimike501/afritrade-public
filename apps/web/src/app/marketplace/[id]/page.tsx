"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Role } from "@afritrade/shared";
import { useAuth } from "@afritrade/ui";
import { ProductDetailView } from "@/components/ProductDetailView";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role === Role.BUYER && id) {
      router.replace(`/dashboard/marketplace/${id}`);
    }
  }, [user, loading, id, router]);

  return <ProductDetailView id={id} backHref="/marketplace" isDashboard={false} />;
}
