import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, createHmac } from "crypto";
import { ErrorCode } from "@afritrade/shared";
import type { Env } from "../../config/env.validation";

export interface StoredDocumentResult {
  objectKey: string;
  storageMode: "simulated" | "r2";
}

export interface SignedUrlResult {
  signedUrl: string;
  expiresAt: string;
  storageMode: "simulated" | "r2";
}

/**
 * Cloudflare R2 (S3-Compatible) Private Storage Service (RULES §3 & §9).
 * - In `STORAGE_MODE=r2`, uses AWS Signature V4 (`s3` service, `auto` region) against
 *   Cloudflare R2's free-tier S3 API (`https://<accountId>.r2.cloudflarestorage.com`)
 *   to store private objects and generate short-lived (5-minute) presigned GET URLs.
 * - In `STORAGE_MODE=simulated` (default for local dev/CI), stores small document payloads
 *   in-memory or generates deterministic short-lived signed data preview URLs so full E2E
 *   verification works with zero external network calls.
 * - Never exposes public object URLs.
 */
@Injectable()
export class R2StorageService {
  private readonly simulatedStore = new Map<string, { mimeType: string; base64: string }>();

  constructor(private readonly config: ConfigService<Env, true>) {}

  getStorageMode(): "simulated" | "r2" {
    return this.config.get("STORAGE_MODE", { infer: true }) ?? "simulated";
  }

  async uploadPrivateObject(params: {
    objectKey: string;
    mimeType: string;
    fileBase64?: string;
  }): Promise<StoredDocumentResult> {
    const mode = this.getStorageMode();

    if (mode === "simulated") {
      this.simulatedStore.set(params.objectKey, {
        mimeType: params.mimeType,
        base64: params.fileBase64 || "",
      });
      return { objectKey: params.objectKey, storageMode: "simulated" };
    }

    const accountId = this.config.get("R2_ACCOUNT_ID", { infer: true })!;
    const accessKeyId = this.config.get("R2_ACCESS_KEY_ID", { infer: true })!;
    const secretAccessKey = this.config.get("R2_SECRET_ACCESS_KEY", { infer: true })!;
    const bucket = this.config.get("R2_BUCKET_NAME", { infer: true })!;
    const endpoint =
      this.config.get("R2_ENDPOINT", { infer: true }) ||
      `https://${accountId}.r2.cloudflarestorage.com`;

    try {
      const bodyBuffer = params.fileBase64
        ? Buffer.from(
            params.fileBase64.replace(/^data:[^;]+;base64,/, ""),
            "base64",
          )
        : Buffer.from(`AfriTrade KYB Document: ${params.objectKey}`, "utf-8");

      const putUrl = this.createPresignedS3Url({
        method: "PUT",
        endpoint,
        bucket,
        objectKey: params.objectKey,
        accessKeyId,
        secretAccessKey,
        expiresInSeconds: 300,
      });

      const response = await fetch(putUrl, {
        method: "PUT",
        headers: {
          "Content-Type": params.mimeType,
          "Content-Length": String(bodyBuffer.byteLength),
        },
        body: bodyBuffer,
      });

      if (!response.ok) {
        throw new Error(`R2 PUT failed with status ${response.status}`);
      }

      return { objectKey: params.objectKey, storageMode: "r2" };
    } catch {
      throw new InternalServerErrorException({
        code: ErrorCode.STORAGE_PRESIGN_FAILED,
        message: "Failed to upload document to private Cloudflare R2 storage",
      });
    }
  }

  async deletePrivateObject(objectKey: string): Promise<void> {
    const mode = this.getStorageMode();
    if (mode === "simulated") {
      this.simulatedStore.delete(objectKey);
      return;
    }

    const accountId = this.config.get("R2_ACCOUNT_ID", { infer: true })!;
    const accessKeyId = this.config.get("R2_ACCESS_KEY_ID", { infer: true })!;
    const secretAccessKey = this.config.get("R2_SECRET_ACCESS_KEY", { infer: true })!;
    const bucket = this.config.get("R2_BUCKET_NAME", { infer: true })!;
    const endpoint =
      this.config.get("R2_ENDPOINT", { infer: true }) ||
      `https://${accountId}.r2.cloudflarestorage.com`;

    try {
      const deleteUrl = this.createPresignedS3Url({
        method: "DELETE",
        endpoint,
        bucket,
        objectKey,
        accessKeyId,
        secretAccessKey,
        expiresInSeconds: 300,
      });
      await fetch(deleteUrl, { method: "DELETE" });
    } catch {
      // Ignore delete cleanup errors on object removal
    }
  }

