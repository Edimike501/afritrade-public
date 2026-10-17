"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth, BrandLogo } from "@afritrade/ui";
import { AdminSidebar } from "./AdminSidebar";
import { Sheet } from "@afritrade/ui";

export interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Login page does not use the full admin shell layout
  const isLoginPage = pathname === "/login";
  if (isLoginPage) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row antialiased">
      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-40 w-72 h-screen">
        <AdminSidebar user={user} onSignOut={handleSignOut} />
      </div>

      {/* Mobile Top App Bar with Drawer Toggle */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-card border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo size={30} showText={true} />
        </Link>
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-lg text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Open operations menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Drawer (Sheet) */}
      <Sheet
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        side="left"
        className="p-0 w-80 max-w-[85vw]"
      >
        <AdminSidebar
          user={user}
          onSignOut={handleSignOut}
          onItemClick={() => setMobileDrawerOpen(false)}
          className="w-full h-full border-none"
        />
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
        <footer className="border-t border-border py-4 px-6 text-center text-xs text-muted-foreground bg-muted/10">
          AfriTrade Connect Operations Portal · Authorized Administrative Personnel Only
        </footer>
      </div>
    </div>
  );
}
