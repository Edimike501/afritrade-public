import { z } from "zod";

export const UpsertLogisticsPartnerSchema = z.object({
  name: z.string().trim().min(2).max(160),
  countryCoverage: z.array(z.string().length(2).toUpperCase()).min(1),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().trim().max(32).optional(),
  notes: z.string().trim().max(500).optional(),
  isActive: z.boolean().optional(),
});
export type UpsertLogisticsPartnerInput = z.infer<typeof UpsertLogisticsPartnerSchema>;
