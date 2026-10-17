import type { ErrorCode } from "./error-codes";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: { page?: number; limit?: number; total?: number };
}

export interface ApiErrorShape {
  success: false;
  error: { code: ErrorCode; message: string; details?: unknown };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorShape;
