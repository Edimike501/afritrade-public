"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Truck, Coins, Store, Pencil } from "lucide-react";
import { Role } from "@afritrade/shared";
import { useProduct } from "@afritrade/hooks";
import { OrderForm } from "@/components/OrderForm";
import { PriceDisplay } from "@/components/PriceDisplay";
import { ProductImage } from "@/components/ProductImage";
import { ProductJsonLd } from "@/components/seo/JsonLd";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  CorridorBadge,
  useAuth,
} from "@afritrade/ui";

export interface ProductDetailViewProps {
  id: string;
  backHref?: string;
  isDashboard?: boolean;
}

export function ProductDetailView({
  id,
  backHref = "/marketplace",
  isDashboard = false,
}: ProductDetailViewProps) {
  const { user } = useAuth();
  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading) {
    return (
      <div className={isDashboard ? "space-y-6" : "container max-w-7xl mx-auto px-4 sm:px-6 py-10"}>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm">Loading commodity specifications…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={isDashboard ? "space-y-6" : "container max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6"}>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Marketplace</span>
        </Link>
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-destructive text-center">
          <p className="font-semibold">Product Not Available</p>
          <p className="text-sm mt-1">
            {error instanceof Error
              ? error.message
              : "The requested listing could not be found or has been deactivated."}
          </p>
        </div>
      </div>
    );
  }

  const currency =
    product.currencyCode ??
    product.currency?.code ??
    (typeof (product as any).currency === "string"
      ? (product as any).currency
      : "USD");

  const supplierName =
    product.supplier?.businessName ??
    product.businessProfile?.businessName ??
    "Verified Supplier";

  const countryName =
    product.supplier?.countryName ??
    product.businessProfile?.country?.name ??
    product.businessProfile?.country?.isoCode ??
    "";

  const countryCode =
    product.businessProfile?.country?.isoCode ??
    product.supplier?.countryCode ??
    "";

  return (
    <div className={isDashboard ? "space-y-8" : "container max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8"}>
      <ProductJsonLd
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          currency,
          supplierName,
          countryName,
          category: product.category,
        }}
      />

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Back to Marketplace Catalog</span>
        </Link>

        {user?.role === Role.SUPPLIER && (
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href={`/products/${product.id}`}>
                <span>Supplier View</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link href={`/products/${product.id}/edit`}>
                <Pencil size={14} />
                <span>Edit Listing</span>
              </Link>
            </Button>
          </div>
        )}
      </nav>

      {/* Header Info */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
            {product.category}
          </Badge>
          {countryCode ? (
            <CorridorBadge country={countryCode} />
          ) : countryName ? (
            <Badge variant="secondary" className="text-xs">
              {countryName}
            </Badge>
          ) : null}
          <Badge variant="success" className="text-xs flex items-center gap-1">
            <ShieldCheck size={14} />
            <span>Verified KYB Exporter</span>
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {product.name}
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground flex items-center gap-2">
          <Store size={18} className="text-primary shrink-0" />
          <span>
            Supplied by{" "}
            <strong className="text-foreground font-semibold">
              {supplierName}
            </strong>
            {countryName ? ` · ${countryName}` : ""}
          </span>
        </p>
      </header>

      {/* Product Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Product Specs & Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border border-border shadow-xs">
            <div className="aspect-[16/9] w-full bg-muted/40 relative overflow-hidden flex items-center justify-center">
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                size="lg"
                className="!mb-0 !h-full !rounded-none"
                priority
              />
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-3">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Commodity Specifications
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              <div className="border-t border-border pt-6 space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Settlement & Pricing Terms
                </span>
                <div>
                  <PriceDisplay
                    amount={product.price}
                    currency={currency}
                    size="lg"
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-normal">
                  * In compliance with AfCFTA cross-border regulations, wholesale
                  settlement occurs in the supplier&apos;s authorized currency (
                  {currency}). Multi-currency conversions are indicative and
                  updated automatically.
                </p>
              </div>

              {/* Guarantees Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-muted/30 border border-border/50">
                  <Truck size={22} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">
                      Curated Logistics
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Handled by pre-approved freight operators with end-to-end
                      milestone tracking.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-muted/30 border border-border/50">
                  <Coins size={22} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">
                      Simulated Settlement
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Zero-risk transaction demonstration with instant escrow state
                      advancement.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Placement Card */}
        <div className="space-y-6">
          <Card className="border border-border shadow-xs sticky top-24">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">
                Initiate Purchase Order
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Single-step wholesale order creation with simulated
                multi-currency payment settlement.
              </p>
            </CardHeader>
            <CardContent>
              <OrderForm
                productId={product.id}
                unitPrice={product.price}
                currency={currency}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
