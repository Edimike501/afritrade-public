"use client";

import type { ReactNode } from "react";
import { AuthProvider, ThemeProvider } from "@afritrade/ui";
import { QueryProvider } from "@afritrade/hooks";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
