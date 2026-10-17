"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Store,
  ClipboardList,
  ShieldCheck,
  Package,
  Building2,
  LogOut,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Role } from "@afritrade/shared";
import { useAuth, BrandLogo, Sheet, ThemeToggle } from "@afritrade/ui";
import { CurrencySelector } from "./CurrencySelector";
import { ProfileModal } from "./ProfileModal";
import { cn } from "@afritrade/ui";

export interface NavItemConfig {
  label: string;
  href: string;
  icon: LucideIcon;
}

const BUYER_NAV_ITEMS: NavItemConfig[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Marketplace", href: "/dashboard/marketplace", icon: Store },
  { label: "My Orders", href: "/orders", icon: ClipboardList },
];

const SUPPLIER_NAV_ITEMS: NavItemConfig[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "My Products", href: "/products", icon: Package },
  { label: "Incoming Orders", href: "/orders", icon: ClipboardList },
  { label: "Business Profile", href: "/business-profile", icon: Building2 },
  { label: "KYB Verification", href: "/kyb", icon: ShieldCheck },
];

export interface DashboardSidebarProps {
  role: Role.BUYER | Role.SUPPLIER;
  onItemClick?: () => void;
  className?: string;
}

export function DashboardSidebar({
  role,
  onItemClick,
  className,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const links = role === Role.BUYER ? BUYER_NAV_ITEMS : SUPPLIER_NAV_ITEMS;
  const roleBadge = role === Role.BUYER ? "Buyer" : "Supplier";

  return (
    <aside
      className={cn(
        "w-64 bg-card border-r border-border flex flex-col justify-between h-full select-none",
        className,
      )}
      aria-label={`${roleBadge} Portal Navigation`}
    >
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Brand & Portal Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <Link
            href="/"
            onClick={onItemClick}
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          >
            <BrandLogo size={34} showText={true} />
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {roleBadge}
          </span>
        </div>

        {/* Currency Display Selector */}
        <div className="px-4 py-3.5 border-b border-border/60 bg-muted/20">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 font-sans">
            Settlement Currency
          </div>
          <CurrencySelector showLabel={false} size="sm" className="w-full" />
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-sans">
            Menu
          </div>
          {links.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-11",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                <Icon
                  size={20}
                  className={cn(
                    "shrink-0",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Card & Logout */}
      <div className="p-4 border-t border-border bg-muted/20 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
              {user?.fullName
                ? user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "US"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">
                {user?.fullName || "User Account"}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {user?.email || "Signed in"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle size={18} />
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              aria-label="Account profile and settings"
              title="Profile & Settings"
              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Settings size={18} />
            </button>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              aria-label="Sign out"
              title="Sign Out"
              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </aside>
  );
}
