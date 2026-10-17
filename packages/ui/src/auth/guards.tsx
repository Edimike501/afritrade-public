"use client";
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Role } from "@afritrade/shared";
import { useAuth } from "./AuthContext";

/**
 * Route guard for general role protection (e.g. BUYER, SUPPLIER).
 * Uses strictly typed Role enum from @afritrade/shared.
 */
export function RequireRole({
  roles,
  children,
  loginPath = "/login",
}: {
  roles: Role[];
  children: ReactNode;
  loginPath?: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`${loginPath}?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname, loginPath]);

  if (loading || !user) return <p className="muted">Loading…</p>;
  if (!roles.includes(user.role)) {
    return <div className="alert error">You do not have access to this page.</div>;
  }
  return <>{children}</>;
}

/**
 * Dedicated Admin Route Guard strictly verifying user.role === Role.ADMIN.
 * Redirects unauthenticated or unauthorized users to /login.
 */
export function RequireAdmin({
  children,
  loginPath = "/login",
}: {
  children: ReactNode;
  loginPath?: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== Role.ADMIN) {
        router.replace(`${loginPath}?next=${encodeURIComponent(pathname)}`);
      }
    }
  }, [loading, user, router, pathname, loginPath]);

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-muted-foreground">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs sm:text-sm font-medium">Verifying administrator session…</p>
      </div>
    );
  }
  if (user.role !== Role.ADMIN) {
    return (
      <div className="alert error" role="alert">
        Access denied: Administrator privileges required.
      </div>
    );
  }

  return <>{children}</>;
}
