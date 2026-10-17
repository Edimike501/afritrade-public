import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map } from "rxjs";
import { Paginated } from "./paginated";

/** Wraps every successful response in the shared ApiSuccess envelope. */
@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((result) =>
        result instanceof Paginated
          ? { success: true, data: result.data, meta: result.meta }
          : { success: true, data: result ?? null },
      ),
    );
  }
}
