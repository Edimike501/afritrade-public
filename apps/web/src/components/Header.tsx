"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, LogOut, Settings } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useAuth, BrandLogo, Sheet, ThemeToggle } from "@afritrade/ui";
import { Role } from "@afritrade/shared";
import { CurrencySelector } from "./CurrencySelector";
import { ProfileModal } from "./ProfileModal";

export function Header() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Web portal nav serves public, BUYER, and SUPPLIER
  const roleKey =
    user?.role === Role.BUYER || user?.role === Role.SUPPLIER
      ? user.role
      : "public";
  const items = siteConfig.nav[roleKey] ?? siteConfig.nav.public;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-card/95 backdrop-blur-md border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Anchor */}
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md shrink-0"
        >
          <BrandLogo size={34} showText={true} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center px-1"
            >
              {i.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Controls (Currency, Theme, Auth) */}
        <div className="hidden md:flex items-center gap-3">
          <CurrencySelector showLabel={false} size="sm" />
          <ThemeToggle size={18} />

          {!loading && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors py-1.5 px-2 rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[36px]"
                title="Profile & Settings"
              >
                <span className="truncate max-w-[130px]">{user.fullName}</span>
                <Settings size={14} className="text-muted-foreground" />
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                aria-label="Sign out"
                title="Sign Out"
                className="inline-flex items-center justify-center min-w-[36px] min-h-[36px] p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted rounded-md transition-colors min-h-[44px]"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors shadow-xs min-h-[44px]"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle size={18} />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-lg text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Open mobile navigation"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Sheet */}
      <Sheet
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        side="right"
        className="w-72 max-w-[85vw] p-5 flex flex-col justify-between"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <BrandLogo size={32} showText={true} />
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 pb-2">
              Currency
            </div>
            <CurrencySelector showLabel={false} size="sm" className="w-full" />
          </div>

          <nav className="space-y-1" aria-label="Mobile Navigation">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 pb-2">
              Menu
            </div>
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted min-h-[44px]"
              >
                {i.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-border">
          {!loading && user ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-foreground truncate px-1">
                {user.fullName}
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsProfileOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-muted text-foreground transition-colors min-h-[44px]"
              >
                <Settings size={16} />
                <span>Profile & Settings</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await handleSignOut();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors min-h-[44px]"
              >
                <LogOut size={18} />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-muted text-foreground min-h-[44px]"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs min-h-[44px]"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </Sheet>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </header>
  );
}
