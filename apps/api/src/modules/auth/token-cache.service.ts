import { Injectable, Logger, OnModuleDestroy, OnModuleInit, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import crypto from "crypto";
import Redis from "ioredis";
import { ErrorCode } from "@afritrade/shared";

export interface StoredTokenMetadata {
  userId: string;
  familyId: string;
  tokenHash: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

@Injectable()
export class TokenCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TokenCacheService.name);
  private redis: Redis | null = null;
  private readonly fallbackMemory = new Map<string, { value: string; expiresAt: number }>();
  private readonly ttlSeconds: number;

  constructor(private readonly config: ConfigService) {
    const days = this.config.get<number>("REFRESH_TOKEN_EXPIRES_DAYS", 7);
    this.ttlSeconds = days * 24 * 60 * 60;
  }

  async onModuleInit() {
    const redisUrl = this.config.get<string>("REDIS_URL", "redis://localhost:6379");
    try {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 2,
        retryStrategy: (times) => {
          if (times > 3) return null;
          return Math.min(times * 100, 1000);
        },
      });

      this.redis.on("error", (err) => {
        this.logger.warn(`Redis connection warning: ${err.message}. Using fallback if unavailable.`);
      });
    } catch (err: any) {
      this.logger.warn(`Failed to initialize Redis client: ${err.message}. Using in-memory fallback.`);
      this.redis = null;
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit().catch(() => {});
      this.redis = null;
    }
  }

  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  generateRawToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  private async cacheSet(key: string, value: string, ttlSec: number): Promise<void> {
    if (this.redis && this.redis.status === "ready") {
      try {
        await this.redis.set(key, value, "EX", ttlSec);
        return;
      } catch (err: any) {
        this.logger.warn(`Redis set failed: ${err.message}. Falling back to memory.`);
      }
    }
    this.fallbackMemory.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
  }

  private async cacheGet(key: string): Promise<string | null> {
    if (this.redis && this.redis.status === "ready") {
      try {
        return await this.redis.get(key);
      } catch (err: any) {
        this.logger.warn(`Redis get failed: ${err.message}. Falling back to memory.`);
      }
    }
    const item = this.fallbackMemory.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.fallbackMemory.delete(key);
      return null;
    }
    return item.value;
  }

  private async cacheDel(key: string): Promise<void> {
    if (this.redis && this.redis.status === "ready") {
      try {
        await this.redis.del(key);
      } catch (err: any) {
        this.logger.warn(`Redis del failed: ${err.message}.`);
      }
    }
    this.fallbackMemory.delete(key);
  }

  /**
   * Saves a newly created refresh token with SHA-256 hash and metadata.
   */
  async saveToken(
    userId: string,
    rawToken: string,
    options?: { familyId?: string; userAgent?: string | null; ipAddress?: string | null },
  ): Promise<{ tokenHash: string; familyId: string }> {
    const tokenHash = this.hashToken(rawToken);
    const familyId = options?.familyId ?? crypto.randomUUID();

    const metadata: StoredTokenMetadata = {
      userId,
      familyId,
      tokenHash,
      userAgent: options?.userAgent ?? null,
      ipAddress: options?.ipAddress ?? null,
      createdAt: new Date().toISOString(),
    };

    await this.cacheSet(`auth:token:${tokenHash}`, JSON.stringify(metadata), this.ttlSeconds);
    await this.cacheSet(`auth:family:${familyId}`, tokenHash, this.ttlSeconds);

    return { tokenHash, familyId };
  }

  /**
   * Validates an incoming refresh token, performs single-use rotation (RTR),
   * and triggers reuse detection if a spent or mismatched token is presented.
   */
  async rotateToken(
    incomingRawToken: string,
    options?: { userAgent?: string | null; ipAddress?: string | null },
  ): Promise<{ userId: string; newRawToken: string; familyId: string }> {
    const incomingHash = this.hashToken(incomingRawToken);
    const tokenDataStr = await this.cacheGet(`auth:token:${incomingHash}`);

    if (!tokenDataStr) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_TOKEN_INVALID,
        message: "Invalid or expired refresh token",
      });
    }

    const tokenData: StoredTokenMetadata = JSON.parse(tokenDataStr);
    const currentActiveHash = await this.cacheGet(`auth:family:${tokenData.familyId}`);

    // REUSE DETECTION:
    // If the active token in this family does not match the incoming token,
    // a previously spent or superseded token is being replayed.
    if (!currentActiveHash || currentActiveHash !== incomingHash) {
      this.logger.error(
        `Refresh token reuse detected for user ${tokenData.userId} (family ${tokenData.familyId}). Purging session.`,
      );
      // Immediately invalidate the entire family to protect the user
      await this.cacheDel(`auth:family:${tokenData.familyId}`);
      await this.cacheDel(`auth:token:${incomingHash}`);
      if (currentActiveHash) {
        await this.cacheDel(`auth:token:${currentActiveHash}`);
      }

      throw new ForbiddenException({
        code: ErrorCode.AUTH_TOKEN_INVALID,
        message: "Token reuse detected. All sessions in this family have been invalidated. Please log in again.",
      });
    }

    // Keep auth:token:${incomingHash} in cache for its TTL so replaying a spent token
    // resolves its familyId and triggers the reuse detection block above.
    // Issue new token in the same family (updates auth:family:${familyId} to newTokenHash).
    const newRawToken = this.generateRawToken();
    await this.saveToken(tokenData.userId, newRawToken, {
      familyId: tokenData.familyId,
      userAgent: options?.userAgent ?? tokenData.userAgent,
      ipAddress: options?.ipAddress ?? tokenData.ipAddress,
    });

    return {
      userId: tokenData.userId,
      newRawToken,
      familyId: tokenData.familyId,
    };
  }

  /**
   * Revokes a refresh token and its family on logout.
   */
  async revokeToken(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    const tokenDataStr = await this.cacheGet(`auth:token:${tokenHash}`);
    if (tokenDataStr) {
      try {
        const tokenData: StoredTokenMetadata = JSON.parse(tokenDataStr);
        await this.cacheDel(`auth:family:${tokenData.familyId}`);
      } catch {
        // Ignore cache parsing failure
      }
    }
    await this.cacheDel(`auth:token:${tokenHash}`);
  }
}
