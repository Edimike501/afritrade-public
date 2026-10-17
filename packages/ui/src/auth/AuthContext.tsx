"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthResult, AuthUser } from "@afritrade/shared";
import { createApiClient, defaultApiClient, logoutUser, type ApiClient } from "../api/client";

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  signIn: (result: AuthResult) => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  updateUser: (updater: AuthUser | ((prev: AuthUser | null) => AuthUser | null)) => void;
  api: ApiClient;
}

const AuthContext = createContext<AuthState | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
  apiClient?: ApiClient;
  baseUrl?: string;
}

export function AuthProvider({ children, apiClient, baseUrl }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [api] = useState<ApiClient>(() =>
    apiClient ??
    (baseUrl
      ? createApiClient({
          baseUrl,
          onUnauthorized: () => {
            setUser(null);
            defaultApiClient.setToken(null);
          },
        })
      : defaultApiClient),
  );

  const refresh = useCallback(async () => {
    try {
      // Hydrate session on page reload using HttpOnly cookie rotation
      const refreshed = await api.refreshSession();
      if (refreshed?.user) {
        defaultApiClient.setToken(api.getToken());
        setUser(refreshed.user);
        return;
      }

      // If token is present in memory, fetch current user details
      if (api.getToken()) {
        const res = await api.get<AuthUser>("/users/me");
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      api.setToken(null);
      defaultApiClient.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = (r: AuthResult) => {
    api.setToken(r.accessToken);
    defaultApiClient.setToken(r.accessToken);
    setUser(r.user);
  };

  const signOut = async () => {
    try {
      await logoutUser(api);
    } catch {
      // Ignore network errors during sign out
    } finally {
      api.setToken(null);
      defaultApiClient.setToken(null);
      setUser(null);
    }
  };

  const updateUser = useCallback(
    (updater: AuthUser | ((prev: AuthUser | null) => AuthUser | null)) => {
      setUser((prev) => (typeof updater === "function" ? updater(prev) : updater));
    },
    [],
  );

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refresh, updateUser, api }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
