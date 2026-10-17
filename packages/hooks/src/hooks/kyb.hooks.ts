import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyBusinessProfile,
  submitBusinessProfile,
  updateKybSubmission,
  updateBusinessDetails,
  uploadKybDocument,
  deleteKybDocument,
  getSupplierKybDocumentSignedUrl,
  getAdminKybQueue,
  getAdminBusinessProfile,
  getAdminKybDocumentSignedUrl,
  reviewKybDecision,
  type SubmitKybInput,
  type UpdateBusinessDetailsInput,
  type UploadKybDocumentInput,
  type KybDecisionInput,
} from "../api/kyb.api";
import type { KybStatus } from "@afritrade/shared";
import { dashboardKeys } from "./dashboard.hooks";
import { userKeys } from "./user.hooks";

export const kybKeys = {
  all: ["kyb"] as const,
  mine: () => [...kybKeys.all, "me"] as const,
  adminQueue: (status?: KybStatus) =>
    status ? ([...kybKeys.all, "admin", status] as const) : ([...kybKeys.all, "admin"] as const),
  adminProfile: (id: string) => [...kybKeys.all, "admin", "profile", id] as const,
};

export function useMyBusinessProfile() {
  return useQuery({
    queryKey: kybKeys.mine(),
    queryFn: () => getMyBusinessProfile(),
  });
}

export function useAdminKybQueue(status?: KybStatus) {
  return useQuery({
    queryKey: kybKeys.adminQueue(status),
    queryFn: () => getAdminKybQueue(status),
  });
}

export function useAdminBusinessProfile(profileId: string | null) {
  return useQuery({
    queryKey: kybKeys.adminProfile(profileId ?? "none"),
    queryFn: () => getAdminBusinessProfile(profileId!),
    enabled: Boolean(profileId),
  });
}

export function useSubmitBusinessProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitKybInput) => submitBusinessProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kybKeys.mine() });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useUpdateKybSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitKybInput) => updateKybSubmission(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kybKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useUpdateBusinessDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateBusinessDetailsInput) => updateBusinessDetails(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kybKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useUploadKybDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UploadKybDocumentInput) => uploadKybDocument(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kybKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useDeleteKybDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteKybDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kybKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useSupplierKybDocumentSignedUrl() {
  return useMutation({
    mutationFn: (documentId: string) => getSupplierKybDocumentSignedUrl(documentId),
  });
}

export function useAdminKybDocumentSignedUrl() {
  return useMutation({
    mutationFn: (documentId: string) => getAdminKybDocumentSignedUrl(documentId),
  });
}

export function useReviewKybDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: KybDecisionInput }) =>
      reviewKybDecision(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kybKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
