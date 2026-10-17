import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthResult, RegisterInput } from "@afritrade/shared";
import { loginAdmin, loginUser, logoutUser, registerUser } from "../api/auth.api";
import { hashPassword } from "../utils/crypto";
import { userKeys } from "./user.hooks";

export interface RegisterCredentials extends Omit<RegisterInput, "password"> {
  password: string; // Plaintext from form, hashed inside hook before network transmission
}

export interface LoginCredentials {
  email: string;
  password: string; // Plaintext from form, hashed inside hook before network transmission
}

/**
 * Hook for registering a new user.
 * Hashes the password using SHA-256 before network transmission.
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials): Promise<AuthResult> => {
      const hashedPassword = await hashPassword(credentials.password);
      return registerUser({
        ...credentials,
        password: hashedPassword,
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.me(), data.user);
    },
  });
}

/**
 * Hook for authenticating a user.
 * Hashes the password using SHA-256 before network transmission.
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResult> => {
      const hashedPassword = await hashPassword(credentials.password);
      return loginUser({
        email: credentials.email,
        password: hashedPassword,
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.me(), data.user);
    },
  });
}

/**
 * Hook for authenticating an administrator.
 * Hashes the password using SHA-256 before network transmission.
 */
export function useAdminLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResult> => {
      const hashedPassword = await hashPassword(credentials.password);
      return loginAdmin({
        email: credentials.email,
        password: hashedPassword,
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.me(), data.user);
    },
  });
}

/**
 * Hook for terminating a user session.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await logoutUser();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
