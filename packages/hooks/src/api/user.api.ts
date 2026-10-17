import {
  UpdateUserPreferencesSchema,
  UpdateUserProfileSchema,
  type AdminUserDto,
  type AdminUsersQueryInput,
  type AuthUser,
  type UpdateUserPreferencesInput,
  type UpdateUserProfileInput,
  type UserProfileDto,
} from "@afritrade/shared";
import { defaultApiClient, type ApiClient } from "../client";

export type { AdminUserDto, AdminUsersQueryInput };

export async function getCurrentUser(client: ApiClient = defaultApiClient): Promise<AuthUser> {
  const res = await client.get<AuthUser>("/users/me");
  return res.data;
}

export async function getUserProfile(client: ApiClient = defaultApiClient): Promise<UserProfileDto> {
  const res = await client.get<UserProfileDto>("/users/profile");
  return res.data;
}

export async function updateUserProfile(
  input: UpdateUserProfileInput,
  client: ApiClient = defaultApiClient,
): Promise<UserProfileDto> {
  // Fail-fast client validation (RULES §10b, §20)
  const validated = UpdateUserProfileSchema.parse(input);
  const res = await client.patch<UserProfileDto>("/users/profile", validated);
  return res.data;
}

export async function updateUserPreferences(
  input: UpdateUserPreferencesInput,
  client: ApiClient = defaultApiClient,
): Promise<AuthUser> {
  // Fail-fast client validation (RULES §10b, §20)
  const validated = UpdateUserPreferencesSchema.parse(input);
  const res = await client.patch<AuthUser>("/users/me/preferences", validated);
  return res.data;
}

export async function getAdminUsers(
  filters: AdminUsersQueryInput = {},
  client: ApiClient = defaultApiClient,
): Promise<AdminUserDto[]> {
  const params = new URLSearchParams();
  if (filters.role) params.set("role", filters.role);
  if (filters.countryCode) params.set("countryCode", filters.countryCode);
  if (filters.kybStatus) params.set("kybStatus", filters.kybStatus);
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  const qs = params.toString();
  const res = await client.get<AdminUserDto[]>(`/admin/users${qs ? `?${qs}` : ""}`);
  return res.data;
}
