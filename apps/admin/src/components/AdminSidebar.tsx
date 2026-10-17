import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Truck,
  Users,
  ShieldCheck,
  IdCard,
  LogOut,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { BrandLogo, ThemeToggle } from "@afritrade/ui";
import { ProfileModal } from "./ProfileModal";
import { cn } from "@afritrade/ui";

export interface AdminNavChild {
  label: string;
  href: string;
  badge?: string | number;
  isPlaceholder?: boolean;
}

export interface AdminNavGroup {
  title: string;
  items: {
    label: string;
    href: string;
    icon: LucideIcon;
    badge?: string | number;
    isPlaceholder?: boolean;
  }[];
}

export const ADMIN_NAV_CONFIG: AdminNavGroup[] = [
  {
    title: "Operations",
    items: [
      {
        label: "Platform Overview",
        href: "/",
        icon: Home,
      },
      {
        label: "Orders Oversight",
        href: "/orders",
        icon: ClipboardList,
      },
      {
        label: "Logistics Partners",
        href: "/logistics",
        icon: Truck,
      },
    ],
  },
  {
    title: "Users & Verification",
    items: [
      {
        label: "All Users Directory",
        href: "/users",
        icon: Users,
      },
      {
        label: "KYB Review Queue",
        href: "/users/kyb",
        icon: ShieldCheck,
      },
      {
        label: "KYC Placeholder",
        href: "/users/kyc",
        icon: IdCard,
        isPlaceholder: true,
      },
    ],
  },
];

export interface AdminSidebarProps {
  user?: {
    fullName?: string;
    email?: string;
    role?: string;
  } | null;
  onSignOut?: () => void;
  className?: string;
  onItemClick?: () => void;
}

export function AdminSidebar({
  user,
  onSignOut,
  className,
  onItemClick,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  return (
    <aside
      className={cn(
        "w-72 bg-card border-r border-border flex flex-col justify-between h-full select-none",
        className
      )}
      aria-label="Admin Operations Sidebar"
    >
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Brand Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <Link
            href="/"
            onClick={onItemClick}
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          >
            <BrandLogo size={36} showText={true} />
          </Link>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Ops
            </span>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {ADMIN_NAV_CONFIG.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <h2 className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-sans">
                {group.title}
              </h2>
              <nav className="space-y-1" aria-label={group.title}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/" || item.href === "/users"
                      ? pathname === item.href
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`) ||
                        (item.href === "/users/kyb" && pathname === "/kyb");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onItemClick}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={20}
                          className={cn(
                            "shrink-0",
                            isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.isPlaceholder && (
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-1.5 py-0.5 rounded-sm tracking-wide uppercase",
                              isActive
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-muted text-muted-foreground border border-border"
                            )}
                          >
                            Soon
                          </span>
                        )}
                        {item.badge !== undefined && (
                          <span
                            className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded-full tabular-nums",
                              isActive
                                ? "bg-primary-foreground text-primary"
                                : "bg-primary/10 text-primary"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / User Profile & Controls */}
      <div className="p-4 border-t border-border bg-muted/20 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {user ? (
              <>
                <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                  {user.fullName
                    ? user.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "AD"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {user.fullName}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate">
                    {user.email || "Administrator"}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0 border border-border animate-pulse">
                  ···
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-muted-foreground truncate">
                    Authenticating…
                  </span>
                  <span className="text-[11px] text-muted-foreground/70 truncate">
                    Checking session
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle size={18} />
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              aria-label="Admin profile and settings"
              title="Profile & Settings"
              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Settings size={18} />
            </button>
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                aria-label="Sign out of operations console"
                title="Sign Out"
                className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut size={18} />
              </button>
            )}
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
