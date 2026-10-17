import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Role } from "@afritrade/shared";

export interface JwtUser {
  sub: string;
  role: Role;
}
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): JwtUser => {
  return ctx.switchToHttp().getRequest().user;
});
