import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { VersioningType } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useBodyParser("json", { limit: "15mb" });
  app.useBodyParser("urlencoded", { limit: "15mb", extended: true });
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });
  app.use(cookieParser());
  const configuredOrigins = [
    ...(process.env.CORS_ORIGINS?.split(",") ?? []),
    process.env.WEB_APP_URL ?? "",
    process.env.ADMIN_APP_URL ?? "",
  ]
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  app.enableCors({
    origin:
      configuredOrigins.length > 0
        ? [
            ...new Set(configuredOrigins),
            /^https:\/\/([a-z0-9-]+\.)?techclimesolutions\.com$/,
          ]
        : true,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("AfriTrade Connect API")
    .setDescription("Intra-African B2B Trade & Logistics Platform API")
    .setVersion("1.0.0")
    .addBearerAuth()
    .addTag("auth", "Authentication and Token Issuance")
    .addTag("catalog", "Marketplace and Product Catalog")
    .addTag("orders", "Order Creation and State Lifecycle")
    .addTag("payments", "Payment Processing & Ledger Inquiries")
    .addTag("logistics", "Curated Logistics Partners & Shipments")
    .addTag("business-profiles", "Supplier KYB Verification")
    .addTag("dashboard", "Role-scoped Platform Metrics")
    .build();

  const document = cleanupOpenApiDoc(SwaggerModule.createDocument(app, config));
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 4040;
  await app.listen(port, "0.0.0.0");
  console.log(`AfriTrade API listening on http://0.0.0.0:${port}/api/v1`);
}
bootstrap();
