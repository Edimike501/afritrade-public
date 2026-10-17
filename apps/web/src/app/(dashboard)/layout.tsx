"use client";

import React, { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Role } from "@afritrade/shared";
import { useAuth, BrandLogo, Sheet } from "@afritrade/ui";
import { DashboardSidebar } from "@/components/SidebarNav";

interface DashboardLayoutProps {
  children: ReactNode;
  buyer: ReactNode;
  supplier: ReactNode;
}

export default function RoleDashboardLayout({
  children,
  buyer,
  supplier,
}: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading dashboard session…
        </p>
      </div>
    );
  }

  // Determine active role
  const isBuyer = user.role === Role.BUYER;
  const isSupplier = user.role === Role.SUPPLIER;

  if (!isBuyer && !isSupplier) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full p-6 rounded-lg bg-card border border-destructive/30 text-destructive text-sm text-center">
          Unauthorized: You do not have permissions to access this dashboard.
        </div>
      </div>
    );
  }

  const activeRole = isBuyer ? Role.BUYER : Role.SUPPLIER;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row antialiased">
      {/* Desktop Left Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-40 w-64 h-screen">
        <DashboardSidebar role={activeRole} />
      </div>

      {/* Mobile Top App Bar with Drawer Toggle */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-card border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo size={30} showText={true} />
        </Link>
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="inline-flex items-center justify-center min-w-11 min-h-11 p-2 rounded-lg text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Drawer (Sheet) */}
      <Sheet
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        side="left"
        className="p-0 w-72 max-w-[85vw]"
      >
        <DashboardSidebar
          role={activeRole}
          onItemClick={() => setMobileDrawerOpen(false)}
          className="w-full h-full border-none"
        />
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isBuyer ? buyer || children : supplier || children}
        </main>
      </div>
    </div>
  );
}
