import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { Role, SelfRegistrableRole } from "@afritrade/shared";
import { AuthService } from "./auth.service";
import { TokenCacheService } from "./token-cache.service";
import { PrismaService } from "../../prisma/prisma.service";
import { UsersService } from "../users/users.service";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;
  let users: any;
  let tokenCache: any;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      country: {
        findUnique: jest.fn(),
      },
      currency: {
        findUnique: jest.fn(),
      },
    };
    jwt = {
      signAsync: jest.fn().mockResolvedValue("mock_access_token_jwt"),
    };
    users = {
      getAuthUser: jest.fn(),
    };
    tokenCache = {
      generateRawToken: jest.fn().mockReturnValue("mock_raw_refresh_token"),
      saveToken: jest.fn().mockResolvedValue({ tokenHash: "hash123", familyId: "fam123" }),
      rotateToken: jest.fn().mockResolvedValue({ userId: "u-123", newRawToken: "new_raw_token" }),
      revokeToken: jest.fn().mockResolvedValue(undefined),
    };

    service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as unknown as JwtService,
      users as unknown as UsersService,
      tokenCache as unknown as TokenCacheService,
    );
  });

  describe("login", () => {
    it("successfully logs in with valid credentials and issues tokens", async () => {
      const passwordHash = await bcrypt.hash("validpassword", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "u-123",
        email: "test@example.com",
        passwordHash,
        fullName: "Test User",
        role: "BUYER",
        country: { isoCode: "NG" },
        businessProfile: null,
      });

      const result = await service.login(
        { email: "test@example.com", password: "validpassword" },
        { userAgent: "Agent", ipAddress: "127.0.0.1" },
      );

      expect(result.authResult.accessToken).toBe("mock_access_token_jwt");
      expect(result.authResult.user.email).toBe("test@example.com");
      expect(result.rawRefreshToken).toBe("mock_raw_refresh_token");
      expect(tokenCache.saveToken).toHaveBeenCalledWith(
        "u-123",
        "mock_raw_refresh_token",
        expect.objectContaining({ userAgent: "Agent", ipAddress: "127.0.0.1" }),
      );
    });

    it("throws UnauthorizedException when an ADMIN user attempts to log in via public login", async () => {
      const passwordHash = await bcrypt.hash("adminpassword", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "admin-1",
        email: "admin@afritrade.test",
        passwordHash,
        fullName: "Platform Admin",
        role: "ADMIN",
        country: { isoCode: "NG" },
        businessProfile: null,
      });

      await expect(
        service.login({ email: "admin@afritrade.test", password: "adminpassword" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("throws UnauthorizedException on invalid password", async () => {
      const passwordHash = await bcrypt.hash("correctpass", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "u-123",
        email: "test@example.com",
        passwordHash,
        role: "BUYER",
      });

      await expect(
        service.login({ email: "test@example.com", password: "wrongpassword" }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("adminLogin", () => {
    it("successfully logs in an ADMIN account and issues tokens", async () => {
      const passwordHash = await bcrypt.hash("adminpassword", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "admin-1",
        email: "admin@afritrade.test",
        passwordHash,
        fullName: "Platform Admin",
        role: "ADMIN",
        country: { isoCode: "NG" },
        businessProfile: null,
        preferredCurrency: { code: "USD" },
      });

      const result = await service.adminLogin(
        { email: "admin@afritrade.test", password: "adminpassword" },
        { userAgent: "AdminBrowser", ipAddress: "127.0.0.1" },
      );

      expect(result.authResult.accessToken).toBe("mock_access_token_jwt");
      expect(result.authResult.user.role).toBe(Role.ADMIN);
      expect(result.rawRefreshToken).toBe("mock_raw_refresh_token");
      expect(tokenCache.saveToken).toHaveBeenCalledWith(
        "admin-1",
        "mock_raw_refresh_token",
        expect.objectContaining({ userAgent: "AdminBrowser", ipAddress: "127.0.0.1" }),
      );
    });

    it("rejects non-admin users attempting to log in via adminLogin", async () => {
      const passwordHash = await bcrypt.hash("buyerpass", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "buyer-1",
        email: "buyer@example.com",
        passwordHash,
        role: "BUYER",
      });

      await expect(
        service.adminLogin({ email: "buyer@example.com", password: "buyerpass" }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("register", () => {
    it("throws ConflictException if email exists", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "existing-id" });

      await expect(
        service.register({
          email: "exists@example.com",
          password: "password123",
          fullName: "User",
          role: SelfRegistrableRole.BUYER,
          countryCode: "NG",
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("successfully registers a user with preferredCurrencyId and issues tokens", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.country.findUnique.mockResolvedValue({ id: "c-ng", isoCode: "NG", name: "Nigeria" });
      prisma.currency.findUnique.mockResolvedValue({ id: "cur-ngn", code: "NGN" });
      prisma.user.create.mockResolvedValue({
        id: "u-new",
        email: "newbuyer@example.com",
        fullName: "New Buyer",
        role: "BUYER",
        countryId: "c-ng",
        preferredCurrencyId: "cur-ngn",
        country: { isoCode: "NG" },
        preferredCurrency: { code: "NGN" },
        businessProfile: null,
      });

      const result = await service.register(
        {
          email: "newbuyer@example.com",
          password: "password123",
          fullName: "New Buyer",
          role: SelfRegistrableRole.BUYER,
          countryCode: "NG",
        },
        { userAgent: "Browser", ipAddress: "127.0.0.1" },
      );

      expect(prisma.currency.findUnique).toHaveBeenCalledWith({ where: { code: "NGN" } });
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "newbuyer@example.com",
            countryId: "c-ng",
            preferredCurrencyId: "cur-ngn",
          }),
        }),
      );
      expect(result.authResult.accessToken).toBe("mock_access_token_jwt");
      expect(result.authResult.user.preferredCurrency).toBe("NGN");
      expect(result.rawRefreshToken).toBe("mock_raw_refresh_token");
    });
  });

  describe("refresh", () => {
    it("rotates refresh token and generates new access token", async () => {
      users.getAuthUser.mockResolvedValue({
        id: "u-123",
        email: "refreshed@example.com",
        fullName: "User",
        role: Role.BUYER,
        countryCode: "NG",
        preferredCurrency: "NGN",
        kybStatus: null,
      });

      const result = await service.refresh("incoming_token", {
        userAgent: "NewAgent",
        ipAddress: "127.0.0.1",
      });

      expect(tokenCache.rotateToken).toHaveBeenCalledWith("incoming_token", {
        userAgent: "NewAgent",
        ipAddress: "127.0.0.1",
      });
      expect(result.refreshResult.accessToken).toBe("mock_access_token_jwt");
      expect(result.newRawRefreshToken).toBe("new_raw_token");
    });
  });

  describe("logout", () => {
    it("calls tokenCache.revokeToken", async () => {
      await service.logout("token_to_revoke");
      expect(tokenCache.revokeToken).toHaveBeenCalledWith("token_to_revoke");
    });
  });
});
