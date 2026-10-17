import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  DollarSign,
  Truck,
  BadgeCheck,
  ArrowRight,
  Info,
  Package,
  ChevronDown,
} from "lucide-react";
import { Button, Card, Badge, SimulatedBadge } from "@afritrade/ui";

export const metadata = {
  title: "Trust Center & How Verification Works | AfriTrade Connect",
  description:
    "Learn how AfriTrade Connect verifies suppliers, handles dual-currency pricing, and tracks cross-border freight under AfCFTA across Nigeria, South Africa, and Ghana.",
};

export default function TrustCenterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Simulation Banner */}
      <div className="bg-primary/10 border-b border-primary/20 py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs sm:text-sm text-foreground">
          <SimulatedBadge />
          <span className="text-muted-foreground hidden sm:inline">•</span>
          <span className="text-muted-foreground">
            Academic capstone prototype: zero real money moves.
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-border bg-gradient-to-b from-card to-background text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-border text-xs sm:text-sm font-semibold mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Safe Wholesale Trade Across Nigeria · South Africa · Ghana</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-tight mb-6">
            Trust Center: How Verification and Trade Safety Work
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
            We make intra-African wholesale trading straightforward, transparent, and reliable. Learn how we verify suppliers, handle pricing, and track bulk deliveries under AfCFTA.
          </p>

          <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-3 rounded-xl bg-card border border-border shadow-xs text-xs sm:text-sm text-foreground text-left max-w-xl mx-auto">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Info size={20} />
            </div>
            <div>
              <span className="font-bold">Demo Mode:</span> Safe simulation with zero real money. All balances, supplier orders, and test settlement transfers use simulated ledger credits.
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats / Trust Indicators */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-6 bg-card border-border shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h4 className="font-display font-bold text-foreground text-lg">100% Vetted Suppliers</h4>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                Every business is manually audited against official government registries before listing goods.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent-foreground flex items-center justify-center shrink-0">
              <DollarSign size={26} />
            </div>
            <div>
              <h4 className="font-display font-bold text-foreground text-lg">Clear Local Pricing</h4>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                Transparent quotes in supplier native currency with indicative local estimates and zero hidden fees.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Truck size={26} />
            </div>
            <div>
              <h4 className="font-display font-bold text-foreground text-lg">Step-by-Step Delivery</h4>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                Track your bulk cargo across 8 distinct milestones from warehouse dispatch to customs and final arrival.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* PILLAR 1: VERIFIED BUSINESSES (KYB PROCESS) */}
      <section className="py-16 sm:py-24 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-primary mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>Pillar 01 · Trust & Verification</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Verified Businesses: The 3-Step Review Process
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mt-3 leading-relaxed">
            Unverified businesses cannot sell on AfriTrade Connect. Every enterprise goes through statutory KYB review by our operations team before listing wholesale lots.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Step 01 */}
          <Card className="p-6 sm:p-8 bg-card border-border flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-3xl font-extrabold text-muted-foreground/30 group-hover:text-primary transition-colors">01</span>
                <Badge variant="outline" className="text-xs">Official Records</Badge>
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">
                Document Submission
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                Suppliers provide official government business registration records, registered office address, and verified corporate tax ID.
              </p>

              <div className="space-y-2 pt-4 border-t border-border text-xs text-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-primary shrink-0" />
                  <span><strong>Nigeria:</strong> Corporate Affairs Commission (CAC)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-primary shrink-0" />
                  <span><strong>South Africa:</strong> Companies & IP Commission (CIPC)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-primary shrink-0" />
                  <span><strong>Ghana:</strong> Registrar General&apos;s Dept (RGD)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Submission Time: ~10 mins</span>
              <span className="text-primary font-semibold">Step 1 of 3</span>
            </div>
          </Card>

          {/* Step 02 */}
          <Card className="p-6 sm:p-8 bg-card border-border flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-3xl font-extrabold text-muted-foreground/30 group-hover:text-primary transition-colors">02</span>
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">Human Vetting</Badge>
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">
                Manual Admin Review
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                Our operations team cross-checks all submitted files directly against national registries. We verify registered directors, legal status, and operating integrity.
              </p>

              <div className="bg-muted/40 p-3.5 rounded-xl border border-border text-xs text-foreground space-y-1.5">
                <div className="flex items-center gap-2 font-medium">
                  <BadgeCheck size={16} className="text-primary shrink-0" />
                  <span>Active registry verification</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Building2 size={16} className="text-primary shrink-0" />
                  <span>Physical business address verification</span>
                </div>
                <div className="text-[11px] text-muted-foreground pt-1">
                  *Incomplete submissions are rejected with clear written guidance.
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Review SLA: 24–48 hours</span>
              <span className="text-amber-600 font-semibold">Step 2 of 3</span>
            </div>
          </Card>

          {/* Step 03 */}
          <Card className="p-6 sm:p-8 bg-card border-2 border-primary/80 flex flex-col justify-between group relative overflow-hidden shadow-md">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-3xl font-extrabold text-primary">03</span>
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">Access Granted</Badge>
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">
                Verified Supplier Badge
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                Only approved businesses receive the public badge and unlock wholesale listing permissions. Unapproved accounts cannot publish products or accept orders.
              </p>

              <div className="bg-primary/10 p-3.5 rounded-xl border border-primary/20 text-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="font-bold text-foreground">Verified Supplier Badge</div>
                  <div className="text-[11px] text-muted-foreground">ID & tax record verified in national register</div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Catalog Listing Enabled</span>
              <span className="text-primary font-bold">Step 3 of 3</span>
            </div>
          </Card>
        </div>
      </section>

      {/* PILLAR 2: TRANSPARENT PRICING & SAFE SIMULATION */}
      <section className="py-16 sm:py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span>Pillar 02 · Price Transparency</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                Transparent Pricing &amp; Safe Simulation
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Cross-border procurement often stalls because of volatile exchange rates and hidden bank fees. AfriTrade Connect eliminates currency guesswork before you place an order.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground text-base">Native Currency Pricing</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      Suppliers list lots in their native currency: Nigerian Naira (NGN), South African Rand (ZAR), Ghanaian Cedi (GHS), or USD.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Package size={20} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground text-base">Indicative Local Estimates</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      Buyers see real-time indicative conversions in their preferred currency so you know the exact estimated cost before initiating trade.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground text-base">Zero Real Money Risk (Safe Simulation)</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      Test procurement workflows, tracking milestones, and status progressions safely with test credits before any real fund commitments.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="lg:col-span-6 p-6 sm:p-8 bg-background border-border shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Sample Quote</span>
                <Badge variant="outline" className="gap-1 text-xs text-primary border-primary/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                  <span>Verified Wholesale Lot</span>
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary text-primary-foreground">NG</span>
                      <span className="text-xs font-medium text-muted-foreground">Kano, Nigeria</span>
                    </div>
                    <h4 className="font-display font-bold text-lg text-foreground">Yellow Maize (Grade A)</h4>
                    <div className="text-xs text-primary font-semibold flex items-center gap-1 mt-0.5">
                      <BadgeCheck size={14} />
                      <span>Verified Business: Savannah Agro Ltd</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Batch: 500 Bags</span>
                </div>

                <div className="bg-card p-4 rounded-xl border border-border space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Supplier Listed Price (Native):</span>
                    <span className="font-bold text-foreground font-mono">₦25,000 / bag</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">South Africa Indicative Est:</span>
                    <span className="font-bold text-primary font-mono">≈ R 290 / bag</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Ghana Indicative Est:</span>
                    <span className="font-bold text-primary font-mono">≈ GH₵ 225 / bag</span>
                  </div>
                  <div className="pt-2 border-t border-dashed border-border flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Indicative FX reference</span>
                    <span className="text-primary font-medium">Updated automatically · 0% hidden fee</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs text-foreground flex items-center gap-2">
                  <Info size={16} className="text-amber-600 shrink-0" />
                  <span>Simulate purchase flows in Demo Mode without entering banking or payment card details.</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* PILLAR 3: CURATED DELIVERY PARTNERS & TRACKING */}
      <section className="py-16 sm:py-24 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-primary mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>Pillar 03 · Logistics & Delivery</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Curated Delivery Partners &amp; 8-Milestone Tracking
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mt-3 leading-relaxed">
            Cross-border wholesale delivery should never be opaque. We partner with admin-curated freight carriers and provide status updates across each milestone.
          </p>
        </div>

        <Card className="p-6 sm:p-10 bg-card border-border shadow-sm">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div>
              <span className="text-xs uppercase font-bold text-muted-foreground">Order Sample Tracking</span>
              <h3 className="font-display font-bold text-xl text-foreground mt-0.5">Consignment #AT-7829-GH</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Raw Cashew Nuts (50 Bags) · Sunyani (Ghana) to Lagos (Nigeria)</p>
            </div>
            <div className="inline-flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>In Transit: Customs Pre-Cleared</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <span className="text-xs font-bold uppercase text-primary">Step 1 · Completed</span>
              </div>
              <h4 className="font-display font-bold text-base text-foreground mb-1">Supplier Dispatch</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Lot inspected, packed in jute bags, and picked up by curated freight partner.</p>
              <span className="text-[11px] text-muted-foreground mt-3">Sunyani Depot</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <span className="text-xs font-bold uppercase text-primary">Step 2 · Completed</span>
              </div>
              <h4 className="font-display font-bold text-base text-foreground mb-1">Border Inspection</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Commercial invoice, AfCFTA origin rules, and phytosanitary certificates checked.</p>
              <span className="text-[11px] text-muted-foreground mt-3">Aflao Border Crossing</span>
            </div>

            <div className="flex flex-col bg-accent/10 p-4 rounded-xl border border-accent/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <span className="text-xs font-bold uppercase text-accent-foreground">Step 3 · In Progress</span>
              </div>
              <h4 className="font-display font-bold text-base text-foreground mb-1">Customs Clearance</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Fast-track clearance verified. Electronic seal verified for safe transit.</p>
              <span className="text-[11px] text-primary font-medium mt-3">Seme Border Facility</span>
            </div>

            <div className="flex flex-col opacity-65">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <span className="text-xs font-bold uppercase text-muted-foreground">Step 4 · Upcoming</span>
              </div>
              <h4 className="font-display font-bold text-base text-foreground mb-1">Destination Arrival</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Final delivery to buyer warehouse. Physical receipt verification concludes order.</p>
              <span className="text-[11px] text-muted-foreground mt-3">Lagos Hub Delivery</span>
            </div>
          </div>
        </Card>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 sm:py-24 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">
              Frequently Asked Questions
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Everything You Need to Know
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Clear answers about supplier verification, supported countries, pricing, and our demo platform.
            </p>
          </div>

          <div className="space-y-4">
            <details className="group bg-background rounded-xl border border-border p-5 transition-all open:shadow-xs" open>
              <summary className="flex items-center justify-between cursor-pointer list-none select-none font-display font-bold text-base sm:text-lg text-foreground">
                <span>Can any business list products immediately?</span>
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 ml-4 group-open:rotate-180 transition-transform">
                  <ChevronDown size={14} />
                </span>
              </summary>
              <div className="mt-3 pt-3 border-t border-border text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <strong>No.</strong> AfriTrade Connect mandates statutory business checks. Suppliers must submit verified government registration certificates (CAC in Nigeria, CIPC in South Africa, or RGD in Ghana). Until an administrator manually reviews and approves these documents, product listings remain strictly disabled.
              </div>
            </details>

            <details className="group bg-background rounded-xl border border-border p-5 transition-all open:shadow-xs">
              <summary className="flex items-center justify-between cursor-pointer list-none select-none font-display font-bold text-base sm:text-lg text-foreground">
                <span>Which countries are currently supported?</span>
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 ml-4 group-open:rotate-180 transition-transform">
                  <ChevronDown size={14} />
                </span>
              </summary>
              <div className="mt-3 pt-3 border-t border-border text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Our active trade network currently covers <strong>Nigeria, South Africa, and Ghana</strong> under AfCFTA. Verified businesses located in these three nations can list lots, request wholesale orders, and arrange regional freight.
              </div>
            </details>

            <details className="group bg-background rounded-xl border border-border p-5 transition-all open:shadow-xs">
              <summary className="flex items-center justify-between cursor-pointer list-none select-none font-display font-bold text-base sm:text-lg text-foreground">
                <span>How do currency estimates work?</span>
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 ml-4 group-open:rotate-180 transition-transform">
                  <ChevronDown size={14} />
                </span>
              </summary>
              <div className="mt-3 pt-3 border-t border-border text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Suppliers price lots in their native currency (NGN, ZAR, GHS, or USD). As a buyer, you can switch the currency selector in the header to view indicative conversions in your preferred home currency, eliminating unexpected exchange markups.
              </div>
            </details>

            <details className="group bg-background rounded-xl border border-border p-5 transition-all open:shadow-xs">
              <summary className="flex items-center justify-between cursor-pointer list-none select-none font-display font-bold text-base sm:text-lg text-foreground">
                <span>Is real money required for this phase?</span>
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 ml-4 group-open:rotate-180 transition-transform">
                  <ChevronDown size={14} />
                </span>
              </summary>
              <div className="mt-3 pt-3 border-t border-border text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <strong>No, zero real money is required.</strong> The platform operates in simulated demo mode. All supplier registrations, quotes, test payments, and tracking logs use safe test credits, allowing wholesale buyers and local businesses to experience the full end-to-end workflow risk-free.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 sm:py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-hover text-xs font-semibold mb-3 border border-primary-contrast/20">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              <span>Start Sourcing Safely</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3">
              Ready to start trading with verified suppliers?
            </h2>
            <p className="text-sm sm:text-base text-primary-foreground/90 max-w-xl">
              Join wholesale buyers and local businesses streamlining intra-African trade across Nigeria, South Africa, and Ghana.
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
                Browse Marketplace
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
