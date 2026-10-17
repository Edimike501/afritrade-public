"use client";

import type { ReactNode } from "react";
import { AuthProvider, ThemeProvider } from "@afritrade/ui";
import { QueryProvider } from "@afritrade/hooks";
import { CurrencyProvider } from "@/context/CurrencyContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <CurrencyProvider>{children}</CurrencyProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
