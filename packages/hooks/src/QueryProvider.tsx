"use client";
import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: true,
            refetchOnMount: true,
            refetchOnReconnect: true,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
