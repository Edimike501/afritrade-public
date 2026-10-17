import process from "node:process";
import * as crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";
import { PRODUCT_CATEGORIES } from "@afritrade/shared";
import { COUNTRIES, COUNTRY_CURRENCY, CURRENCIES, INDICATIVE_RATES } from "./data/reference";
import { LOGISTICS_PARTNERS } from "./data/logistics-partners";
import { PRODUCT_TEMPLATES } from "./data/catalog";

try {
  process.loadEnvFile();
} catch {
  /* env already provided */
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/afritrade?schema=public",
  }),
});

const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? "Password123!";

const sha256 = (str: string) => crypto.createHash("sha256").update(str).digest("hex");

// 12 approved sample suppliers: 4 per country. Supplier i specialises in categories i%6 and (i+1)%6,
// so every category has exactly 4 suppliers.
const SUPPLIERS: { name: string; country: "NG" | "ZA" | "GH" }[] = [
  { name: "Lagos Agro Exports Ltd", country: "NG" },
  { name: "Kano Textile Mills", country: "NG" },
  { name: "Abuja Industrial Supplies", country: "NG" },
  { name: "Ibadan Foods & Beverages", country: "NG" },
  { name: "Cape Town Trade Co", country: "ZA" },
  { name: "Johannesburg Manufacturing Group", country: "ZA" },
  { name: "Durban Building Supplies", country: "ZA" },
  { name: "Stellenbosch Foods", country: "ZA" },
  { name: "Accra Agri Partners", country: "GH" },
  { name: "Kumasi Weavers Collective", country: "GH" },
  { name: "Tema Industrial Works", country: "GH" },
  { name: "Takoradi Electronics Hub", country: "GH" },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  console.log("Seeding reference data and accounts...");
  const hash = await bcrypt.hash(sha256(DEMO_PASSWORD), 10);

  // 1. Countries
  for (const c of COUNTRIES) {
    await prisma.country.upsert({
      where: { isoCode: c.isoCode },
      update: { name: c.name },
      create: c,
    });
  }

  // 2. Currencies
  for (const c of CURRENCIES) {
    await prisma.currency.upsert({
      where: { code: c.code },
      update: {
        minorUnitExponent: c.minorUnitExponent,
        isLive: c.isLive,
        paymentProvider: c.paymentProvider,
      },
      create: c,
    });
  }

  // 3. Indicative Exchange Rates
  for (const r of INDICATIVE_RATES) {
    await prisma.exchangeRate.upsert({
      where: { targetCurrency: r.targetCurrency },
      update: { ratePerUsd: r.ratePerUsd },
      create: {
        baseCurrency: "USD",
        targetCurrency: r.targetCurrency,
        ratePerUsd: r.ratePerUsd,
      },
    });
  }

  const countries = Object.fromEntries((await prisma.country.findMany()).map((c) => [c.isoCode, c.id]));
  const currencies = Object.fromEntries((await prisma.currency.findMany()).map((c) => [c.code, c.id]));

  // 4. Admin (no self-registration — this is the only way an admin exists)
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@afritrade.test";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminHash = await bcrypt.hash(sha256(adminPassword), 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminHash,
      preferredCurrencyId: currencies.USD,
    },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      fullName: "Platform Admin",
      role: "ADMIN",
      countryId: countries.NG!,
      preferredCurrencyId: currencies.USD,
    },
  });

  // 5. Demo buyer
  await prisma.user.upsert({
    where: { email: "buyer@afritrade.test" },
    update: {
      passwordHash: hash,
      preferredCurrencyId: currencies.GHS,
    },
    create: {
      email: "buyer@afritrade.test",
      passwordHash: hash,
      fullName: "Demo Buyer",
      role: "BUYER",
      countryId: countries.GH!,
      preferredCurrencyId: currencies.GHS,
    },
  });

  await prisma.user.upsert({
    where: { email: "buyer@example.com" },
    update: {
      passwordHash: hash,
      preferredCurrencyId: currencies.GHS,
    },
    create: {
      email: "buyer@example.com",
      passwordHash: hash,
      fullName: "Demo Buyer",
      role: "BUYER",
      countryId: countries.GH!,
      preferredCurrencyId: currencies.GHS,
    },
  });

  // 6. Approved suppliers (+ business profiles)
  const profileIds: string[] = [];
  for (let i = 0; i < SUPPLIERS.length; i++) {
    const s = SUPPLIERS[i]!;
    const email = `${slug(s.name)}@supplier.afritrade.test`;
    const supplierCurrency = COUNTRY_CURRENCY[s.country]!.code;
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash: hash,
        preferredCurrencyId: currencies[supplierCurrency],
      },
      create: {
        email,
        passwordHash: hash,
        fullName: s.name,
        role: "SUPPLIER",
        countryId: countries[s.country]!,
        preferredCurrencyId: currencies[supplierCurrency],
      },
    });

    if (i === 0) {
      const demoSup1 = await prisma.user.upsert({
        where: { email: "supplier@example.com" },
        update: {
          passwordHash: hash,
          preferredCurrencyId: currencies[supplierCurrency],
        },
        create: {
          email: "supplier@example.com",
          passwordHash: hash,
          fullName: s.name,
          role: "SUPPLIER",
          countryId: countries[s.country]!,
          preferredCurrencyId: currencies[supplierCurrency],
        },
      });
      await prisma.businessProfile.upsert({
        where: { userId: demoSup1.id },
        update: {},
        create: {
          userId: demoSup1.id,
          businessName: s.name,
          countryId: countries[s.country]!,
          contactPhone: "+234 800 100 2000",
          businessEmail: "export@lagosagro.ng",
          businessAddress: "14 Wharf Road, Apapa, Lagos",
          primaryCategory: PRODUCT_CATEGORIES[0],
          registrationNumberMasked: "RC-****9381",
          kybStatus: "APPROVED",
          kybSubmittedAt: new Date(),
          kybReviewedAt: new Date(),
        },
      });

      const demoSup2 = await prisma.user.upsert({
        where: { email: "supplier@afritrade.test" },
        update: {
          passwordHash: hash,
          preferredCurrencyId: currencies[supplierCurrency],
        },
        create: {
          email: "supplier@afritrade.test",
          passwordHash: hash,
          fullName: s.name,
          role: "SUPPLIER",
          countryId: countries[s.country]!,
          preferredCurrencyId: currencies[supplierCurrency],
        },
      });
      await prisma.businessProfile.upsert({
        where: { userId: demoSup2.id },
        update: {},
        create: {
          userId: demoSup2.id,
          businessName: `${s.name} (Test Account)`,
          countryId: countries[s.country]!,
          contactPhone: "+234 800 100 2001",
          businessEmail: "compliance@lagosagro.ng",
          businessAddress: "14 Wharf Road, Apapa, Lagos",
          primaryCategory: PRODUCT_CATEGORIES[0],
          registrationNumberMasked: "RC-****9382",
          kybStatus: "APPROVED",
          kybSubmittedAt: new Date(),
          kybReviewedAt: new Date(),
        },
      });
    }

    const regPrefix = s.country === "NG" ? "RC" : s.country === "ZA" ? "CIPC" : "BN";
    const profile = await prisma.businessProfile.upsert({
      where: { userId: user.id },
      update: {
        kybStatus: "APPROVED",
        kybReviewedAt: new Date(),
        primaryCategory: PRODUCT_CATEGORIES[i % 6],
        registrationNumberMasked: `${regPrefix}-****${1000 + i}`,
      },
      create: {
        userId: user.id,
        businessName: s.name,
        countryId: countries[s.country]!,
        contactPhone: s.country === "NG" ? "+234 1 800 4000" : s.country === "ZA" ? "+27 21 555 0190" : "+233 30 222 0140",
        businessEmail: `trade@${slug(s.name)}.africa`,
        businessAddress: `${10 + i} Commercial Trade Zone, ${s.country}`,
        primaryCategory: PRODUCT_CATEGORIES[i % 6],
        registrationNumberMasked: `${regPrefix}-****${1000 + i}`,
        kybStatus: "APPROVED",
        kybSubmittedAt: new Date(),
        kybReviewedAt: new Date(),
      },
    });
    profileIds.push(profile.id);

    const existingDocs = await prisma.kybDocument.count({
      where: { businessProfileId: profile.id },
    });
    if (existingDocs === 0) {
      await prisma.kybDocument.create({
        data: {
          businessProfileId: profile.id,
          documentType: "CERTIFICATE_OF_INCORPORATION",
          fileName: `${slug(s.name)}-incorporation-certificate.pdf`,
          mimeType: "application/pdf",
          fileSizeBytes: 245_760,
          objectKey: `kyb/${profile.id}/seed-incorporation-certificate.pdf`,
          uploadedById: user.id,
        },
      });
    }
  }

  // 7. Logistics partners (matched by name)
  for (const p of LOGISTICS_PARTNERS) {
    const exists = await prisma.logisticsPartner.findFirst({ where: { name: p.name } });
    if (!exists) await prisma.logisticsPartner.create({ data: p });
  }

  // 8. Products — 6 categories × 10 templates × 2 suppliers = 120 (skipped if already seeded)
  const existing = await prisma.product.count();
  if (existing >= 100) {
    console.log(`Products already seeded (${existing}) — skipping.`);
  } else {
    const rows: any[] = [];
    PRODUCT_CATEGORIES.forEach((category, c) => {
      // Suppliers specialising in this category: i%6 === c or (i+1)%6 === c
      const idx = SUPPLIERS.map((_, i) => i).filter((i) => i % 6 === c || (i + 1) % 6 === c);
      PRODUCT_TEMPLATES[category].forEach(([name, description, usd], j) => {
        for (let v = 0; v < 2; v++) {
          const i = idx[(j + v) % idx.length]!;
          const { code, perUsd } = COUNTRY_CURRENCY[SUPPLIERS[i]!.country]!;
          const variation = 1 + ((j * 7 + v * 13 + i) % 9) / 100; // deterministic ±~8%
          rows.push({
            businessProfileId: profileIds[i]!,
            name,
            description,
            category,
            price: (Math.round((usd * perUsd * variation) / 10) * 10).toFixed(2),
            currencyId: currencies[code]!,
          });
        }
      });
    });
    await prisma.product.createMany({ data: rows });
    console.log(`Seeded ${rows.length} products.`);
  }

  console.log("\nSeed finished successfully.");
  console.log(`  Admin:    ${adminEmail}`);
  console.log(`  Buyer:    buyer@afritrade.test / ${DEMO_PASSWORD}`);
  console.log(`  Suppliers: *@supplier.afritrade.test / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
