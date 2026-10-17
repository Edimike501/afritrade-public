"use client";

import { useState } from "react";
import { Search, ArrowLeft, ArrowRight, X } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@afritrade/shared";
import { useProducts, useCountries } from "@afritrade/hooks";
import { ProductCard } from "@/components/ProductCard";
import {
  Button,
  Input,
  ViewModeToggle,
  EmptyState,
  Badge,
  Card,
  Dropdown,
} from "@afritrade/ui";

const PAGE_SIZE = 12;

export interface MarketplaceCatalogProps {
  baseHref?: string;
  isDashboard?: boolean;
}

export function MarketplaceCatalog({
  baseHref = "/marketplace",
  isDashboard = false,
}: MarketplaceCatalogProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: countries } = useCountries();
  const { data, isLoading, error } = useProducts({
    page,
    limit: PAGE_SIZE,
    q: search.trim() || undefined,
    category: category || undefined,
    country: country || undefined,
  });

  const products = data?.items ?? (Array.isArray(data) ? data : []);
  const total = (data as any)?.total ?? products.length;
  const totalPages =
    (data as any)?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setCountry("");
    setPage(1);
  };

  const countryFilterOptions = [
    { value: "", label: "All Countries" },
    ...(countries || [
      { isoCode: "NG", name: "Nigeria" },
      { isoCode: "ZA", name: "South Africa" },
      { isoCode: "GH", name: "Ghana" },
    ]).map((c) => ({
      value: c.isoCode,
      label: `${c.name} (${c.isoCode})`,
    })),
  ];

  const categoryFilterOptions = [
    { value: "", label: "All Categories" },
    ...PRODUCT_CATEGORIES.map((cat) => ({
      value: cat,
      label: cat,
    })),
  ];

  return (
    <div className={isDashboard ? "space-y-6" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"}>
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-border text-xs font-semibold mb-2.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Nigeria · South Africa · Ghana Wholesale Network</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight">
            Wholesale Marketplace
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl leading-relaxed">
            Discover verified agricultural commodities and commercial goods priced in direct supplier currencies with indicative local estimates.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-3">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 sm:p-5 bg-card border-border shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div className="md:col-span-6">
            <Input
              id="search-input"
              type="text"
              placeholder="Search commodities (e.g. Yellow Maize, Cashew, Sesame)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search size={18} />}
            />
          </div>

          <div className="md:col-span-3">
            <Dropdown
              id="country-filter"
              value={country}
              onChange={(val) => {
                setCountry(val);
                setPage(1);
              }}
              options={countryFilterOptions}
              fullWidth={true}
              placeholder="Filter by Country"
            />
          </div>

          <div className="md:col-span-3">
            <Dropdown
              id="category-filter"
              value={category}
              onChange={(val) => {
                setCategory(val);
                setPage(1);
              }}
              options={categoryFilterOptions}
              fullWidth={true}
              placeholder="Filter by Category"
            />
          </div>
        </div>

        {/* Quick Country Filter Chips */}
        <div className="mt-4 pt-3.5 border-t border-border flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap mr-1">
            Country:
          </span>
          <button
            type="button"
            onClick={() => {
              setCountry("");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 border ${
              !country
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
            }`}
          >
            All Countries
          </button>
          <button
            type="button"
            onClick={() => {
              setCountry("NG");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 border ${
              country === "NG"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
            }`}
          >
            🇳🇬 Nigeria (NG)
          </button>
          <button
            type="button"
            onClick={() => {
              setCountry("ZA");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 border ${
              country === "ZA"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
            }`}
          >
            🇿🇦 South Africa (ZA)
          </button>
          <button
            type="button"
            onClick={() => {
              setCountry("GH");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 border ${
              country === "GH"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
            }`}
          >
            🇬🇭 Ghana (GH)
          </button>
        </div>

        {/* Active Filter Chips & Reset */}
        {(search || category || country) && (
          <div className="mt-4 pt-3.5 border-t border-border flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-muted-foreground font-semibold">
                Active Filters:
              </span>
              {search && (
                <Badge variant="outline" className="gap-1.5 py-1">
                  <span>Keyword: &quot;{search}&quot;</span>
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="hover:text-destructive"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              )}
              {country && (
                <Badge variant="outline" className="gap-1.5 py-1">
                  <span>Country: {country}</span>
                  <button
                    type="button"
                    onClick={() => setCountry("")}
                    className="hover:text-destructive"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              )}
              {category && (
                <Badge variant="outline" className="gap-1.5 py-1">
                  <span>Category: {category}</span>
                  <button
                    type="button"
                    onClick={() => setCategory("")}
                    className="hover:text-destructive"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              )}
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-primary font-bold hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">
          Showing {products.length} of {total} verified wholesale lots
        </span>
        <span>
          Page {page} of {totalPages}
        </span>
      </div>

      {/* Products Presentation */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-72 animate-pulse bg-muted/40 p-4" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No commodities found"
          description="No commodities found matching the selected corridor and category filters. Try expanding your search or clearing active filters."
          action={
            <Button variant="outline" size="sm" onClick={handleReset}>
              Clear Active Filters
            </Button>
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode="grid"
              baseHref={baseHref}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3.5">
          {products.map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode="list"
              baseHref={baseHref}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="gap-1"
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </Button>

          <span className="text-xs font-semibold text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="gap-1"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
