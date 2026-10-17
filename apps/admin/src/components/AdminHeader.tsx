"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@afritrade/ui";
import { Role } from "@afritrade/shared";

export function AdminHeader() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  return (
    <header className="header">
      <div className="container">
        <Link href="/" className="brand">
          AfriTrade Connect <span className="badge">Admin</span>
        </Link>
        <nav className="nav">
          {!loading && user && user.role === Role.ADMIN && (
            <>
              <Link href="/">Platform Summary</Link>
              <Link href="/kyb">KYB Queue</Link>
              <Link href="/logistics">Logistics</Link>
              <Link href="/orders">All Orders</Link>
              <span className="muted">·</span>
              <span className="muted">{user.fullName}</span>
              <button
                className="btn secondary small"
                onClick={() => {
                  signOut();
                  router.push("/login");
                }}
              >
                Log out
              </button>
            </>
          )}
          {!loading && !user && (
            <Link className="btn small" href="/login">
              Admin Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
