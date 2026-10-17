import { defaultApiClient, type ApiClient } from "../client";
import {
  SubmitKybSchema,
  UpdateBusinessDetailsSchema,
  UploadKybDocumentSchema,
  KybDecisionSchema,
  type SubmitKybInput,
  type UpdateBusinessDetailsInput,
  type UploadKybDocumentInput,
  type KybDecisionInput,
  type KybStatus,
  type KybDocumentDto,
  type SignedDocumentUrlDto,
} from "@afritrade/shared";

export interface BusinessProfileDto {
  id: string;
  userId: string;
  businessName: string;
  countryId: string;
  countryCode?: string;
  contactPhone: string | null;
  businessEmail?: string | null;
  businessAddress?: string | null;
  website?: string | null;
  description?: string | null;
  primaryCategory?: string | null;
  registrationNumberMasked?: string | null;
  taxIdMasked?: string | null;
  kybStatus: KybStatus;
  kybSubmittedAt?: string | null;
  kybReviewedBy?: string | null;
  kybReviewedAt?: string | null;
  kybRejectReason: string | null;
  activeListingsCount?: number;
  documents?: KybDocumentDto[];
}

export type {
  SubmitKybInput,
  UpdateBusinessDetailsInput,
  UploadKybDocumentInput,
  KybDecisionInput,
  KybDocumentDto,
  SignedDocumentUrlDto,
};

export async function getMyBusinessProfile(client: ApiClient = defaultApiClient): Promise<BusinessProfileDto> {
  const res = await client.get<BusinessProfileDto>("/business-profile/me");
  return res.data;
}

export async function submitBusinessProfile(
  input: SubmitKybInput,
  client: ApiClient = defaultApiClient,
): Promise<BusinessProfileDto> {
  const validated = SubmitKybSchema.parse(input);
  const res = await client.post<BusinessProfileDto>("/business-profile", validated);
  return res.data;
}

export async function updateKybSubmission(
  input: SubmitKybInput,
  client: ApiClient = defaultApiClient,
): Promise<BusinessProfileDto> {
  // Fail-fast client validation per RULES §10b & §20
  const validated = SubmitKybSchema.parse(input);
  const res = await client.put<BusinessProfileDto>("/business-profile/me/kyb", validated);
  return res.data;
}

export async function updateBusinessDetails(
  input: UpdateBusinessDetailsInput,
  client: ApiClient = defaultApiClient,
): Promise<BusinessProfileDto> {
  // Fail-fast client validation per RULES §10b & §20
  const validated = UpdateBusinessDetailsSchema.parse(input);
  const res = await client.patch<BusinessProfileDto>("/business-profile/me/details", validated);
  return res.data;
}

export async function uploadKybDocument(
  input: UploadKybDocumentInput,
  client: ApiClient = defaultApiClient,
): Promise<KybDocumentDto> {
  // Fail-fast client validation per RULES §10b & §20
  const validated = UploadKybDocumentSchema.parse(input);
  const res = await client.post<KybDocumentDto>("/business-profile/me/documents", validated);
  return res.data;
}

export async function deleteKybDocument(
  documentId: string,
  client: ApiClient = defaultApiClient,
): Promise<{ deleted: boolean; id: string }> {
  const res = await client.delete<{ deleted: boolean; id: string }>(
    `/business-profile/me/documents/${documentId}`,
  );
  return res.data;
}

export async function getSupplierKybDocumentSignedUrl(
  documentId: string,
  client: ApiClient = defaultApiClient,
): Promise<SignedDocumentUrlDto> {
  const res = await client.get<SignedDocumentUrlDto>(
    `/business-profile/me/documents/${documentId}/url`,
  );
  return res.data;
}

export async function getAdminKybQueue(
  status?: KybStatus,
  client: ApiClient = defaultApiClient,
): Promise<BusinessProfileDto[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await client.get<BusinessProfileDto[]>(`/admin/kyb${query}`);
  return res.data;
}

export async function getAdminBusinessProfile(
  profileId: string,
  client: ApiClient = defaultApiClient,
): Promise<BusinessProfileDto> {
  const res = await client.get<BusinessProfileDto>(`/admin/kyb/${profileId}`);
  return res.data;
}

export async function getAdminKybDocumentSignedUrl(
  documentId: string,
  client: ApiClient = defaultApiClient,
): Promise<SignedDocumentUrlDto> {
  const res = await client.get<SignedDocumentUrlDto>(`/admin/kyb/documents/${documentId}/url`);
  return res.data;
}

export async function reviewKybDecision(
  id: string,
  input: KybDecisionInput,
  client: ApiClient = defaultApiClient,
): Promise<BusinessProfileDto> {
  const validated = KybDecisionSchema.parse(input);
  const res = await client.post<BusinessProfileDto>(`/admin/kyb/${id}/decision`, validated);
  return res.data;
}
