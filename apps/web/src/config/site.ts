/**
 * SINGLE SOURCE for editable copy & navigation (TRD §6).
 * Content/design handoff: edit THIS file (and the tokens at the top of
 * globals.css) — no component changes needed.
 */
import { Role } from "@afritrade/shared";

export interface NavItem {
  label: string;
  href: string;
}

export const siteConfig = {
  name: "AfriTrade Connect",
  shortName: "AfriTrade",
  tagline: "Trade across Africa with verified partners and simple logistics.",
  description:
    "A premier B2B cross-border marketplace connecting African manufacturers, exporters, wholesalers and buyers across Nigeria, South Africa, and Ghana under AfCFTA — with curated logistics.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://afritrade-connect.vercel.app",
  ogImage: "/opengraph-image.png",
  keywords: [
    "African B2B marketplace",
    "AfCFTA trade platform",
    "Intra-African commerce",
    "Nigerian manufacturers wholesale",
    "South African exporters",
    "Ghana agricultural trade",
    "Cross-border African logistics",
    "African commodities export",
    "Verified African suppliers",
    "B2B trade settlement Africa",
    "African trade finance",
    "AfCFTA procurement",
  ],
  authors: [{ name: "AfriTrade Connect", url: "https://afritrade-connect.vercel.app" }],
  creator: "AfriTrade Connect",
  publisher: "AfriTrade Connect",
  themeColor: "#0f6b4f",
  twitterHandle: "@afritrade",
  hero: {
    title: "Find verified African suppliers. Ship across borders.",
    subtitle:
      "AfriTrade Connect brings sourcing, ordering and shipment tracking into one place for businesses in Nigeria, South Africa and Ghana — and beyond.",
    primaryCta: { label: "Browse the marketplace", href: "/marketplace" },
    secondaryCta: { label: "Create an account", href: "/register" },
  },
  howItWorks: [
    { title: "Register", body: "Buyers sign up instantly. Suppliers submit business details for review." },
    { title: "Get verified", body: "Our team manually reviews every supplier before they can list products." },
    { title: "Order", body: "Browse products by country and category, place an order and pay securely." },
    { title: "Track", body: "Follow your shipment from pick-up to delivery with a curated logistics partner." },
  ],
  footer: "AfriTrade Connect — academic capstone prototype. No real payments are processed.",
  demoNotice: "Prototype: payments are simulated and no real money moves.",
  nav: {
    public: [
      { label: "Marketplace", href: "/marketplace" },
      { label: "How Verification Works", href: "/trust" },
    ],
    [Role.BUYER]: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Marketplace", href: "/dashboard/marketplace" },
      { label: "My Orders", href: "/orders" },
    ],
    [Role.SUPPLIER]: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "My Products", href: "/products" },
      { label: "Incoming Orders", href: "/orders" },
      { label: "Business Profile", href: "/business-profile" },
      { label: "KYB Status", href: "/kyb" },
    ],
  } as Record<"public" | Role.BUYER | Role.SUPPLIER, NavItem[]>,
};
