import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import type { Response } from "express";

/** Every error leaves the API in the shared ApiErrorShape envelope. */
@Catch()
export class ApiResponseFilter implements ExceptionFilter {
  private readonly logger = new Logger("Errors");

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const isHttp = exception instanceof HttpException;
    const rawErr =
      typeof exception === "object" && exception !== null
        ? (exception as { status?: number; statusCode?: number; type?: string; message?: string })
        : null;
    const isPayloadTooLarge =
      rawErr?.type === "entity.too.large" || rawErr?.status === 413 || rawErr?.statusCode === 413;
    const status = isHttp ? exception.getStatus() : isPayloadTooLarge ? 413 : 500;
    if (!isHttp && !isPayloadTooLarge) this.logger.error(exception);

    const body = isHttp ? exception.getResponse() : undefined;
    const bodyObj = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : null;

    const code =
      (bodyObj?.code as string) ||
      (status === 400
        ? "VALIDATION_FAILED"
        : status === 401
          ? "AUTH_UNAUTHORIZED"
          : status === 403
            ? "AUTH_FORBIDDEN"
            : status === 404
              ? "RESOURCE_NOT_FOUND"
              : status === 413
                ? "KYB_DOCUMENT_TOO_LARGE"
                : status === 429
                  ? "RATE_LIMIT_EXCEEDED"
                  : "INTERNAL_SERVER_ERROR");

    const message =
      (typeof bodyObj?.message === "string" ? bodyObj.message : undefined) ||
      (isHttp
        ? exception.message
        : isPayloadTooLarge
          ? "Payload exceeds maximum allowed size"
          : "Internal server error");

    res.status(status).json({
      success: false,
      error: {
        code,
        message,
        ...(bodyObj && "errors" in bodyObj ? { details: bodyObj.errors } : {}),
      },
    });
  }
}
