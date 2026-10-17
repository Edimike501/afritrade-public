import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import type { JwtUser } from "../decorators/current-user.decorator";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    const req = ctx.switchToHttp().getRequest();
    const header: string | undefined = req.headers?.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : undefined;

    if (!token) {
      if (isPublic) return true;
      throw new UnauthorizedException("Authentication required");
    }
    try {
      req.user = await this.jwt.verifyAsync<JwtUser>(token);
    } catch {
      if (isPublic) return true; // bad token on a public route: treat as anonymous
      throw new UnauthorizedException("Invalid or expired token");
    }
    return true;
  }
}
