import { NotFoundException } from "@nestjs/common";
import { GeoService } from "./geo.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("GeoService", () => {
  let service: GeoService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      country: {
        findMany: jest.fn().mockResolvedValue([{ id: "1", name: "Nigeria", isoCode: "NG" }]),
        findUnique: jest.fn(),
      },
      currency: {
        findMany: jest.fn().mockResolvedValue([{ id: "1", code: "NGN" }]),
        findUnique: jest.fn(),
      },
      exchangeRate: {
        findMany: jest.fn().mockResolvedValue([
          { targetCurrency: "NGN", ratePerUsd: 1550 },
          { targetCurrency: "ZAR", ratePerUsd: 18.5 },
        ]),
      },
    };
    service = new GeoService(prisma as unknown as PrismaService);
  });

  it("lists countries", async () => {
    const countries = await service.countries();
    expect(countries).toHaveLength(1);
    expect(countries[0].isoCode).toBe("NG");
  });

  it("lists currencies", async () => {
    const currencies = await service.currencies();
    expect(currencies).toHaveLength(1);
    expect(currencies[0].code).toBe("NGN");
  });

  it("returns exchange rate map", async () => {
    const rates = await service.rates();
    expect(rates["NGN"]).toBe(1550);
    expect(rates["ZAR"]).toBe(18.5);
  });

  it("returns fallback rates when no DB rates exist", async () => {
    prisma.exchangeRate.findMany.mockResolvedValueOnce([]);
    const rates = await service.rates();
    expect(rates["USD"]).toBe(1.0);
    expect(rates["NGN"]).toBe(1550.0);
  });

  it("requireCountry returns country if found", async () => {
    prisma.country.findUnique.mockResolvedValue({ id: "1", name: "Ghana", isoCode: "GH" });
    const c = await service.requireCountry("GH");
    expect(c.isoCode).toBe("GH");
  });

  it("requireCountry throws NotFoundException if not found", async () => {
    prisma.country.findUnique.mockResolvedValue(null);
    await expect(service.requireCountry("XX")).rejects.toThrow(NotFoundException);
  });

  it("requireCurrency throws NotFoundException if not found", async () => {
    prisma.currency.findUnique.mockResolvedValue(null);
    await expect(service.requireCurrency("XYZ")).rejects.toThrow(NotFoundException);
  });
});
