import { z } from "zod";

/**
 * The app refuses to boot if a required env var is missing or invalid.
 * Every var here has a free/local default path — no paid service is required.
 */
const EnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "staging", "production"])
      .default("development"),
    PORT: z.coerce.number().default(4040),
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().default("redis://localhost:6379"),
    JWT_ACCESS_SECRET: z
      .string()
      .min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
    JWT_REFRESH_SECRET: z.string().optional(),
    JWT_EXPIRES_IN: z.string().default("15m"),
    REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(7),
    CORS_ORIGINS: z.string().optional(),
    WEB_APP_URL: z.string().default("http://localhost:3030"),
    PAYMENTS_MODE: z.enum(["simulated", "live"]).default("simulated"),
    PAYMENT_PROVIDER: z.enum(["mock", "paystack"]).default("mock"),
    PAYSTACK_SECRET_KEY: z.string().optional(),
    PAYSTACK_CALLBACK_URL: z.string().optional(),
    STORAGE_MODE: z.enum(["simulated", "r2"]).default("simulated"),
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET_NAME: z.string().optional(),
    R2_ENDPOINT: z.string().optional(),
    RENDER_GIT_COMMIT: z.string().optional(),
    SEED_ADMIN_EMAIL: z.string().email().optional(),
    SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
    SEED_DEMO_PASSWORD: z.string().min(8).optional(),
  })
  .refine((e) => e.PAYMENT_PROVIDER !== "paystack" || !!e.PAYSTACK_SECRET_KEY, {
    message: "PAYSTACK_SECRET_KEY is required when PAYMENT_PROVIDER=paystack",
    path: ["PAYSTACK_SECRET_KEY"],
  })
  .refine((e) => e.PAYMENTS_MODE !== "live" || e.NODE_ENV === "production", {
    message: "PAYMENTS_MODE=live is only permitted when NODE_ENV=production",
    path: ["PAYMENTS_MODE"],
  })
  .refine(
    (e) =>
      e.STORAGE_MODE !== "r2" ||
      (!!e.R2_ACCOUNT_ID &&
        !!e.R2_ACCESS_KEY_ID &&
        !!e.R2_SECRET_ACCESS_KEY &&
        !!e.R2_BUCKET_NAME),
    {
      message:
        "R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME are required when STORAGE_MODE=r2",
      path: ["STORAGE_MODE"],
    },
  );

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(env: Record<string, unknown>): Env {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    console.error(
      "Invalid/missing environment variables:",
      result.error.format(),
    );
    process.exit(1);
  }
  return result.data;
}
