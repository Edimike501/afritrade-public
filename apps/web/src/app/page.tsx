import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  ArrowRight,
  DollarSign,
  Store,
  Users,
  MapPin,
  BadgeCheck,
  Package,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button, Card, Badge, CorridorBadge, SimulatedBadge } from "@afritrade/ui";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Simulation Notice Banner */}
      <div className="bg-primary/10 border-b border-primary/20 py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs sm:text-sm text-foreground">
          <SimulatedBadge />
          <span className="text-muted-foreground hidden sm:inline">•</span>
          <span className="text-muted-foreground">
            {siteConfig.demoNotice}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 border-b border-border bg-gradient-to-b from-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Value Proposition */}
            <div className="lg:col-span-7 flex flex-col items-start">
              {/* Regional Corridor Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-border mb-6 shadow-xs">
                <CheckCircle2 size={16} className="text-primary" />
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  Trade Across Nigeria · South Africa · Ghana
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-6">
                Buy and Sell Wholesale Across Africa with Confidence
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">
                Connect directly with verified suppliers in Nigeria, South Africa, and Ghana. See authoritative prices in supplier currencies with clear local estimates and end-to-end freight tracking under AfCFTA.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <Button asChild size="lg" className="w-full sm:w-auto shadow-sm gap-2">
                  <Link href="/marketplace">
                    <Store size={20} />
                    <span>Browse Products</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  <Link href="/register?role=SUPPLIER">
                    <Users size={20} />
                    <span>Join as a Supplier</span>
                  </Link>
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <BadgeCheck size={16} className="text-primary" />
                  <span>Verified KYB Exporters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck size={16} className="text-primary" />
                  <span>Curated Regional Freight</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Sample Cards */}
            <div className="lg:col-span-5 w-full">
              <Card className="p-6 bg-card border-border shadow-md">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans">
                    Live Verified Commodities
                  </span>
                  <Badge variant="outline" className="text-[11px] gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                    <span>Ready for Dispatch</span>
                  </Badge>
                </div>

                <div className="space-y-3.5">
                  {/* Sample Product 1 */}
                  <Link href="/marketplace" className="block group">
                    <div className="p-3.5 rounded-lg border border-border/80 bg-background hover:border-primary/60 transition-colors">
                      <div className="flex gap-3.5 items-center">
                        <div className="w-16 h-16 rounded-md bg-muted/60 flex items-center justify-center shrink-0 border border-border">
                          <Package size={28} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h3 className="font-display font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                              Yellow Maize (Grade A)
                            </h3>
                            <CorridorBadge country="NG" />
                          </div>
                          <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                            <MapPin size={12} />
                            <span>Kano, Nigeria · Min: 50 Bags</span>
                          </p>
                          <div className="flex items-baseline justify-between">
                            <span className="font-display font-extrabold text-sm text-foreground tabular-nums">
                              ₦ 25,000 / bag
                            </span>
                            <span className="text-[11px] text-muted-foreground tabular-nums">
                              ≈ $ 16.20 (indicative)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Sample Product 2 */}
                  <Link href="/marketplace" className="block group">
                    <div className="p-3.5 rounded-lg border border-border/80 bg-background hover:border-primary/60 transition-colors">
                      <div className="flex gap-3.5 items-center">
                        <div className="w-16 h-16 rounded-md bg-muted/60 flex items-center justify-center shrink-0 border border-border">
                          <Package size={28} className="text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h3 className="font-display font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                              Raw Cashew Nuts (Export Grade)
                            </h3>
                            <CorridorBadge country="GH" />
                          </div>
                          <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                            <MapPin size={12} />
                            <span>Sunyani, Ghana · Min: 20 Bags</span>
                          </p>
                          <div className="flex items-baseline justify-between">
                            <span className="font-display font-extrabold text-sm text-foreground tabular-nums">
                              GH₵ 450 / bag
                            </span>
                            <span className="text-[11px] text-muted-foreground tabular-nums">
                              ≈ $ 31.00 (indicative)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="mt-4 pt-3.5 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>Authoritative settlement in listed currency</span>
                  <Link href="/marketplace" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                    <span>View 100+ items</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">
              Transparent Procurement
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground mb-4">
              How AfriTrade Connect Works
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Direct B2B trade execution from supplier facility to regional destination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-background flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <ShieldCheck size={26} />
                  </div>
                  <span className="font-display font-extrabold text-2xl text-muted-foreground/40">01</span>
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  Browse Verified Suppliers
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Discover genuine commodities from suppliers verified with CAC (Nigeria), CIPC (South Africa), or RGD (Ghana).
                </p>
              </div>
              <div className="mt-6 pt-3.5 border-t border-border text-xs font-semibold text-primary flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>Statutory filings checked</span>
              </div>
            </Card>

            <Card className="p-6 bg-background flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <DollarSign size={26} />
                  </div>
                  <span className="font-display font-extrabold text-2xl text-muted-foreground/40">02</span>
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  Order & Test Payment
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Place wholesale orders with authoritative pricing in supplier currency, supplemented by indicative estimates.
                </p>
              </div>
              <div className="mt-6 pt-3.5 border-t border-border text-xs font-semibold text-primary flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>Single-currency order safety</span>
              </div>
            </Card>

            <Card className="p-6 bg-background flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Truck size={26} />
                  </div>
                  <span className="font-display font-extrabold text-2xl text-muted-foreground/40">03</span>
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  Track Delivery Progress
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Monitor order custody across the 8-milestone pipeline from pickup through customs clearance and final receipt.
                </p>
              </div>
              <div className="mt-6 pt-3.5 border-t border-border text-xs font-semibold text-primary flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>Curated logistics status</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Peace of Mind Section (Stitch Section 3) */}
      <section className="py-16 sm:py-24 bg-card border-b border-border" id="trust">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 text-primary text-xs sm:text-sm font-bold mb-2">
              <ShieldCheck size={18} />
              <span>Trust &amp; Peace of Mind</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground mb-3">
              Built for Safe Wholesale Trade
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Cross-border procurement should be straightforward, fair, and reliable for both buyers and suppliers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Trust Card 1 */}
            <Card className="p-6 sm:p-8 bg-background border-border hover:border-primary/60 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <ShieldCheck size={26} />
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-foreground mb-2">
                  Checked Businesses
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  We verify official government company registrations for every supplier before they can list wholesale goods.
                </p>
              </div>
              <div className="pt-3 border-t border-border text-primary text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={15} />
                <span>CAC (NG) • CIPC (ZA) • RGD (GH)</span>
              </div>
            </Card>

            {/* Trust Card 2 */}
            <Card className="p-6 sm:p-8 bg-background border-border hover:border-primary/60 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent-foreground flex items-center justify-center mb-5">
                  <DollarSign size={26} />
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-foreground mb-2">
                  Clear Prices
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  Pay in the supplier&apos;s listed currency with clear local price estimates and zero hidden exchange surprises.
                </p>
              </div>
              <div className="pt-3 border-t border-border text-primary text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={15} />
                <span>Direct supplier prices</span>
              </div>
            </Card>

            {/* Trust Card 3 */}
            <Card className="p-6 sm:p-8 bg-background border-border hover:border-primary/60 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <Truck size={26} />
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-foreground mb-2">
                  Trusted Delivery Partners
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  Curated transport partners manage your shipment custody from supplier warehouse through border customs to delivery.
                </p>
              </div>
              <div className="pt-3 border-t border-border text-primary text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={15} />
                <span>Estimated transit timelines</span>
              </div>
            </Card>
          </div>

          <div className="mt-8 text-center sm:text-left">
            <Link href="/trust" className="text-xs sm:text-sm font-bold text-primary hover:underline inline-flex items-center gap-1.5">
              <span>Read the full Verification &amp; Trade Safety Guide</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Corridor Hubs Section */}
      <section className="py-14 sm:py-20 bg-background border-b border-border" id="hubs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-xl bg-card border border-border">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">
                Regional Trade Corridors
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Active supplier networks ready for bulk multi-ton wholesale fulfillment
              </p>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <Link href="/marketplace?country=NG" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-muted/40 border border-border hover:border-primary transition-colors">
                <span className="font-display font-extrabold text-lg text-primary">NG</span>
                <div>
                  <p className="text-xs font-bold text-foreground">Nigeria</p>
                  <p className="text-[11px] text-muted-foreground">Grains, Oilseeds & Raw Tubers</p>
                </div>
              </Link>
              <Link href="/marketplace?country=ZA" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-muted/40 border border-border hover:border-primary transition-colors">
                <span className="font-display font-extrabold text-lg text-primary">ZA</span>
                <div>
                  <p className="text-xs font-bold text-foreground">South Africa</p>
                  <p className="text-[11px] text-muted-foreground">Processed Goods & Produce</p>
                </div>
              </Link>
              <Link href="/marketplace?country=GH" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-muted/40 border border-border hover:border-primary transition-colors">
                <span className="font-display font-extrabold text-lg text-primary">GH</span>
                <div>
                  <p className="text-xs font-bold text-foreground">Ghana</p>
                  <p className="text-[11px] text-muted-foreground">Cashew, Cocoa & Horticulture</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="py-16 sm:py-20 bg-primary text-primary-foreground" id="signup">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-hover text-xs font-semibold mb-3 border border-primary-contrast/20">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              <span>Start Sourcing Today</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3">
              Ready to start trading with verified suppliers?
            </h2>
            <p className="text-sm sm:text-base text-primary-foreground/90 max-w-xl">
              Join wholesale buyers and verified suppliers conducting reliable cross-border operations across Nigeria, South Africa, and Ghana.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <Button asChild size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 shadow-md font-semibold">
              <Link href="/register">
                Create Free Account
              </Link>
            </Button>
            <Button asChild size="lg" className="w-full sm:w-auto bg-transparent border border-white/60 text-white hover:bg-white/10 hover:text-white shadow-none">
              <Link href="/marketplace">
                Explore Marketplace
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
