"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Card, PriceDisplay, CorridorBadge, Badge } from "@afritrade/ui";
import { useBuyerCurrency } from "@/context/CurrencyContext";
import { ProductImage } from "@/components/ProductImage";
import type { ProductDto } from "@/lib/types";

export interface ProductCardProps {
  product: ProductDto;
  viewMode?: "grid" | "list";
  baseHref?: string;
}

export function ProductCard({
  product,
  viewMode = "grid",
  baseHref = "/marketplace",
}: ProductCardProps) {
  const { buyerCurrency } = useBuyerCurrency();
  const productHref = `${baseHref}/${product.id}`;

  const currency =
    product.currencyCode ??
    product.currency?.code ??
    (typeof (product as any).currency === "string" ? (product as any).currency : "USD");

  const supplierName =
    product.supplier?.businessName ??
    product.businessProfile?.businessName ??
    "Verified Exporter";

  const countryCode =
    product.supplier?.countryCode ??
    product.businessProfile?.country?.isoCode ??
    "NG";

  const countryName =
    product.supplier?.countryName ??
    product.businessProfile?.country?.name ??
    countryCode;

  if (viewMode === "list") {
    return (
      <Card className="p-4 bg-card border-border hover:border-primary/50 transition-all shadow-xs group">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href={productHref}
              className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-border block"
            >
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                size="sm"
                className="!mb-0 !h-full !w-full !rounded-none"
              />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Link
                  href={`/marketplace/${product.id}`}
                  className="font-display font-bold text-base text-foreground hover:text-primary transition-colors truncate"
                >
                  {product.name}
                </Link>
                <CorridorBadge country={countryCode} />
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-primary/20 shrink-0">
                  <ShieldCheck size={12} />
                  <span>Verified</span>
                </span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                  {product.category}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 truncate">
                  <Building2 size={14} />
                  <span>{supplierName}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{countryName}</span>
                </span>
                <span>•</span>
                <span>MOQ: 1 unit</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
            <PriceDisplay
              amount={product.price}
              currency={currency}
              preferredCurrency={buyerCurrency}
              size="md"
            />
            <Link
              href={productHref}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs min-h-[44px]"
            >
              <span>View Details</span>
              <ArrowRight size={14} className="ml-1.5" />
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // Grid Card Mode
  return (
    <Card className="flex flex-col justify-between p-5 bg-card border-border hover:border-primary/60 transition-all shadow-xs group">
      <div>
        {/* Card Header & Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <CorridorBadge country={countryCode} />
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-primary/20 shrink-0">
              <ShieldCheck size={12} />
              <span>Verified</span>
            </span>
            <Badge variant="outline" className="text-[10px] py-0.5 px-2">
              {product.category}
            </Badge>
          </div>
        </div>

        {/* Product Thumbnail / Placeholder */}
        <Link href={productHref} className="block mb-4">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            size="sm"
            className="!mb-0 !h-36 rounded-lg border border-border"
          />
        </Link>

        {/* Title */}
        <Link href={productHref} className="block">
          <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1.5">
            {product.name}
          </h3>
        </Link>

        {/* Supplier & Location Meta */}
        <div className="space-y-1 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <Building2 size={14} className="shrink-0 text-muted-foreground" />
            <span className="truncate">{supplierName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="shrink-0 text-muted-foreground" />
            <span className="truncate">{countryName}</span>
          </div>
          <div className="text-[11px] font-medium text-foreground/80 pt-0.5">
            Min Order: 1 unit
          </div>
        </div>
      </div>

      {/* Footer / Dual Price & Action */}
      <div className="pt-3.5 border-t border-border flex items-end justify-between gap-2">
        <PriceDisplay
          amount={product.price}
          currency={currency}
          preferredCurrency={buyerCurrency}
          size="sm"
        />
        <Link
          href={productHref}
          className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:bg-primary/10 transition-colors min-w-[44px] min-h-[44px]"
          aria-label={`View details for ${product.name}`}
          title="View Details"
        >
          <ArrowRight size={20} />
        </Link>
      </div>
    </Card>
  );
}
