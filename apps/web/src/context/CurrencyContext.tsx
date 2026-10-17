"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "@afritrade/ui";
import { useUpdateUserPreferences } from "@afritrade/hooks";

export interface CurrencyContextType {
  buyerCurrency: string;
  setBuyerCurrency: (currency: string) => void;
  availableCurrencies: string[];
}

const DEFAULT_CURRENCY = "USD";
const COOKIE_KEY = "buyer_currency";

function getStoredCurrency(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setStoredCurrency(val: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(val)}; Path=/; SameSite=Lax; Max-Age=31536000`;
}

const CurrencyContext = createContext<CurrencyContextType>({
  buyerCurrency: DEFAULT_CURRENCY,
  setBuyerCurrency: () => {},
  availableCurrencies: ["NGN", "ZAR", "GHS", "USD"],
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [buyerCurrency, setBuyerCurrencyState] = useState<string>(DEFAULT_CURRENCY);

  const auth = useAuth();
  const authUser = auth?.user;
  const updateUser = auth?.updateUser;
  const updatePrefMutation = useUpdateUserPreferences();

  useEffect(() => {
    if (authUser?.preferredCurrency) {
      setBuyerCurrencyState(authUser.preferredCurrency);
      return;
    }
    if (authUser?.countryCode) {
      const map: Record<string, string> = {
        NG: "NGN",
        ZA: "ZAR",
        GH: "GHS",
      };
      const fromCountry = map[authUser.countryCode.toUpperCase()];
      if (fromCountry) {
        setBuyerCurrencyState(fromCountry);
        return;
      }
    }

    // Guest fallback from cookie
    const saved = getStoredCurrency();
    if (saved && ["NGN", "ZAR", "GHS", "USD"].includes(saved)) {
      setBuyerCurrencyState(saved);
    }
  }, [authUser?.preferredCurrency, authUser?.countryCode]);

  const setBuyerCurrency = (currency: string) => {
    setBuyerCurrencyState(currency);
    setStoredCurrency(currency);
    if (authUser && ["NGN", "ZAR", "GHS", "USD"].includes(currency)) {
      updatePrefMutation.mutate(
        { preferredCurrency: currency as "NGN" | "ZAR" | "GHS" | "USD" },
        {
          onSuccess: (updated) => {
            updateUser?.(updated);
          },
        },
      );
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        buyerCurrency,
        setBuyerCurrency,
        availableCurrencies: ["NGN", "ZAR", "GHS", "USD"],
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useBuyerCurrency(): CurrencyContextType {
  return useContext(CurrencyContext);
}
