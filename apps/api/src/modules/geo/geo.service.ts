import { Injectable, NotFoundException } from "@nestjs/common";
import { ErrorCode } from "@afritrade/shared";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class GeoService {
  constructor(private readonly prisma: PrismaService) {}

  async countries() {
    return this.prisma.country.findMany({ orderBy: { name: "asc" } });
  }

  async currencies() {
    return this.prisma.currency.findMany({ orderBy: { code: "asc" } });
  }

  async rates(): Promise<Record<string, number>> {
    const records = await this.prisma.exchangeRate.findMany();
    if (records.length === 0) {
      return { USD: 1.0, NGN: 1550.0, ZAR: 18.5, GHS: 15.2 };
    }
    const rateMap: Record<string, number> = {};
    for (const r of records) {
      rateMap[r.targetCurrency] = r.ratePerUsd;
    }
    return rateMap;
  }

  async requireCountry(isoCode: string) {
    const country = await this.prisma.country.findUnique({ where: { isoCode: isoCode.toUpperCase() } });
    if (!country) {
      throw new NotFoundException({
        code: ErrorCode.GEO_COUNTRY_NOT_FOUND,
        message: `Country ${isoCode} not found`,
      });
    }
    return country;
  }

  async requireCurrency(code: string) {
    const currency = await this.prisma.currency.findUnique({ where: { code: code.toUpperCase() } });
    if (!currency) {
      throw new NotFoundException({
        code: ErrorCode.GEO_CURRENCY_NOT_SUPPORTED,
        message: `Currency ${code} not supported`,
      });
    }
    return currency;
  }
}
