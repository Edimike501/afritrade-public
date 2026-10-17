import React from "react";
import Link from "next/link";
import { BrandLogo } from "@afritrade/ui";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-8 border-b border-border mb-8 gap-6">
          <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
            <BrandLogo size={32} showText={true} />
          </Link>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
            Cross-border intra-African B2B wholesale commerce across Nigeria, South Africa, and Ghana under AfCFTA.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-display font-bold text-sm text-foreground mb-3">For Buyers</h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link href="/marketplace" className="hover:text-primary transition-colors">
                  Browse Marketplace
                </Link>
              </li>
              <li>
                <Link href="/register?role=BUYER" className="hover:text-primary transition-colors">
                  Buyer Registration
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-primary transition-colors">
                  Order Tracking
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm text-foreground mb-3">For Suppliers</h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link href="/register?role=SUPPLIER" className="hover:text-primary transition-colors">
                  Join as a Supplier
                </Link>
              </li>
              <li>
                <Link href="/kyb" className="hover:text-primary transition-colors">
                  KYB Verification
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-primary transition-colors">
                  Publish Catalog Listings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm text-foreground mb-3">Regional Hubs</h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link href="/marketplace?country=NG" className="hover:text-primary transition-colors">
                  Nigeria Hub (NGN)
                </Link>
              </li>
              <li>
                <Link href="/marketplace?country=ZA" className="hover:text-primary transition-colors">
                  South Africa Hub (ZAR)
                </Link>
              </li>
              <li>
                <Link href="/marketplace?country=GH" className="hover:text-primary transition-colors">
                  Ghana Hub (GHS)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm text-foreground mb-3">Trust & Safety</h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <span className="text-foreground font-medium">Manual KYB Checks</span>
              </li>
              <li>
                <span className="text-foreground font-medium">Curated Regional Freight</span>
              </li>
              <li>
                <span className="text-foreground font-medium">Multi-Currency Settlement</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>{siteConfig.footer}</p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground border border-border text-[11px]">
            <span className="w-2 h-2 rounded-full bg-accent inline-block"></span>
            <span>{siteConfig.demoNotice}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
