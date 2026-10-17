import { defaultApiClient, type ApiClient } from "../client";
import { RegisterSchema, LoginSchema, type AuthResult, type LoginInput, type RegisterInput } from "@afritrade/shared";

/**
 * Registers a new buyer or supplier account.
 * Validates payload against RegisterSchema before sending.
 * Automatically saves the issued access token to the API client in-memory state.
 */
export async function registerUser(
  input: RegisterInput,
  client: ApiClient = defaultApiClient,
): Promise<AuthResult> {
  const validated = RegisterSchema.parse(input);
  const res = await client.post<AuthResult>("/auth/register", validated);
  client.setToken(res.data.accessToken);
  return res.data;
}

/**
 * Authenticates a user with email and pre-hashed password.
 * Validates payload against LoginSchema before sending.
 * Automatically saves the issued access token to the API client in-memory state.
 */
export async function loginUser(
  input: LoginInput,
  client: ApiClient = defaultApiClient,
): Promise<AuthResult> {
  const validated = LoginSchema.parse(input);
  const res = await client.post<AuthResult>("/auth/login", validated);
  client.setToken(res.data.accessToken);
  return res.data;
}

/**
 * Authenticates an administrator with email and pre-hashed password.
 * Only accepts accounts with Role.ADMIN.
 * Validates payload against LoginSchema before sending.
 * Automatically saves the issued access token to the API client in-memory state.
 */
export async function loginAdmin(
  input: LoginInput,
  client: ApiClient = defaultApiClient,
): Promise<AuthResult> {
  const validated = LoginSchema.parse(input);
  const res = await client.post<AuthResult>("/auth/admin/login", validated);
  client.setToken(res.data.accessToken);
  return res.data;
}

/**
 * Logs out the current user session and revokes the refresh token.
 */
export async function logoutUser(client: ApiClient = defaultApiClient): Promise<void> {
  try {
    await client.post<void>("/auth/logout");
  } finally {
    client.setToken(null);
  }
}

/**
 * Silently refreshes the user session via the HttpOnly cookie.
 */
export async function refreshUserSession(
  client: ApiClient = defaultApiClient,
): Promise<AuthResult | null> {
  const refreshRes = await client.refreshSession();
  if (!refreshRes) return null;
  return {
    accessToken: refreshRes.accessToken,
    user: refreshRes.user,
  };
}
