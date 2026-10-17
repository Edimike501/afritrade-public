"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent, Suspense } from "react";
import {
  User,
  Store,
  Mail,
  Key,
  Globe,
  Coins,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { SelfRegistrableRole } from "@afritrade/shared";
import { useAuth, Button, Input, Card, Dropdown } from "@afritrade/ui";
import { useRegister, useCountries, ApiError } from "@afritrade/hooks";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next");
  const initialRoleParam = searchParams.get("role");

  const { signIn } = useAuth();
  const { data: countries, isLoading: loadingCountries } = useCountries();
  const registerMutation = useRegister();

  const [role, setRole] = useState<SelfRegistrableRole>(
    initialRoleParam === "SUPPLIER" ? SelfRegistrableRole.SUPPLIER : SelfRegistrableRole.BUYER
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("NG");
  const [preferredCurrency, setPreferredCurrency] = useState<"NGN" | "ZAR" | "GHS" | "USD">("NGN");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (countryCode === "NG") setPreferredCurrency("NGN");
    else if (countryCode === "ZA") setPreferredCurrency("ZAR");
    else if (countryCode === "GH") setPreferredCurrency("GHS");
    else setPreferredCurrency("USD");
  }, [countryCode]);

  useEffect(() => {
    if (countries && countries.length > 0) {
      const exists = countries.some((c) => c.isoCode === countryCode);
      if (!exists && countries[0]) {
        setCountryCode(countries[0].isoCode);
      }
    }
  }, [countries, countryCode]);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        countryCode,
        preferredCurrency,
      });

      signIn(result);

      if (nextUrl) {
        router.push(nextUrl);
      } else if (role === SelfRegistrableRole.SUPPLIER) {
        router.push("/kyb");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Failed to create account. Please check your details.");
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected registration error occurred.");
      }
    }
  }

  const countryOptions = (countries || [
    { isoCode: "NG", name: "Nigeria" },
    { isoCode: "ZA", name: "South Africa" },
    { isoCode: "GH", name: "Ghana" },
  ]).map((c) => ({
    value: c.isoCode,
    label: `${c.name} (${c.isoCode})`,
  }));

  const currencyOptions = [
    { value: "NGN", label: "Nigerian Naira (NGN ₦)" },
    { value: "ZAR", label: "South African Rand (ZAR R)" },
    { value: "GHS", label: "Ghanaian Cedi (GHS GH₵)" },
    { value: "USD", label: "US Dollar (USD $)" },
  ];

  return (
    <div className="w-full max-w-xl mx-auto py-12 px-4 sm:px-6">
      <Card className="p-6 sm:p-8 bg-card border-border shadow-md">
        {/* Role Segmented Selector */}
        <div className="mb-6">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2 font-sans">
            Account Type & Intent
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setRole(SelfRegistrableRole.BUYER)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-all min-h-[44px] ${
                role === SelfRegistrableRole.BUYER
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User size={18} className={role === SelfRegistrableRole.BUYER ? "text-primary" : ""} />
              <span>Commercial Buyer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole(SelfRegistrableRole.SUPPLIER)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-all min-h-[44px] ${
                role === SelfRegistrableRole.SUPPLIER
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Store size={18} className={role === SelfRegistrableRole.SUPPLIER ? "text-primary" : ""} />
              <span>Verified Supplier</span>
            </button>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl text-foreground font-extrabold tracking-tight mb-1.5">
            Create Enterprise Account
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {role === SelfRegistrableRole.BUYER
              ? "Gain instant procurement access to verified African agricultural and wholesale exporters."
              : "Register your commercial entity. You will submit business registration details for manual KYB approval."}
          </p>
        </div>

        {/* KYB Reminder for Suppliers */}
        {role === SelfRegistrableRole.SUPPLIER && (
          <div className="mb-6 p-3.5 bg-accent/10 border border-accent/30 rounded-lg text-accent-foreground text-xs flex items-start gap-2.5">
            <ShieldCheck size={18} className="shrink-0 mt-0.5 text-accent-foreground" />
            <div className="flex-1">
              <span className="font-bold block">Statutory KYB Review Required</span>
              <span>Suppliers must have valid government filing certificates (CAC, CIPC, or RGD) to activate catalog publishing.</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-xs flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Registration Error</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            id="fullname-input"
            label="Corporate / Representative Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Amina Bello or Dangote Trading Ltd"
            required
            autoComplete="name"
            leftIcon={<User size={18} />}
          />

          <Input
            id="email-input"
            label="Work Email Address"
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
            label="Password (min 8 characters)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            autoComplete="new-password"
            leftIcon={<Key size={18} />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="country-select" className="text-xs font-semibold text-foreground font-sans">
                Operating Jurisdiction
              </label>
              <Dropdown
                id="country-select"
                value={countryCode}
                onChange={(val) => setCountryCode(val)}
                options={countryOptions}
                fullWidth={true}
                disabled={loadingCountries}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="currency-select" className="text-xs font-semibold text-foreground font-sans">
                Preferred Settlement Currency
              </label>
              <Dropdown
                id="currency-select"
                value={preferredCurrency}
                onChange={(val) => setPreferredCurrency(val as any)}
                options={currencyOptions}
                fullWidth={true}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            isLoading={registerMutation.isPending}
            rightIcon={<ArrowRight size={18} />}
          >
            Complete Registration
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign in here
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading registration interface…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
