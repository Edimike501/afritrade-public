import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { ErrorCode, KybStatus, Role, type AuthResult, type AuthUser, type LoginInput, type RefreshResult, type RegisterInput } from "@afritrade/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { TokenCacheService } from "./token-cache.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly users: UsersService,
    private readonly tokenCache: TokenCacheService,
  ) {}

  private async generateAccessToken(user: { id: string; role: string; email: string }): Promise<string> {
    return this.jwt.signAsync(
      { sub: user.id, role: user.role, email: user.email },
      { expiresIn: "15m" },
    );
  }

  async register(
    input: RegisterInput,
    clientMeta?: { userAgent?: string | null; ipAddress?: string | null },
  ): Promise<{ authResult: AuthResult; rawRefreshToken: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ConflictException({
        code: ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
        message: "Email is already registered",
      });
    }

    const country = await this.prisma.country.findUnique({ where: { isoCode: input.countryCode } });
    if (!country) {
      throw new NotFoundException({
        code: ErrorCode.GEO_COUNTRY_NOT_FOUND,
        message: `Country with ISO code ${input.countryCode} not found`,
      });
    }

    const defaultCurrency =
      country.isoCode === "NG" ? "NGN" : country.isoCode === "ZA" ? "ZAR" : country.isoCode === "GH" ? "GHS" : "USD";
    const targetCurrencyCode = input.preferredCurrency ?? defaultCurrency;
    const preferredCurrencyRecord = await this.prisma.currency.findUnique({
      where: { code: targetCurrencyCode },
    });

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        role: input.role,
        countryId: country.id,
        preferredCurrencyId: preferredCurrencyRecord?.id ?? null,
        businessProfile:
          input.role === "SUPPLIER"
            ? {
                create: {
                  businessName: input.fullName,
                  countryId: country.id,
                  kybStatus: KybStatus.NOT_SUBMITTED,
                },
              }
            : undefined,
      },
      include: { country: true, businessProfile: true, preferredCurrency: true },
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as unknown as Role,
      countryCode: country.isoCode,
      preferredCurrency: user.preferredCurrency?.code ?? targetCurrencyCode,
      kybStatus: (user.businessProfile?.kybStatus as unknown as KybStatus) ?? null,
    };

    const accessToken = await this.generateAccessToken(authUser);
    const rawRefreshToken = this.tokenCache.generateRawToken();

    await this.tokenCache.saveToken(user.id, rawRefreshToken, {
      userAgent: clientMeta?.userAgent,
      ipAddress: clientMeta?.ipAddress,
    });

    return {
      authResult: { accessToken, user: authUser },
      rawRefreshToken,
    };
  }

  async login(
    input: LoginInput,
    clientMeta?: { userAgent?: string | null; ipAddress?: string | null },
  ): Promise<{ authResult: AuthResult; rawRefreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      include: { country: true, businessProfile: true, preferredCurrency: true },
    });

    // Public login is strictly for Buyers and Suppliers; Admin accounts are rejected as invalid credentials
    if (!user || user.role === Role.ADMIN) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_INVALID_CREDENTIALS,
        message: "Invalid email or password",
      });
    }

    let valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      // 1. Fallback for raw input when DB stores bcrypt(sha256(pwd))
      const crypto = await import("node:crypto");
      const sha256Hex = crypto.createHash("sha256").update(input.password).digest("hex");
      valid = await bcrypt.compare(sha256Hex, user.passwordHash);
    }
    if (!valid) {
      // 2. Fallback for demo accounts strictly using Password123!
      const isDemoAccount =
        user.email.endsWith("@afritrade.test") || user.email.endsWith("@example.com");

      if (isDemoAccount) {
        const crypto = await import("node:crypto");
        const demoPwd = "Password123!";
        const demoSha = crypto.createHash("sha256").update(demoPwd).digest("hex");
        if (input.password === demoPwd || input.password === demoSha) {
          valid =
            (await bcrypt.compare(demoPwd, user.passwordHash)) ||
            (await bcrypt.compare(demoSha, user.passwordHash));
        }
      }

    if (!valid) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_INVALID_CREDENTIALS,
        message: "Invalid email or password",
      });
    }

    const countryIso = user.country?.isoCode ?? "";
    const defaultCurrency =
      countryIso === "NG" ? "NGN" : countryIso === "ZA" ? "ZAR" : countryIso === "GH" ? "GHS" : "USD";
    const preferredCurrency = user.preferredCurrency?.code ?? defaultCurrency;

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as unknown as Role,
      countryCode: countryIso,
      preferredCurrency,
      kybStatus: (user.businessProfile?.kybStatus as unknown as KybStatus) ?? null,
    };

    const accessToken = await this.generateAccessToken(authUser);
    const rawRefreshToken = this.tokenCache.generateRawToken();

    await this.tokenCache.saveToken(user.id, rawRefreshToken, {
      userAgent: clientMeta?.userAgent,
      ipAddress: clientMeta?.ipAddress,
    });

    return {
      authResult: { accessToken, user: authUser },
      rawRefreshToken,
    };
  }

  async adminLogin(
    input: LoginInput,
    clientMeta?: { userAgent?: string | null; ipAddress?: string | null },
  ): Promise<{ authResult: AuthResult; rawRefreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      include: { country: true, businessProfile: true, preferredCurrency: true },
    });

    // Admin portal login strictly permits ADMIN accounts; non-admins are rejected as invalid credentials
    if (!user || user.role !== Role.ADMIN) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_INVALID_CREDENTIALS,
        message: "Invalid email or password",
      });
    }

    let valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      const crypto = await import("node:crypto");
      const sha256Hex = crypto.createHash("sha256").update(input.password).digest("hex");
      valid = await bcrypt.compare(sha256Hex, user.passwordHash);
    }
    if (!valid) {
      const crypto = await import("node:crypto");
      const adminPwd = "Admin123!@#";
      const adminSha = crypto.createHash("sha256").update(adminPwd).digest("hex");
      if (input.password === adminPwd || input.password === adminSha) {
        valid =
          (await bcrypt.compare(adminPwd, user.passwordHash)) ||
          (await bcrypt.compare(adminSha, user.passwordHash));
      }
    }

    if (!valid) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_INVALID_CREDENTIALS,
        message: "Invalid email or password",
      });
    }

    const countryIso = user.country?.isoCode ?? "";
    const preferredCurrency = user.preferredCurrency?.code ?? "USD";

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: Role.ADMIN,
      countryCode: countryIso,
      preferredCurrency,
      kybStatus: null,
    };

    const accessToken = await this.generateAccessToken(authUser);
    const rawRefreshToken = this.tokenCache.generateRawToken();

    await this.tokenCache.saveToken(user.id, rawRefreshToken, {
      userAgent: clientMeta?.userAgent,
      ipAddress: clientMeta?.ipAddress,
    });

    return {
      authResult: { accessToken, user: authUser },
      rawRefreshToken,
    };
  }

  async refresh(
    rawRefreshToken: string,
    clientMeta?: { userAgent?: string | null; ipAddress?: string | null },
  ): Promise<{ refreshResult: RefreshResult; newRawRefreshToken: string }> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_TOKEN_INVALID,
        message: "Refresh token is missing",
      });
    }

    const { userId, newRawToken } = await this.tokenCache.rotateToken(rawRefreshToken, {
      userAgent: clientMeta?.userAgent,
      ipAddress: clientMeta?.ipAddress,
    });

    const user = await this.users.getAuthUser(userId);
    const accessToken = await this.generateAccessToken(user);

    return {
      refreshResult: { accessToken, user },
      newRawRefreshToken: newRawToken,
    };
  }

  async logout(rawRefreshToken?: string): Promise<void> {
    if (rawRefreshToken) {
      await this.tokenCache.revokeToken(rawRefreshToken);
    }
  }
}
