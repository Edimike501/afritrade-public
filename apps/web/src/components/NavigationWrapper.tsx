"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";

// Dashboard and role portal routes use their own dedicated SidebarNav
const DASHBOARD_ROUTE_PREFIXES = ["/dashboard", "/supplier", "/orders", "/products", "/kyb"];

export function NavigationWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isDashboardRoute = DASHBOARD_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isDashboardRoute) {
    // Authenticated dashboard routes render full-screen with dedicated Sidenav and no public top header/footer
    return <main>{children}</main>;
  }

  // Public & marketplace routes render the standard top Header and Footer
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
