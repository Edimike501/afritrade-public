import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";
import * as fs from "fs";
import * as path from "path";

// Ensure required env vars are present for headless bootstrapping
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock";
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "mock-secret-for-openapi-generation-32chars";

import { VersioningType } from "@nestjs/common";
import { AppModule } from "../app.module";

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
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
  const repoRoot = path.resolve(__dirname, "../../../..");
  const outputPath = path.join(repoRoot, "docs/openapi.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), "utf-8");
  console.log(`✓ OpenAPI specification exported to ${outputPath}`);

  await app.close();
  process.exit(0);
}

generate().catch((err) => {
  console.error("Failed to generate OpenAPI spec:", err);
  process.exit(1);
});
