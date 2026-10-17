"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Key,
} from "lucide-react";
import { useAuth, Card, CardContent, CardHeader, CardTitle, Button, BrandLogo } from "@afritrade/ui";
import { useAdminLogin, ApiError } from "@afritrade/hooks";

/**
 * Admin Login Page
 * Dedicated authentication portal for platform administrators.
 */
export default function AdminLoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const adminLoginMutation = useAdminLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAdminLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const result = await adminLoginMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        password,
      });

      signIn(result);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === "AUTH_INVALID_CREDENTIALS") {
          setError("Invalid administrator credentials. Access restricted to authorized personnel.");
        } else {
          setError(err.message || "Failed to authenticate administrator.");
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected network error occurred.");
      }
    }
  }

  function fillDemoAdmin() {
    setEmail("admin@afritrade.test");
    setPassword("Admin123!@#");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 antialiased">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-3">
          <BrandLogo size={42} showText={true} />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Admin Operations Portal
            </h1>
            <p className="text-xs text-muted-foreground">
              Restricted management console for KYC/KYB compliance, orders & freight operations.
            </p>
          </div>
        </div>

        <Card className="border border-border shadow-md">
          <CardHeader className="pb-4 border-b border-border/60">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary" />
              <span>Administrator Sign In</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-3.5 text-destructive text-sm flex items-start gap-2.5">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleAdminLogin}>
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-email"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Admin Email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@afritrade.test"
                    disabled={adminLoginMutation.isPending}
                    className="flex h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="admin-password"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <input
                    id="admin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter administrator password"
                    disabled={adminLoginMutation.isPending}
                    className="flex h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={adminLoginMutation.isPending}
                className="w-full h-11 font-semibold text-sm gap-2 mt-2"
              >
                {adminLoginMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Authenticating…</span>
                  </>
                ) : (
                  <span>Sign In to Admin Portal</span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted transition-colors border border-border/50"
              >
                <Key size={14} />
                <span>Fill Seeded Admin Credentials (Dev/Demo)</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
