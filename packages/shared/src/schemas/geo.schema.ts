import { z } from "zod";

export const CountrySchema = z.object({ id: z.string(), name: z.string(), isoCode: z.string() });
export type CountryDto = z.infer<typeof CountrySchema>;

export const CurrencySchema = z.object({ id: z.string(), code: z.string(), isLive: z.boolean() });
export type CurrencyDto = z.infer<typeof CurrencySchema>;
