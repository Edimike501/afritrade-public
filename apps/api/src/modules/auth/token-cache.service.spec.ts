import { ConfigService } from "@nestjs/config";
import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { TokenCacheService } from "./token-cache.service";

describe("TokenCacheService", () => {
  let service: TokenCacheService;

  beforeEach(async () => {
    const configService = {
      get: jest.fn((key: string, defaultVal: any) => defaultVal),
    } as unknown as ConfigService;

    service = new TokenCacheService(configService);
    // Don't connect to real redis in test; will use in-memory fallback
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it("hashes token with SHA-256 and stores metadata", async () => {
    const rawToken = "test_raw_refresh_token_123";
    const expectedHash = service.hashToken(rawToken);

    const result = await service.saveToken("user-1", rawToken, {
      userAgent: "Mozilla/5.0",
      ipAddress: "127.0.0.1",
    });

    expect(result.tokenHash).toBe(expectedHash);
    expect(result.familyId).toBeDefined();
  });

  it("rotates token on valid refresh (RTR)", async () => {
    const initialRawToken = "initial_token_abc";
    const { familyId } = await service.saveToken("user-1", initialRawToken, {
      userAgent: "TestAgent",
      ipAddress: "10.0.0.1",
    });

    const rotation = await service.rotateToken(initialRawToken, {
      userAgent: "TestAgent",
      ipAddress: "10.0.0.1",
    });

    expect(rotation.userId).toBe("user-1");
    expect(rotation.familyId).toBe(familyId);
    expect(rotation.newRawToken).not.toBe(initialRawToken);
  });

  it("triggers automatic reuse detection and revokes family when a spent token is replayed", async () => {
    const initialRawToken = "initial_token_abc";
    await service.saveToken("user-1", initialRawToken);

    // First rotation (valid consumption)
    const firstRotation = await service.rotateToken(initialRawToken);
    expect(firstRotation.newRawToken).toBeDefined();

    // Replay attack: client attempts to refresh using the already-consumed initialRawToken
    await expect(service.rotateToken(initialRawToken)).rejects.toThrow(ForbiddenException);

    // The newly rotated token in the same family must also be dead after reuse detection
    await expect(service.rotateToken(firstRotation.newRawToken)).rejects.toThrow(UnauthorizedException);
  });

  it("triggers reuse detection if family active token does not match", async () => {
    const raw1 = "token_1";
    const { familyId } = await service.saveToken("user-1", raw1);

    // Another token with same familyId manually saved (simulating an active branch)
    const raw2 = "token_2";
    await service.saveToken("user-1", raw2, { familyId });

    // Now if raw1 is presented (since active token is raw2's hash), it triggers breach detection
    await expect(service.rotateToken(raw1)).rejects.toThrow(ForbiddenException);
  });

  it("revokes token and family on logout", async () => {
    const raw = "logout_token";
    await service.saveToken("user-1", raw);

    await service.revokeToken(raw);

    await expect(service.rotateToken(raw)).rejects.toThrow(UnauthorizedException);
  });
});
