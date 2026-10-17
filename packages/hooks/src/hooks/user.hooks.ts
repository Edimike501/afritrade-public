import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminUsers,
  getCurrentUser,
  getUserProfile,
  updateUserPreferences,
  updateUserProfile,
} from "../api/user.api";
import type {
  AdminUsersQueryInput,
  UpdateUserPreferencesInput,
  UpdateUserProfileInput,
} from "@afritrade/shared";
import { dashboardKeys } from "./dashboard.hooks";

export const userKeys = {
  all: ["user"] as const,
  me: () => [...userKeys.all, "me"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  adminList: (filters?: AdminUsersQueryInput) =>
    [...userKeys.all, "admin", "list", filters ?? {}] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => getCurrentUser(),
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => getUserProfile(),
  });
}

export function useAdminUsers(filters?: AdminUsersQueryInput) {
  return useQuery({
    queryKey: userKeys.adminList(filters),
    queryFn: () => getAdminUsers(filters),
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserProfileInput) => updateUserProfile(input),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      queryClient.setQueryData(userKeys.me(), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserPreferencesInput) => updateUserPreferences(input),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.me(), updatedUser);
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
