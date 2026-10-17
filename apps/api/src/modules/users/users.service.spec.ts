import { NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("UsersService", () => {
  let service: UsersService;
  let prisma: {
    user: { findUnique: jest.Mock; update: jest.Mock; findMany: jest.Mock };
    currency: { findUnique: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      currency: {
        findUnique: jest.fn(),
      },
    };
    service = new UsersService(prisma as unknown as PrismaService);
  });

  it("returns mapped AuthUser when user is found", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "u-123",
      email: "buyer@example.com",
      fullName: "Test Buyer",
      role: "BUYER",
      country: { isoCode: "NG" },
      preferredCurrency: { code: "USD" },
      businessProfile: null,
    });

    const user = await service.getAuthUser("u-123");
    expect(user).toEqual({
      id: "u-123",
      email: "buyer@example.com",
      fullName: "Test Buyer",
      role: "BUYER",
      countryCode: "NG",
      preferredCurrency: "USD",
      kybStatus: null,
    });
  });

  it("throws NotFoundException when user does not exist", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.getAuthUser("missing-id")).rejects.toThrow(NotFoundException);
  });

  it("updates user preferred currency successfully", async () => {
    prisma.currency.findUnique.mockResolvedValue({
      id: "cur-zar",
      code: "ZAR",
    });

    prisma.user.update.mockResolvedValue({
      id: "u-123",
      email: "buyer@example.com",
      fullName: "Test Buyer",
      role: "BUYER",
      country: { isoCode: "NG" },
      preferredCurrency: { code: "ZAR" },
      businessProfile: null,
    });

    const updated = await service.updatePreferences("u-123", { preferredCurrency: "ZAR" });
    expect(prisma.currency.findUnique).toHaveBeenCalledWith({ where: { code: "ZAR" } });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u-123" },
      data: { preferredCurrencyId: "cur-zar" },
      include: { country: true, businessProfile: true, preferredCurrency: true },
    });
    expect(updated.preferredCurrency).toBe("ZAR");
  });

  it("throws NotFoundException when updating to unsupported currency", async () => {
    prisma.currency.findUnique.mockResolvedValue(null);

    await expect(service.updatePreferences("u-123", { preferredCurrency: "INVALID" })).rejects.toThrow(
      NotFoundException,
    );
  });

  describe("updateProfile", () => {
    it("updates full name and preferred currency successfully", async () => {
      prisma.currency.findUnique.mockResolvedValue({
        id: "cur-ghs",
        code: "GHS",
      });

      prisma.user.update.mockResolvedValue({
        id: "u-123",
        email: "buyer@example.com",
        fullName: "Updated Name",
        role: "BUYER",
        country: { isoCode: "GH" },
        preferredCurrency: { code: "GHS" },
        businessProfile: null,
      });

      const updated = await service.updateProfile("u-123", {
        fullName: "Updated Name",
        preferredCurrency: "GHS",
      });

      expect(prisma.currency.findUnique).toHaveBeenCalledWith({ where: { code: "GHS" } });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "u-123" },
        data: { fullName: "Updated Name", preferredCurrencyId: "cur-ghs" },
        include: { country: true, businessProfile: true, preferredCurrency: true },
      });
      expect(updated.fullName).toBe("Updated Name");
      expect(updated.preferredCurrency).toBe("GHS");
    });

    it("updates only full name when preferredCurrency is not supplied", async () => {
      prisma.user.update.mockResolvedValue({
        id: "u-123",
        email: "buyer@example.com",
        fullName: "Kofi Annan",
        role: "BUYER",
        country: { isoCode: "GH" },
        preferredCurrency: { code: "USD" },
        businessProfile: null,
      });

      const updated = await service.updateProfile("u-123", {
        fullName: "Kofi Annan",
      });

      expect(prisma.currency.findUnique).not.toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "u-123" },
        data: { fullName: "Kofi Annan" },
        include: { country: true, businessProfile: true, preferredCurrency: true },
      });
      expect(updated.fullName).toBe("Kofi Annan");
    });

    it("throws NotFoundException if updating profile with unsupported currency", async () => {
      prisma.currency.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile("u-123", { preferredCurrency: "UNSUPPORTED" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("listAdminUsers", () => {
    it("returns users with attached businessProfile and document count for suppliers", async () => {
      prisma.user.findMany.mockResolvedValue([
        {
          id: "sup-1",
          email: "supplier@example.com",
          fullName: "Demo Supplier",
          role: "SUPPLIER",
          country: { isoCode: "NG" },
          preferredCurrency: { code: "NGN" },
          ordersPlaced: [],
          createdAt: new Date("2026-07-01T00:00:00Z"),
          businessProfile: {
            id: "bp-1",
            businessName: "Lagos Agro Exports Ltd",
            country: { isoCode: "NG" },
            contactPhone: "+234800000",
            primaryCategory: "Agriculture",
            registrationNumberMasked: "RC-****9381",
            kybStatus: "APPROVED",
            products: [{ id: "p-1" }, { id: "p-2" }],
            documents: [
              {
                id: "doc-1",
                businessProfileId: "bp-1",
                documentType: "CERTIFICATE_OF_INCORPORATION",
                fileName: "cac.pdf",
                mimeType: "application/pdf",
                fileSizeBytes: 50000,
                createdAt: new Date("2026-07-01T00:00:00Z"),
              },
            ],
          },
        },
      ]);

      const list = await service.listAdminUsers({ role: "SUPPLIER" as any });
      expect(list).toHaveLength(1);
      expect(list[0].businessProfile?.businessName).toBe("Lagos Agro Exports Ltd");
      expect(list[0].businessProfile?.activeListingsCount).toBe(2);
      expect(list[0].businessProfile?.documentsCount).toBe(1);
    });
  });
});
