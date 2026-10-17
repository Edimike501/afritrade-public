"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent, Suspense } from "react";
import { Lock, AlertCircle, Mail, Key, ArrowRight } from "lucide-react";
import { Role } from "@afritrade/shared";
import { useAuth, Button, Input, Card, Badge } from "@afritrade/ui";
import { useLogin, ApiError } from "@afritrade/hooks";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next");

  const { signIn } = useAuth();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const result = await loginMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        password,
      });

      signIn(result);

      if (nextUrl) {
        router.push(nextUrl);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === "AUTH_INVALID_CREDENTIALS") {
          setErrorMessage("Invalid enterprise credentials. Please check your email and password.");
        } else {
          setErrorMessage(err.message || "Authentication failed. Please verify credentials.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected network error occurred.");
      }
    }
  }

  function fillDemoAccount(demoEmail: string, demoPass: string) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  }

  return (
    <div className="w-full max-w-lg mx-auto py-12 px-4 sm:px-6">
      <Card className="p-6 sm:p-8 bg-card border-border shadow-md">
        {/* Regional Trade Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-border mb-4">
          <span className="w-2 h-2 rounded-full bg-accent"></span>
          <span className="text-xs font-semibold text-foreground">
            Nigeria · South Africa · Ghana Wholesale Portal
          </span>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl text-foreground font-extrabold tracking-tight mb-1.5">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Sign in to manage your wholesale trade orders, catalog listings, and verified shipments.
          </p>
        </div>

        {/* Security Notice */}
        <div className="mb-6 inline-flex items-center gap-1.5 bg-muted/60 text-muted-foreground px-3 py-1 rounded-full text-[11px] border border-border">
          <Lock size={14} className="text-primary" />
          <span>Strict In-Memory Session · 15m Token Security</span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-xs flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Authentication Failed</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            id="email-input"
            label="Corporate Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="procurement@company.com"
            required
            autoComplete="email"
            leftIcon={<Mail size={18} />}
          />

          <Input
            id="password-input"
            label="Account Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
            leftIcon={<Key size={18} />}
          />

          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            isLoading={loginMutation.isPending}
            rightIcon={<ArrowRight size={18} />}
          >
            Sign In to Trade Console
          </Button>
        </form>

        {/* One-Click Fast Demo Fill Buttons */}
        <div className="mt-8 pt-6 border-t border-border">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-3 font-sans">
            Demo Simulation Logins (Zero Real Money)
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillDemoAccount("buyer@example.com", "Password123!")}
              className="px-3 py-2 text-xs rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground font-medium text-left transition-colors"
            >
              <span className="font-bold block text-primary">Demo Buyer</span>
              <span className="text-[11px] text-muted-foreground truncate block">buyer@example.com</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("supplier@example.com", "Password123!")}
              className="px-3 py-2 text-xs rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground font-medium text-left transition-colors"
            >
              <span className="font-bold block text-accent-foreground">Demo Supplier</span>
              <span className="text-[11px] text-muted-foreground truncate block">supplier@example.com</span>
            </button>
          </div>
        </div>

        {/* Bottom Registration Link */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have a verified trade account?{" "}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Register here
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading login interface…</div>}>
      <LoginForm />
    </Suspense>
  );
}
