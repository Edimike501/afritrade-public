import { z } from "zod";
import { SelfRegistrableRoleSchema, RoleSchema, KybStatusSchema } from "../types/enums";

export const RegisterSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(72),
  fullName: z.string().trim().min(2).max(120),
  role: SelfRegistrableRoleSchema, // ADMIN is never self-registrable
  countryCode: z.string().length(2).toUpperCase(), // ISO alpha-2, validated against `countries` table
  preferredCurrency: z.enum(["NGN", "ZAR", "GHS", "USD"]).optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  role: RoleSchema,
  countryCode: z.string(),
  preferredCurrency: z.string().default("USD"),
  kybStatus: KybStatusSchema.nullable(),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export const UpdateUserPreferencesSchema = z.object({
  preferredCurrency: z.enum(["NGN", "ZAR", "GHS", "USD"]),
});
export type UpdateUserPreferencesInput = z.infer<typeof UpdateUserPreferencesSchema>;

export interface AuthResult {
  accessToken: string;
  user: AuthUser;
}

export interface RefreshResult {
  accessToken: string;
  user: AuthUser;
}

export const TokenMetadataSchema = z.object({
  userId: z.string(),
  familyId: z.string(),
  userAgent: z.string().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type TokenMetadata = z.infer<typeof TokenMetadataSchema>;

