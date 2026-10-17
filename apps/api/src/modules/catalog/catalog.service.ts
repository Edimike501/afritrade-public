import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ErrorCode, KybStatus, type CreateProductInput, type ProductQuery, type UpdateProductInput } from "@afritrade/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { Paginated } from "../../common/paginated";

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ProductQuery) {
    const where: any = { isActive: true };
    if (query.category) where.category = query.category;
    if (query.country) {
      where.businessProfile = { country: { isoCode: query.country.toUpperCase() } };
    }
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: "insensitive" } },
        { description: { contains: query.q, mode: "insensitive" } },
      ];
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [total, items] = await Promise.all([
      this.prisma.product.count ? this.prisma.product.count({ where }) : Promise.resolve(0),
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          currency: true,
          businessProfile: { include: { country: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const finalTotal = typeof total === "number" && total > 0 ? total : items.length;
    return new Paginated(items, { page, limit, total: finalTotal });
  }

  async get(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        currency: true,
        businessProfile: { include: { country: true } },
      },
    });
    if (!product) {
      throw new NotFoundException({
        code: ErrorCode.CATALOG_PRODUCT_NOT_FOUND,
        message: "Product not found",
      });
    }
    return product;
  }

  async listMine(userId: string) {
    const profile = await this.prisma.businessProfile.findUnique({ where: { userId } });
    if (!profile) return [];
    return this.prisma.product.findMany({
      where: { businessProfileId: profile.id },
      include: {
        currency: true,
        businessProfile: { include: { country: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(userId: string, input: CreateProductInput) {
    const profile = await this.prisma.businessProfile.findUnique({ where: { userId } });
    if (!profile || profile.kybStatus !== KybStatus.APPROVED) {
      throw new ForbiddenException({
        code: ErrorCode.CATALOG_SUPPLIER_NOT_VERIFIED,
        message: "Only approved suppliers can create products",
      });
    }

    const currency = await this.prisma.currency.findUnique({
      where: { code: input.currencyCode },
    });
    if (!currency) {
      throw new NotFoundException({
        code: ErrorCode.GEO_CURRENCY_NOT_SUPPORTED,
        message: `Currency ${input.currencyCode} not supported`,
      });
    }

    return this.prisma.product.create({
      data: {
        businessProfileId: profile.id,
        name: input.name,
        description: input.description,
        category: input.category,
        price: input.price,
        currencyId: currency.id,
        imageUrl: input.imageUrl ?? null,
      },
      include: {
        currency: true,
        businessProfile: { include: { country: true } },
      },
    });
  }

  async update(userId: string, id: string, input: UpdateProductInput) {
    const product = await this.get(id);
    const profile = await this.prisma.businessProfile.findUnique({ where: { userId } });
    if (!profile || product.businessProfileId !== profile.id) {
      throw new ForbiddenException({
        code: ErrorCode.CATALOG_UNAUTHORIZED_ACCESS,
        message: "You can only update your own products",
      });
    }

    let currencyId: string | undefined;
    if (input.currencyCode) {
      const currency = await this.prisma.currency.findUnique({
        where: { code: input.currencyCode },
      });
      if (!currency) {
        throw new NotFoundException({
          code: ErrorCode.GEO_CURRENCY_NOT_SUPPORTED,
          message: `Currency ${input.currencyCode} not supported`,
        });
      }
      currencyId = currency.id;
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        category: input.category,
        price: input.price,
        ...(currencyId ? { currencyId } : {}),
        imageUrl: input.imageUrl,
        isActive: input.isActive,
      },
      include: {
        currency: true,
        businessProfile: { include: { country: true } },
      },
    });
  }
}
