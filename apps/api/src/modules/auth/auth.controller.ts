import { Body, Controller, HttpCode, Post, Req, Res } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_PATH = "/api/v1/auth/refresh";
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

@Throttle({ default: { limit: 10, ttl: 60_000 } })
@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private setRefreshCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      path: REFRESH_COOKIE_PATH,
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });
  }

  private clearRefreshCookie(res: Response) {
    const isProd = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";
    res.clearCookie(REFRESH_COOKIE_NAME, {
      path: REFRESH_COOKIE_PATH,
      httpOnly: true,
      sameSite: isProd ? "strict" : "lax",
      secure: isProd,
    });
  }

  private getClientMeta(req: Request) {
    const userAgent = (req.headers["user-agent"] as string) || null;
    const ipAddress =
      ((req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip) ?? null;
    return { userAgent, ipAddress };
  }

  @Public()
  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const meta = this.getClientMeta(req);
    const { authResult, rawRefreshToken } = await this.auth.register(dto, meta);
    this.setRefreshCookie(res, rawRefreshToken);
    return authResult;
  }

  @Public()
  @HttpCode(200)
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const meta = this.getClientMeta(req);
    const { authResult, rawRefreshToken } = await this.auth.login(dto, meta);
    this.setRefreshCookie(res, rawRefreshToken);
    return authResult;
  }

  @Public()
  @HttpCode(200)
  @Post("admin/login")
  async adminLogin(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const meta = this.getClientMeta(req);
    const { authResult, rawRefreshToken } = await this.auth.adminLogin(dto, meta);
    this.setRefreshCookie(res, rawRefreshToken);
    return authResult;
  }

  @Public()
  @HttpCode(200)
  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const incomingToken = req.cookies?.[REFRESH_COOKIE_NAME];
    const meta = this.getClientMeta(req);
    try {
      const { refreshResult, newRawRefreshToken } = await this.auth.refresh(incomingToken, meta);
      this.setRefreshCookie(res, newRawRefreshToken);
      return refreshResult;
    } catch (err) {
      this.clearRefreshCookie(res);
      throw err;
    }
  }

  @Public()
  @HttpCode(204)
  @Post("logout")
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const incomingToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await this.auth.logout(incomingToken);
    this.clearRefreshCookie(res);
  }
}
