import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { KybStatus } from "@afritrade/shared";
import { CatalogService } from "./catalog.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("CatalogService", () => {
  let service: CatalogService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      product: {
        findMany: jest.fn().mockResolvedValue([{ id: "p-1", name: "Cocoa" }]),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      businessProfile: {
        findUnique: jest.fn(),
      },
      currency: {
        findUnique: jest.fn(),
      },
    };
    service = new CatalogService(prisma as unknown as PrismaService);
  });

  it("lists active products", async () => {
    const products = await service.list({ page: 1, limit: 20 });
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("Cocoa");
  });

  it("get throws NotFoundException when product is not found", async () => {
    prisma.product.findUnique.mockResolvedValue(null);
    await expect(service.get("missing-p")).rejects.toThrow(NotFoundException);
  });

  it("create rejects if supplier KYB is not APPROVED", async () => {
    prisma.businessProfile.findUnique.mockResolvedValue({
      id: "bp-1",
      kybStatus: KybStatus.PENDING,
    });

    await expect(
      service.create("u-1", {
        name: "Coffee Beans",
        description: "Fresh",
        category: "Agriculture",
        price: "500.00",
        currencyCode: "NGN",
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it("create succeeds if supplier KYB is APPROVED", async () => {
    prisma.businessProfile.findUnique.mockResolvedValue({
      id: "bp-1",
      kybStatus: KybStatus.APPROVED,
    });
    prisma.currency.findUnique.mockResolvedValue({ id: "curr-1", code: "NGN" });
    prisma.product.create.mockResolvedValue({ id: "p-new", name: "Coffee Beans" });

    const product = await service.create("u-1", {
      name: "Coffee Beans",
      description: "Fresh",
      category: "Agriculture",
      price: "500.00",
      currencyCode: "NGN",
    });

    expect(product.name).toBe("Coffee Beans");
  });

  it("listMine returns products belonging to the supplier business profile", async () => {
    prisma.businessProfile.findUnique.mockResolvedValue({
      id: "bp-1",
      kybStatus: KybStatus.APPROVED,
    });
    prisma.product.findMany.mockResolvedValue([
      { id: "p-1", name: "Cocoa", businessProfileId: "bp-1" },
    ]);

    const products = await service.listMine("u-1");
    expect(products).toHaveLength(1);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { businessProfileId: "bp-1" },
      }),
    );
  });

  it("update rejects if supplier does not own the product", async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: "p-1",
      businessProfileId: "bp-other",
    });
    prisma.businessProfile.findUnique.mockResolvedValue({
      id: "bp-1",
      kybStatus: KybStatus.APPROVED,
    });

    await expect(
      service.update("u-1", "p-1", { name: "Updated Name" }),
    ).rejects.toThrow(ForbiddenException);
  });

  it("update succeeds and resolves currencyCode when supplier owns the product", async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: "p-1",
      businessProfileId: "bp-1",
    });
    prisma.businessProfile.findUnique.mockResolvedValue({
      id: "bp-1",
      kybStatus: KybStatus.APPROVED,
    });
    prisma.currency.findUnique.mockResolvedValue({ id: "curr-ghs", code: "GHS" });
    prisma.product.update.mockResolvedValue({
      id: "p-1",
      name: "Updated Ginger",
      price: "1200.00",
      currencyId: "curr-ghs",
      imageUrl: null,
      isActive: false,
    });

    const updated = await service.update("u-1", "p-1", {
      name: "Updated Ginger",
      price: "1200.00",
      currencyCode: "GHS",
      imageUrl: null,
      isActive: false,
    });

    expect(updated.name).toBe("Updated Ginger");
    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "p-1" },
        data: expect.objectContaining({
          name: "Updated Ginger",
          price: "1200.00",
          currencyId: "curr-ghs",
          imageUrl: null,
          isActive: false,
        }),
      }),
    );
  });

  it("update rejects with NotFoundException when currencyCode is unsupported", async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: "p-1",
      businessProfileId: "bp-1",
    });
    prisma.businessProfile.findUnique.mockResolvedValue({
      id: "bp-1",
      kybStatus: KybStatus.APPROVED,
    });
    prisma.currency.findUnique.mockResolvedValue(null);

    await expect(
      service.update("u-1", "p-1", { currencyCode: "EUR" }),
    ).rejects.toThrow(NotFoundException);
  });
});
