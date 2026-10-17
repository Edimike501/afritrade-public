import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "../api/dashboard.api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
};

export interface DashboardQueryOptions {
  refetchInterval?: number | false;
}

export function useDashboardSummary(options?: DashboardQueryOptions) {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => getDashboardSummary(),
    refetchInterval: options?.refetchInterval,
  });
}
