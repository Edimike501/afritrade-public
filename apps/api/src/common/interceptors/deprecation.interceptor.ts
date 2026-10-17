import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Response } from "express";
import { Observable } from "rxjs";
import {
  DEPRECATED_ENDPOINT_KEY,
  DeprecatedEndpointOptions,
} from "../decorators/deprecated-endpoint.decorator";

/**
 * Interceptor implementing IETF deprecation header standards:
 * - Deprecation: true
 * - Sunset: <sunsetDate>
 * - Link: <{successorPath}>; rel="successor-version"
 *
 * Emits deprecation warnings in logs when legacy endpoints are invoked.
 */
@Injectable()
export class DeprecationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DeprecationInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const deprecatedOptions = this.reflector.getAllAndOverride<
      DeprecatedEndpointOptions | undefined
    >(DEPRECATED_ENDPOINT_KEY, [context.getHandler(), context.getClass()]);

    if (deprecatedOptions) {
      const http = context.switchToHttp();
      const res = http.getResponse<Response>();
      const req = http.getRequest();

      if (res && typeof res.setHeader === "function") {
        res.setHeader("Deprecation", "true");
        if (deprecatedOptions.sunsetDate) {
          res.setHeader("Sunset", deprecatedOptions.sunsetDate);
        }
        if (deprecatedOptions.successorPath) {
          res.setHeader("Link", `<${deprecatedOptions.successorPath}>; rel="successor-version"`);
        }
      }

      this.logger.warn(
        `Deprecated endpoint invoked: ${req?.method ?? "UNKNOWN"} ${
          req?.originalUrl ?? req?.url ?? ""
        }. Sunset: ${deprecatedOptions.sunsetDate ?? "unspecified"}. Successor: ${
          deprecatedOptions.successorPath ?? "none"
        }`,
      );
    }

    return next.handle();
  }
}
