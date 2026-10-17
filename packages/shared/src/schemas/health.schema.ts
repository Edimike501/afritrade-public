import { z } from "zod";

export const HealthSchema = z.object({ status: z.literal("ok"), commit: z.string() });
export type HealthResponse = z.infer<typeof HealthSchema>;
