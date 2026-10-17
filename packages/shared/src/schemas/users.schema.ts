import { z } from "zod";
import { AuthUserSchema, type AuthUser } from "./auth.schema";
import { KybStatusSchema, RoleSchema } from "../types/enums";
import { KybDocumentDtoSchema } from "./business-profile.schema";

export const UpdateUserProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(120).optional(),
  preferredCurrency: z.enum(["NGN", "ZAR", "GHS", "USD"]).optional(),
});
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;

export const UserProfileDtoSchema = AuthUserSchema;
export type UserProfileDto = AuthUser;

export const AdminUsersQuerySchema = z.object({
  role: RoleSchema.optional(),
  countryCode: z.string().length(2).toUpperCase().optional(),
  kybStatus: KybStatusSchema.optional(),
  search: z.string().trim().max(120).optional(),
});
export type AdminUsersQueryInput = z.infer<typeof AdminUsersQuerySchema>;

export const AdminAttachedBusinessSummarySchema = z.object({
  id: z.string().uuid(),
  businessName: z.string(),
  countryCode: z.string(),
  contactPhone: z.string().nullable(),
  businessEmail: z.string().nullable().optional(),
  businessAddress: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  primaryCategory: z.string().nullable().optional(),
  registrationNumberMasked: z.string().nullable().optional(),
  taxIdMasked: z.string().nullable().optional(),
  kybStatus: KybStatusSchema,
  kybSubmittedAt: z.string().nullable().optional(),
  kybReviewedAt: z.string().nullable().optional(),
  kybRejectReason: z.string().nullable().optional(),
  activeListingsCount: z.number().int(),
  documentsCount: z.number().int(),
  documents: z.array(KybDocumentDtoSchema).optional(),
});
export type AdminAttachedBusinessSummary = z.infer<typeof AdminAttachedBusinessSummarySchema>;

export const AdminUserDtoSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string(),
  role: RoleSchema,
  countryCode: z.string(),
  preferredCurrency: z.string(),
  ordersCount: z.number().int(),
  createdAt: z.string(),
  businessProfile: AdminAttachedBusinessSummarySchema.nullable(),
});
export type AdminUserDto = z.infer<typeof AdminUserDtoSchema>;
