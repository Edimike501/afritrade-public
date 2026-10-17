import { z } from "zod";
import { OrderStatusSchema } from "../types/enums";

export const UpdateShipmentSchema = z.object({
  status: OrderStatusSchema,
  logisticsPartnerId: z.string().uuid("Logistics partner ID must be a valid UUID").optional(),
  notes: z.string().trim().max(500).optional(),
});
export type UpdateShipmentInput = z.infer<typeof UpdateShipmentSchema>;

export const ShipmentEventDtoSchema = z.object({
  id: z.string().uuid(),
  shipmentId: z.string().uuid(),
  status: OrderStatusSchema,
  note: z.string().nullable().optional(),
  actorId: z.string().uuid().nullable().optional(),
  createdAt: z.string().datetime(),
});
export type ShipmentEventDto = z.infer<typeof ShipmentEventDtoSchema>;
