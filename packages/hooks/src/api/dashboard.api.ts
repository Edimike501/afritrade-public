import type { DashboardSummaryDto } from "@afritrade/shared";
import { defaultApiClient, type ApiClient } from "../client";

export type DashboardSummary = DashboardSummaryDto;

export async function getDashboardSummary(client: ApiClient = defaultApiClient): Promise<DashboardSummaryDto> {
  const res = await client.get<DashboardSummaryDto>("/dashboard/summary");
  return res.data;
}
