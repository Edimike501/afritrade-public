"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Search,
  Eye,
  Pencil,
  Package,
} from "lucide-react";
import { Role, PRODUCT_CATEGORIES } from "@afritrade/shared";
import {
  useSupplierProducts,
  useUpdateProduct,
  useMyBusinessProfile,
} from "@afritrade/hooks";
import {
  RequireRole,
  Card,
  CardContent,
  Badge,
  Button,
  EmptyState,
} from "@afritrade/ui";
import { ProductImage } from "@/components/ProductImage";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export default function SupplierProductsPage() {
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useSupplierProducts();
  const { data: profile } = useMyBusinessProfile();
  const updateProductMutation = useUpdateProduct();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const isKybApproved = profile?.kybStatus === "APPROVED";

  const counts = useMemo(() => {
    const active = products.filter((p) => p.isActive).length;
    return {
      all: products.length,
      active,
      inactive: products.length - active,
    };
  }, [products]);

  const categories = useMemo(() => {
    const dynamicCategories = products
      .map((p) => p.category)
      .filter((c): c is string => Boolean(c));
    return Array.from(new Set([...PRODUCT_CATEGORIES, ...dynamicCategories]));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (statusFilter === "ACTIVE" && !product.isActive) return false;
      if (statusFilter === "INACTIVE" && product.isActive) return false;
      if (categoryFilter !== "ALL" && product.category !== categoryFilter)
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        const matchesId = product.id.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCategory && !matchesId) {
          return false;
        }
      }
      return true;
    });
  }, [products, statusFilter, categoryFilter, searchQuery]);

  async function handleToggleStatus(productId: string, currentStatus: boolean) {
    setTogglingId(productId);
    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        input: { isActive: !currentStatus },
      });
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <RequireRole roles={[Role.SUPPLIER]}>
      <div className="space-y-6">
        {/* Top KYB Warning if not approved */}
        {!isKybApproved && profile && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldAlert
                size={22}
                className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400"
              />
              <div>
                <p className="font-semibold text-sm">
                  KYB Verification Required
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your business profile status is currently{" "}
                  <strong>{profile.kybStatus}</strong>. Products cannot be
                  listed publicly until verified.
                </p>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-amber-500/40 shrink-0"
            >
              <Link href="/kyb">Complete Verification →</Link>
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                My Products
              </h1>
              {isKybApproved && (
                <Badge
                  variant="success"
                  className="text-xs flex items-center gap-1"
                >
                  <ShieldCheck size={13} />
                  <span>KYB Verified — Live on Marketplace</span>
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your commodity listings, pricing terms, and inventory
              availability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-1.5"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </Button>

            {isKybApproved ? (
              <Button asChild size="sm" className="gap-1.5">
                <Link href="/products/new">
                  <Plus size={16} />
                  <span>Add Product</span>
                </Link>
              </Button>
            ) : (
              <Button size="sm" className="gap-1.5" disabled>
                <Plus size={16} />
                <span>Add Product</span>
              </Button>
            )}
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        {!isLoading && !error && products.length > 0 && (
          <Card className="p-4 border border-border shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Status Filter Tabs */}
              <div
                className="flex flex-wrap items-center gap-2"
                role="tablist"
                aria-label="Filter products by status"
              >
                {[
                  { id: "ALL" as const, label: `All Listings (${counts.all})` },
                  { id: "ACTIVE" as const, label: `Active (${counts.active})` },
                  {
                    id: "INACTIVE" as const,
                    label: `Inactive (${counts.inactive})`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors min-h-9 ${
                      statusFilter === tab.id
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search & Category Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <label htmlFor="supplier-category-filter" className="sr-only">
                    Filter by Category
                  </label>
                  <select
                    id="supplier-category-filter"
                    name="categoryFilter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative w-full sm:w-64">
                  <label htmlFor="supplier-product-search" className="sr-only">
                    Search products
                  </label>
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <input
                    id="supplier-product-search"
                    name="search"
                    type="search"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    placeholder="Search by title, category, or ID…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Loading / Error states */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm mt-3">Loading product inventory…</p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive flex items-center gap-3"
          >
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm">
              Failed to load products:{" "}
              {error instanceof Error ? error.message : "Network error"}
            </p>
          </div>
        )}

        {/* Products list / Empty state */}
        {!isLoading && !error && products.length === 0 && (
          <EmptyState
            title="No product listings yet"
            description="You haven't listed any wholesale products. Add your first commodity to start receiving orders across Nigeria, South Africa, and Ghana."
            action={
              isKybApproved ? (
                <Button asChild size="sm">
                  <Link href="/products/new">+ Add Product Listing</Link>
                </Button>
              ) : (
                <Button size="sm" disabled>
                  + Add Product Listing
                </Button>
              )
            }
          />
        )}

        {!isLoading &&
          !error &&
          products.length > 0 &&
          filteredProducts.length === 0 && (
            <EmptyState
              title="No matching products"
              description="No product listings match your current search or filter selection."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setCategoryFilter("ALL");
                    setSearchQuery("");
                  }}
                >
                  Reset Filters
                </Button>
              }
            />
          )}

        {!isLoading && !error && filteredProducts.length > 0 && (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const currency =
                product.currencyCode || product.currency?.code || "USD";
              const isToggling = togglingId === product.id;

              return (
                <Card
                  key={product.id}
                  className="overflow-hidden border border-border hover:border-primary/40 transition-colors shadow-sm"
                >
                  <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div className="flex flex-col sm:flex-row items-start gap-4 max-w-2xl min-w-0">
                      {/* Thumbnail */}
                      <Link
                        href={`/products/${product.id}`}
                        className="w-full sm:w-24 h-36 sm:h-24 rounded-lg overflow-hidden border border-border bg-muted/40 shrink-0 relative block group"
                        aria-label={`View ${product.name}`}
                      >
                        <ProductImage
                          src={product.imageUrl}
                          alt={product.name}
                          size="sm"
                          className="mb-0! h-full! rounded-none!"
                        />
                      </Link>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                            #{product.id.slice(0, 8).toUpperCase()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                          {product.isActive ? (
                            <Badge
                              variant="success"
                              className="text-xs flex items-center gap-1"
                            >
                              <CheckCircle2 size={12} />
                              <span>Active</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-xs flex items-center gap-1"
                            >
                              <XCircle size={12} />
                              <span>Inactive</span>
                            </Badge>
                          )}
                        </div>

                        <Link
                          href={`/products/${product.id}`}
                          className="block group"
                        >
                          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {product.name}
                          </h3>
                        </Link>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/50">
                      <div className="sm:text-right">
                        <span className="text-[11px] text-muted-foreground block uppercase font-medium tracking-wider">
                          Unit Price
                        </span>
                        <span className="font-mono text-base font-bold text-foreground tabular-nums">
                          {currency}{" "}
                          {Number(product.price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                        >
                          <Link href={`/products/${product.id}`}>
                            <Eye size={14} />
                            <span>View</span>
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                        >
                          <Link href={`/products/${product.id}/edit`}>
                            <Pencil size={14} />
                            <span>Edit</span>
                          </Link>
                        </Button>

                        <Button
                          variant={product.isActive ? "outline" : "default"}
                          size="sm"
                          onClick={() =>
                            handleToggleStatus(product.id, product.isActive)
                          }
                          disabled={isToggling}
                          className="min-w-24"
                        >
                          {isToggling ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : product.isActive ? (
                            "Deactivate"
                          ) : (
                            "Activate"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </RequireRole>
  );
}
