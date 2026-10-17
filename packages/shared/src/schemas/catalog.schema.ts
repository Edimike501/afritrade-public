import { z } from "zod";
import { PaginatedQuerySchema } from "../validation/pagination";

/** Suggested categories for seed data / UI filter. Category is free text in the DB. */
export const PRODUCT_CATEGORIES = [
  "Agriculture",
  "Textiles",
  "Manufacturing",
  "Electronics",
  "Food & Beverage",
  "Building Materials",
] as const;

const price = z
  .string()
  .regex(/^\d{1,12}(\.\d{1,2})?$/, "Price must be a positive decimal with up to 2 decimals");

export const CreateProductSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(2).max(2000),
  category: z.string().trim().min(2).max(60),
  price,
  currencyCode: z.string().length(3).toUpperCase(),
  imageUrl: z.string().url().optional(),
});
export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  imageUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

export const ProductQuerySchema = PaginatedQuerySchema.extend({
  country: z.string().length(2).toUpperCase().optional(),
  category: z.string().optional(),
  q: z.string().trim().max(80).optional(),
});
export type ProductQuery = z.infer<typeof ProductQuerySchema>;
