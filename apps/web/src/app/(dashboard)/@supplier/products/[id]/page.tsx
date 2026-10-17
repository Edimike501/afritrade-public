"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Store,
  Calendar,
  Tag,
  Coins,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Role } from "@afritrade/shared";
import {
  useProduct,
  useUpdateProduct,
  useMyBusinessProfile,
} from "@afritrade/hooks";
import {
  RequireRole,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  CorridorBadge,
} from "@afritrade/ui";
import { ProductImage } from "@/components/ProductImage";
import { PriceDisplay } from "@/components/PriceDisplay";

export default function SupplierProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: product, isLoading, error } = useProduct(id);
  const { data: profile } = useMyBusinessProfile();
  const updateProductMutation = useUpdateProduct();
  const [toggleError, setToggleError] = useState<string | null>(null);

  async function handleToggleStatus() {
    if (!product) return;
    setToggleError(null);
    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        input: { isActive: !product.isActive },
      });
    } catch (err: unknown) {
      setToggleError(
        err instanceof Error
          ? err.message
          : "Failed to update listing visibility.",
      );
    }
  }

  return (
    <RequireRole roles={[Role.SUPPLIER]}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Back to My Products</span>
          </Link>
        </nav>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-90 gap-3 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm">Loading product specifications…</p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!isLoading && (error || !product) && (
          <Card className="p-8 border border-destructive/30 bg-destructive/10 text-destructive text-center max-w-lg mx-auto">
            <AlertCircle size={36} className="mx-auto mb-3" />
            <h2 className="text-lg font-bold">Product Listing Not Found</h2>
            <p className="text-xs mt-1 mb-5">
              {error instanceof Error
                ? error.message
                : "The requested product listing could not be loaded."}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/products">Return to My Products</Link>
            </Button>
          </Card>
        )}

        {/* Product Detail Content */}
        {!isLoading && product && (
          <>
            {toggleError && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-destructive text-sm flex items-center gap-2.5"
              >
                <AlertCircle size={18} className="shrink-0" />
                <span>{toggleError}</span>
              </div>
            )}

            {/* Header Bar */}
            <Card className="p-6 border border-border shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      SKU #{product.id.slice(0, 8).toUpperCase()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                    {(product.businessProfile?.country?.isoCode ||
                      product.supplier?.countryCode) && (
                      <CorridorBadge
                        country={
                          product.businessProfile?.country?.isoCode ||
                          product.supplier?.countryCode ||
                          ""
                        }
                      />
                    )}
                    {product.isActive ? (
                      <Badge
                        variant="success"
                        className="text-xs flex items-center gap-1"
                      >
                        <CheckCircle2 size={12} />
                        <span>Active on Marketplace</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-xs flex items-center gap-1"
                      >
                        <XCircle size={12} />
                        <span>Inactive (Hidden)</span>
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {product.name}
                  </h1>

                  <p className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                    <Store size={15} className="text-primary shrink-0" />
                    <span>
                      Listed by{" "}
                      <strong className="text-foreground">
                        {profile?.businessName ||
                          product.businessProfile?.businessName ||
                          product.supplier?.businessName ||
                          "Verified Supplier"}
                      </strong>
                    </span>
                    {product.createdAt && (
                      <>
                        <span>•</span>
                        <span>
                          Added{" "}
                          {new Date(product.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                {/* Primary Supplier Controls */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    <Link href={`/marketplace/${product.id}`} target="_blank">
                      <ExternalLink size={15} />
                      <span>Marketplace View</span>
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={updateProductMutation.isPending}
                    className="gap-1.5 min-w-32.5"
                  >
                    {updateProductMutation.isPending ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Updating…</span>
                      </>
                    ) : product.isActive ? (
                      <>
                        <XCircle size={14} />
                        <span>Deactivate Listing</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Activate Listing</span>
                      </>
                    )}
                  </Button>

                  <Button asChild size="sm" className="gap-1.5">
                    <Link href={`/products/${product.id}/edit`}>
                      <Pencil size={15} />
                      <span>Edit Listing</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Main Two-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Image & Commodity Specifications */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="overflow-hidden border border-border shadow-sm">
                  <div className="aspect-video w-full bg-muted/40 relative overflow-hidden flex items-center justify-center">
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.name}
                      size="lg"
                      className="mb-0! h-full! rounded-none!"
                      priority
                    />
                  </div>

                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-2.5">
                      <h2 className="text-lg font-bold tracking-tight text-foreground">
                        Commodity Specifications &amp; Packaging
                      </h2>
                      <p className="text-sm sm:text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                        {product.description}
                      </p>
                    </div>

                    <div className="border-t border-border pt-5 space-y-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                        Wholesale Pricing &amp; Settlement Currency
                      </span>
                      <PriceDisplay
                        amount={product.price}
                        currency={
                          product.currencyCode ||
                          product.currency?.code ||
                          "USD"
                        }
                        size="lg"
                      />
                      <p className="text-xs text-muted-foreground">
                        Buyers settle orders in your listed currency (
                        {product.currencyCode ||
                          product.currency?.code ||
                          "USD"}
                        ). Indicative conversions are shown automatically to
                        cross-border buyers.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Listing Summary & Management */}
              <div className="space-y-6">
                <Card className="border border-border shadow-sm">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <CardTitle className="text-base font-bold">
                      Listing Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Tag size={14} className="text-primary" />
                        <span>Category</span>
                      </span>
                      <span className="font-semibold text-foreground">
                        {product.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Coins size={14} className="text-primary" />
                        <span>Unit Price</span>
                      </span>
                      <span className="font-mono font-bold text-sm text-foreground tabular-nums">
                        {product.currencyCode ||
                          product.currency?.code ||
                          "USD"}{" "}
                        {Number(product.price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-primary" />
                        <span>Marketplace Status</span>
                      </span>
                      <span className="font-semibold text-foreground">
                        {product.isActive
                          ? "Active (Visible)"
                          : "Inactive (Hidden)"}
                      </span>
                    </div>

                    {product.createdAt && (
                      <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Calendar size={14} className="text-primary" />
                          <span>Date Created</span>
                        </span>
                        <span className="font-medium text-foreground tabular-nums">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 space-y-2.5">
                      <Button asChild className="w-full gap-2" size="sm">
                        <Link href={`/products/${product.id}/edit`}>
                          <Pencil size={15} />
                          <span>Edit Product Details</span>
                        </Link>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleToggleStatus}
                        disabled={updateProductMutation.isPending}
                      >
                        {product.isActive
                          ? "Hide from Marketplace"
                          : "Publish to Marketplace"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </RequireRole>
  );
}
