import { z } from "zod";
import { KybDocumentTypeSchema, KybStatusSchema } from "../types/enums";

export const ALLOWED_KYB_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_KYB_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const SubmitKybSchema = z.object({
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters").max(160),
  countryCode: z.string().length(2).toUpperCase(),
  contactPhone: z.string().trim().max(32).optional(),
  registrationNumber: z.string().trim().max(64).optional(),
  taxId: z.string().trim().max(64).optional(),
  businessAddress: z.string().trim().max(250).optional(),
  primaryCategory: z.string().trim().max(120).optional(),
});
export type SubmitKybInput = z.infer<typeof SubmitKybSchema>;

export const UpdateBusinessDetailsSchema = z.object({
  contactPhone: z.string().trim().max(32).optional(),
  businessEmail: z.string().trim().email("Invalid business email").max(160).optional().or(z.literal("")),
  businessAddress: z.string().trim().max(250).optional(),
  website: z.string().trim().url("Invalid website URL").max(200).optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional(),
  primaryCategory: z.string().trim().max(120).optional(),
});
export type UpdateBusinessDetailsInput = z.infer<typeof UpdateBusinessDetailsSchema>;

export const UploadKybDocumentSchema = z.object({
  documentType: KybDocumentTypeSchema,
  fileName: z.string().trim().min(1, "File name is required").max(200),
  mimeType: z.enum(ALLOWED_KYB_MIME_TYPES, {
    message: "Only PDF, JPEG, PNG, and WEBP files are permitted",
  }),
  fileSizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_KYB_DOCUMENT_SIZE_BYTES, "Document size must not exceed 10 MB"),
  fileBase64: z.string().optional(),
});
export type UploadKybDocumentInput = z.infer<typeof UploadKybDocumentSchema>;

export const KybDocumentDtoSchema = z.object({
  id: z.string().uuid(),
  businessProfileId: z.string().uuid(),
  documentType: KybDocumentTypeSchema,
  fileName: z.string(),
  mimeType: z.string(),
  fileSizeBytes: z.number().int(),
  createdAt: z.string(),
});
export type KybDocumentDto = z.infer<typeof KybDocumentDtoSchema>;

export const SignedDocumentUrlDtoSchema = z.object({
  documentId: z.string().uuid(),
  fileName: z.string(),
  mimeType: z.string(),
  signedUrl: z.string(),
  expiresAt: z.string(),
  storageMode: z.enum(["simulated", "r2"]),
});
export type SignedDocumentUrlDto = z.infer<typeof SignedDocumentUrlDtoSchema>;

export const BusinessProfileResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  businessName: z.string(),
  countryId: z.string(),
  countryCode: z.string().optional(),
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
  kybReviewedBy: z.string().nullable().optional(),
  kybReviewedAt: z.string().nullable().optional(),
  kybRejectReason: z.string().nullable(),
  documents: z.array(KybDocumentDtoSchema).optional(),
});

export const KybDecisionSchema = z
  .object({
    decision: z.enum(["APPROVE", "REJECT", "PENDING"]),
    reason: z.string().trim().min(3).max(500).optional(),
  })
  .refine((d) => d.decision !== "REJECT" || (!!d.reason && d.reason.length >= 3), {
    message: "reason is required to reject",
    path: ["reason"],
  });
export type KybDecisionInput = z.infer<typeof KybDecisionSchema>;