  async getSignedReadUrl(params: {
    objectKey: string;
    fileName: string;
    mimeType: string;
    expiresInSeconds?: number;
  }): Promise<SignedUrlResult> {
    const ttl = params.expiresInSeconds ?? 300; // 5 minutes per RULES §3
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
    const mode = this.getStorageMode();

    if (mode === "simulated") {
      const stored = this.simulatedStore.get(params.objectKey);
      const token = createHash("sha256")
        .update(`${params.objectKey}:${expiresAt}`)
        .digest("hex")
        .slice(0, 24);

      if (stored?.base64) {
        const cleanBase64 = stored.base64.replace(/^data:[^;]+;base64,/, "");
        return {
          signedUrl: `data:${params.mimeType};base64,${cleanBase64}`,
          expiresAt,
          storageMode: "simulated",
        };
      }

      // Generate a clean simulated SVG certificate/document preview when no raw base64 was stored (e.g. seeded docs)
      const svgPreview = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="480" viewBox="0 0 720 480">
        <rect width="100%" height="100%" fill="#f6f7f5"/>
        <rect x="24" y="24" width="672" height="432" rx="12" fill="#ffffff" stroke="#0f6b4f" stroke-width="2"/>
        <text x="56" y="80" font-family="sans-serif" font-size="20" font-weight="bold" fill="#0f6b4f">AfriTrade Connect — Private KYB Vault (Cloudflare R2 Simulated)</text>
        <text x="56" y="125" font-family="monospace" font-size="14" fill="#1b2420">Document: ${this.escapeXml(params.fileName)}</text>
        <text x="56" y="155" font-family="monospace" font-size="13" fill="#5f6b65">Object Key: ${this.escapeXml(params.objectKey)}</text>
        <text x="56" y="185" font-family="monospace" font-size="13" fill="#5f6b65">MIME Type: ${this.escapeXml(params.mimeType)}</text>
        <text x="56" y="235" font-family="monospace" font-size="12" fill="#1d7a46">Signed Token: ${token}</text>
        <text x="56" y="265" font-family="monospace" font-size="12" fill="#9a6a00">Expires At: ${expiresAt} (Short-Lived 5m URL per RULES §3)</text>
        <rect x="56" y="310" width="608" height="96" rx="8" fill="#edf1ee"/>
        <text x="76" y="345" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f6b4f">Statutory Verification Audit Notice</text>
        <text x="76" y="370" font-family="sans-serif" font-size="12" fill="#1b2420">This document is served via a private signed URL. Access has been recorded in verification_access_logs.</text>
      </svg>`;
      const encodedSvg = Buffer.from(svgPreview, "utf-8").toString("base64");
      return {
        signedUrl: `data:image/svg+xml;base64,${encodedSvg}`,
        expiresAt,
        storageMode: "simulated",
      };
    }

    const accountId = this.config.get("R2_ACCOUNT_ID", { infer: true })!;
    const accessKeyId = this.config.get("R2_ACCESS_KEY_ID", { infer: true })!;
    const secretAccessKey = this.config.get("R2_SECRET_ACCESS_KEY", { infer: true })!;
    const bucket = this.config.get("R2_BUCKET_NAME", { infer: true })!;
    const endpoint =
      this.config.get("R2_ENDPOINT", { infer: true }) ||
      `https://${accountId}.r2.cloudflarestorage.com`;

    try {
      const signedUrl = this.createPresignedS3Url({
        method: "GET",
        endpoint,
        bucket,
        objectKey: params.objectKey,
        accessKeyId,
        secretAccessKey,
        expiresInSeconds: ttl,
      });

      return {
        signedUrl,
        expiresAt,
        storageMode: "r2",
      };
    } catch {
      throw new InternalServerErrorException({
        code: ErrorCode.STORAGE_PRESIGN_FAILED,
        message: "Failed to generate signed URL for KYB document",
      });
    }
  }

  /**
   * Generates an AWS Signature Version 4 presigned URL compatible with Cloudflare R2 (`auto` region, `s3` service).
   */
  createPresignedS3Url(params: {
    method: "GET" | "PUT" | "DELETE";
    endpoint: string;
    bucket: string;
    objectKey: string;
    accessKeyId: string;
    secretAccessKey: string;
    expiresInSeconds: number;
    now?: Date;
  }): string {
    const now = params.now ?? new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const region = "auto";
    const service = "s3";

    const parsedUrl = new URL(params.endpoint);
    const host = parsedUrl.host;
    const encodedKey = params.objectKey
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    const canonicalUri = `/${encodeURIComponent(params.bucket)}/${encodedKey}`;

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const queryParams = new URLSearchParams({
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${params.accessKeyId}/${credentialScope}`,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": String(params.expiresInSeconds),
      "X-Amz-SignedHeaders": "host",
    });
    queryParams.sort();

    const canonicalQueryString = queryParams.toString();
    const canonicalHeaders = `host:${host}\n`;
    const signedHeaders = "host";
    const payloadHash = "UNSIGNED-PAYLOAD";

    const canonicalRequest = [
      params.method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const hashedCanonicalRequest = createHash("sha256")
      .update(canonicalRequest, "utf8")
      .digest("hex");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      hashedCanonicalRequest,
    ].join("\n");

    const kDate = createHmac("sha256", `AWS4${params.secretAccessKey}`).update(dateStamp).digest();
    const kRegion = createHmac("sha256", kDate).update(region).digest();
    const kService = createHmac("sha256", kRegion).update(service).digest();
    const kSigning = createHmac("sha256", kService).update("aws4_request").digest();
    const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");

    return `${parsedUrl.protocol}//${host}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return c;
      }
    });
  }
}
