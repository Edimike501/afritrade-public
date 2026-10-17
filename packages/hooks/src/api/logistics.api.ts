import { defaultApiClient, type ApiClient } from "../client";
import {
  UpdateShipmentSchema,
  UpsertLogisticsPartnerSchema,
  type UpdateShipmentInput,
  type UpsertLogisticsPartnerInput,
} from "@afritrade/shared";

export interface LogisticsPartnerDto {
  id: string;
  name: string;
  countryCoverage: string[];
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
  isActive: boolean;
}

export type { UpdateShipmentInput, UpsertLogisticsPartnerInput };

export async function getLogisticsPartners(client: ApiClient = defaultApiClient): Promise<LogisticsPartnerDto[]> {
  const res = await client.get<LogisticsPartnerDto[]>("/admin/logistics-partners");
  return res.data;
}

export async function updateOrderShipment(
  orderId: string,
  input: UpdateShipmentInput,
  client: ApiClient = defaultApiClient,
): Promise<void> {
  const validated = UpdateShipmentSchema.parse(input);
  await client.patch(`/admin/orders/${orderId}/shipment`, validated);
}

export async function createLogisticsPartner(
  input: UpsertLogisticsPartnerInput,
  client: ApiClient = defaultApiClient,
): Promise<LogisticsPartnerDto> {
  const validated = UpsertLogisticsPartnerSchema.parse(input);
  const res = await client.post<LogisticsPartnerDto>("/admin/logistics-partners", validated);
  return res.data;
}

export async function updateLogisticsPartner(
  id: string,
  input: Partial<UpsertLogisticsPartnerInput>,
  client: ApiClient = defaultApiClient,
): Promise<LogisticsPartnerDto> {
  const validated = UpsertLogisticsPartnerSchema.partial().parse(input);
  const res = await client.patch<LogisticsPartnerDto>(`/admin/logistics-partners/${id}`, validated);
  return res.data;
}
