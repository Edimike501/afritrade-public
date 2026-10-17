import type { ApiResponse, AuthUser, RefreshResult } from "@afritrade/shared";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface Result<T> {
  data: T;
  meta?: { page?: number; limit?: number; total?: number };
}

export interface ApiClientConfig {
  baseUrl?: string;
  onUnauthorized?: () => void;
}

export function createApiClient(config: ApiClientConfig | string = {}) {
  const cfg = typeof config === "string" ? { baseUrl: config } : config;
  const envUrl =
    typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL
      : (
          globalThis as unknown as {
            process?: { env?: Record<string, string | undefined> };
          }
        ).process?.env?.NEXT_PUBLIC_API_URL;
  const isBrowser = typeof window !== "undefined";
  const defaultBase =
    isBrowser && !(typeof process !== "undefined" && process.env?.NEXT_PUBLIC_DIRECT_API === "true")
      ? "/api/v1"
      : envUrl
        ? `${envUrl}/api/v1`
        : "http://localhost:4040/api/v1";

  const BASE = cfg.baseUrl ?? defaultBase;

  // Strict In-Memory Access Token Storage (No browser Web Storage per RULES §18)
  let inMemoryToken: string | null = null;

  // Concurrency Queue for Silent Token Refresh & Session Hydration
  let refreshPromise: Promise<RefreshResult | null> | null = null;

  function getToken(): string | null {
    return inMemoryToken;
  }

  function setToken(token: string | null) {
    inMemoryToken = token;
  }

  async function refreshSession(): Promise<RefreshResult | null> {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE}/auth/refresh`, {
          method: "POST",
          cache: "no-store",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          signal:
            typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
              ? AbortSignal.timeout(10_000)
              : undefined,
        });

        if (!res.ok) {
          setToken(null);
          cfg.onUnauthorized?.();
          return null;
        }

        const json = (await res.json()) as ApiResponse<RefreshResult>;
        if (json.success && json.data?.accessToken) {
          setToken(json.data.accessToken);
          return json.data;
        }

        setToken(null);
        cfg.onUnauthorized?.();
        return null;
      } catch {
        setToken(null);
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  async function silentRefresh(): Promise<string | null> {
    const result = await refreshSession();
    return result?.accessToken ?? null;
  }

  async function apiRequest<T>(
    path: string,
    init: RequestInit = {},
    isRetry = false,
  ): Promise<Result<T>> {
    const token = getToken();
    let res: Response;

    const targetUrl =
      path.startsWith("/v1/") || path.startsWith("/v2/") || path.startsWith("/health")
        ? `${BASE.replace(/\/v1$/, "")}${path}`
        : `${BASE}${path}`;

    try {
      res = await fetch(targetUrl, {
        cache: "no-store",
        credentials: "include",
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...init.headers,
        },
      });
    } catch {
      throw new ApiError(
        "NETWORK",
        "Cannot reach the server. If it just woke up (free tier), retry in a few seconds.",
        0,
      );
    }

    // Intercept 401 Unauthorized for silent refresh (avoid looping on auth routes)
    if (res.status === 401 && !isRetry && !path.includes("/auth/")) {
      const newToken = await silentRefresh();
      if (newToken) {
        return apiRequest<T>(path, init, true);
      }
      throw new ApiError(
        "AUTH_UNAUTHORIZED",
        "Session expired. Please log in again.",
        401,
      );
    }

    const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
    if (!json) {
      throw new ApiError(
        "BAD_RESPONSE",
        "Unexpected server response",
        res.status,
      );
    }

    if (!json.success) {
      throw new ApiError(
        json.error.code,
        json.error.message,
        res.status,
        json.error.details,
      );
    }

    return { data: json.data, ...(json.meta ? { meta: json.meta } : {}) };
  }

  return {
    getToken,
    setToken,
    refreshSession,
    request: apiRequest,
    get: <T>(path: string) => apiRequest<T>(path),
    post: <T>(path: string, body?: unknown) =>
      apiRequest<T>(path, {
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    put: <T>(path: string, body: unknown) =>
      apiRequest<T>(path, { method: "PUT", body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) =>
      apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
    delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

export const defaultApiClient = createApiClient();
