import { Injectable, NotFoundException } from "@nestjs/common";
import type { AdminUserDto, AdminUsersQueryInput, AuthUser } from "@afritrade/shared";
import { ErrorCode, Role, type KybStatus } from "@afritrade/shared";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAuthUser(id: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { country: true, businessProfile: true, preferredCurrency: true },
    });
    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_FOUND,
        message: "User not found",
      });
    }
    const countryIso = user.country?.isoCode ?? "";
    const defaultCurrency =
      countryIso === "NG" ? "NGN" : countryIso === "ZA" ? "ZAR" : countryIso === "GH" ? "GHS" : "USD";
    const preferredCurrency = user.preferredCurrency?.code ?? defaultCurrency;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as unknown as Role,
      countryCode: countryIso,
      preferredCurrency,
      kybStatus: (user.businessProfile?.kybStatus as unknown as KybStatus) ?? null,
    };
  }

  async updatePreferences(userId: string, dto: { preferredCurrency: string }): Promise<AuthUser> {
    const currency = await this.prisma.currency.findUnique({
      where: { code: dto.preferredCurrency },
    });
    if (!currency) {
      throw new NotFoundException({
        code: ErrorCode.GEO_CURRENCY_NOT_SUPPORTED,
        message: `Currency ${dto.preferredCurrency} not supported`,
      });
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { preferredCurrencyId: currency.id },
      include: { country: true, businessProfile: true, preferredCurrency: true },
    });

    const countryIso = user.country?.isoCode ?? "";
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as unknown as Role,
      countryCode: countryIso,
      preferredCurrency: user.preferredCurrency?.code ?? dto.preferredCurrency,
      kybStatus: (user.businessProfile?.kybStatus as unknown as KybStatus) ?? null,
    };
  }

  async updateProfile(
    userId: string,
    dto: { fullName?: string; preferredCurrency?: string },
  ): Promise<AuthUser> {
    const data: { fullName?: string; preferredCurrencyId?: string } = {};

    if (dto.fullName) {
      data.fullName = dto.fullName.trim();
    }

    if (dto.preferredCurrency) {
      const currency = await this.prisma.currency.findUnique({
        where: { code: dto.preferredCurrency },
      });
      if (!currency) {
        throw new NotFoundException({
          code: ErrorCode.GEO_CURRENCY_NOT_SUPPORTED,
          message: `Currency ${dto.preferredCurrency} not supported`,
        });
      }
      data.preferredCurrencyId = currency.id;
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: { country: true, businessProfile: true, preferredCurrency: true },
    });

    const countryIso = user.country?.isoCode ?? "";
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as unknown as Role,
      countryCode: countryIso,
      preferredCurrency: user.preferredCurrency?.code ?? (dto.preferredCurrency || "USD"),
      kybStatus: (user.businessProfile?.kybStatus as unknown as KybStatus) ?? null,
    };
  }

  async listAdminUsers(query: AdminUsersQueryInput = {}): Promise<AdminUserDto[]> {
    const where: Record<string, any> = {};
    if (query.role) {
      where.role = query.role;
    }
    if (query.countryCode) {
      where.country = { isoCode: query.countryCode.toUpperCase() };
    }
    if (query.kybStatus) {
      where.businessProfile = { kybStatus: query.kybStatus };
    }
    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { fullName: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
        { businessProfile: { businessName: { contains: term, mode: "insensitive" } } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        country: true,
        preferredCurrency: true,
        ordersPlaced: { select: { id: true } },
        businessProfile: {
          include: {
            country: true,
            products: { where: { isActive: true }, select: { id: true } },
            documents: { orderBy: { createdAt: "desc" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return users.map((u: any) => {
      const countryIso = u.country?.isoCode ?? "NG";
      const defaultCurrency =
        countryIso === "NG" ? "NGN" : countryIso === "ZA" ? "ZAR" : countryIso === "GH" ? "GHS" : "USD";
      const bp = u.businessProfile;

      return {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role as Role,
        countryCode: countryIso,
        preferredCurrency: u.preferredCurrency?.code ?? defaultCurrency,
        ordersCount: Array.isArray(u.ordersPlaced) ? u.ordersPlaced.length : 0,
        createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
        businessProfile: bp
          ? {
              id: bp.id,
              businessName: bp.businessName,
              countryCode: bp.country?.isoCode ?? countryIso,
              contactPhone: bp.contactPhone ?? null,
              businessEmail: bp.businessEmail ?? null,
              businessAddress: bp.businessAddress ?? null,
              website: bp.website ?? null,
              description: bp.description ?? null,
              primaryCategory: bp.primaryCategory ?? null,
              registrationNumberMasked: bp.registrationNumberMasked ?? null,
              taxIdMasked: bp.taxIdMasked ?? null,
              kybStatus: bp.kybStatus as KybStatus,
              kybSubmittedAt:
                bp.kybSubmittedAt instanceof Date
                  ? bp.kybSubmittedAt.toISOString()
                  : bp.kybSubmittedAt ?? null,
              kybReviewedAt:
                bp.kybReviewedAt instanceof Date
                  ? bp.kybReviewedAt.toISOString()
                  : bp.kybReviewedAt ?? null,
              kybRejectReason: bp.kybRejectReason ?? null,
              activeListingsCount: Array.isArray(bp.products) ? bp.products.length : 0,
              documentsCount: Array.isArray(bp.documents) ? bp.documents.length : 0,
              documents: Array.isArray(bp.documents)
                ? bp.documents.map((d: any) => ({
                    id: d.id,
                    businessProfileId: d.businessProfileId,
                    documentType: d.documentType,
                    fileName: d.fileName,
                    mimeType: d.mimeType,
                    fileSizeBytes: d.fileSizeBytes,
                    createdAt:
                      d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt),
                  }))
                : [],
            }
          : null,
      };
    });
  }
}
