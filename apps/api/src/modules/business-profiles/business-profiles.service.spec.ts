import { BadRequestException, NotFoundException } from "@nestjs/common";
import { KybDocumentType, KybStatus } from "@afritrade/shared";
import { BusinessProfilesService } from "./business-profiles.service";
import { PrismaService } from "../../prisma/prisma.service";
import { R2StorageService } from "./r2-storage.service";

describe("BusinessProfilesService", () => {
  let service: BusinessProfilesService;
  let prisma: any;
  let storage: any;

  beforeEach(() => {
    prisma = {
      businessProfile: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      kybDocument: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      verificationAccessLog: {
        create: jest.fn(),
      },
      adminAuditLog: {
        create: jest.fn(),
      },
      country: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };
    storage = {
      uploadPrivateObject: jest.fn().mockResolvedValue({
        objectKey: "kyb/bp-1/doc.pdf",
        storageMode: "simulated",
      }),
      deletePrivateObject: jest.fn().mockResolvedValue(undefined),
      getSignedReadUrl: jest.fn().mockResolvedValue({
        signedUrl: "data:application/pdf;base64,abc",
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
        storageMode: "simulated",
      }),
    };
    service = new BusinessProfilesService(
      prisma as unknown as PrismaService,
      storage as unknown as R2StorageService,
    );
  });

  it("getMine returns profile if found", async () => {
    prisma.businessProfile.findUnique.mockResolvedValue({
      id: "bp-1",
      businessName: "Agro Ltd",
      country: { isoCode: "NG" },
      documents: [],
    });
    const profile = await service.getMine("u-1");
    expect(profile.businessName).toBe("Agro Ltd");
    expect(profile.countryCode).toBe("NG");
  });

  it("getMine throws NotFoundException if not found", async () => {
    prisma.businessProfile.findUnique.mockResolvedValue(null);
    await expect(service.getMine("u-1")).rejects.toThrow(NotFoundException);
  });

  it("submit rejects if already approved", async () => {
    prisma.businessProfile.findUnique.mockResolvedValue({
      id: "bp-1",
      kybStatus: KybStatus.APPROVED,
    });
    await expect(
      service.submit("u-1", { businessName: "Agro Ltd", countryCode: "NG", contactPhone: "12345" }),
    ).rejects.toThrow(BadRequestException);
  });

  it("submit allows updating KYB details while PENDING and resets kybSubmittedAt", async () => {
    prisma.businessProfile.findUnique.mockResolvedValue({
      id: "bp-1",
      kybStatus: KybStatus.PENDING,
      contactPhone: "+234800",
    });
    prisma.user.findUnique.mockResolvedValue({ id: "u-1", countryId: "c-ng" });
    prisma.country.findUnique.mockResolvedValue({ id: "c-gh", isoCode: "GH" });
    prisma.businessProfile.upsert.mockResolvedValue({
      id: "bp-1",
      businessName: "Updated Agro GH",
      kybStatus: KybStatus.PENDING,
      registrationNumberMasked: "RC-****9381",
      country: { isoCode: "GH" },
    });

    const res = await service.submit("u-1", {
      businessName: "Updated Agro GH",
      countryCode: "GH",
      registrationNumber: "RC-1029381",
    });
    expect(res.businessName).toBe("Updated Agro GH");
    expect(prisma.businessProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          businessName: "Updated Agro GH",
          countryId: "c-gh",
          kybStatus: KybStatus.PENDING,
          kybSubmittedAt: expect.any(Date),
        }),
      }),
    );
  });

  it("updateDetails updates operational fields even when APPROVED", async () => {
    prisma.businessProfile.findUnique.mockResolvedValue({
      id: "bp-1",
      userId: "u-1",
      kybStatus: KybStatus.APPROVED,
    });
    prisma.businessProfile.update.mockResolvedValue({
      id: "bp-1",
      userId: "u-1",
      contactPhone: "+234900111222",
      businessEmail: "ops@agroltd.ng",
      businessAddress: "14 Wharf Road, Apapa, Lagos",
      kybStatus: KybStatus.APPROVED,
    });

    const updated = await service.updateDetails("u-1", {
      contactPhone: "+234900111222",
      businessEmail: "ops@agroltd.ng",
      businessAddress: "14 Wharf Road, Apapa, Lagos",
    });

    expect(updated.contactPhone).toBe("+234900111222");
    expect(updated.businessEmail).toBe("ops@agroltd.ng");
  });

  it("uploadDocument rejects if profile is already APPROVED", async () => {
    prisma.businessProfile.findUnique.mockResolvedValue({
      id: "bp-1",
      userId: "u-1",
      kybStatus: KybStatus.APPROVED,
    });

    await expect(
      service.uploadDocument("u-1", {
        documentType: KybDocumentType.CERTIFICATE_OF_INCORPORATION,
        fileName: "cac-cert.pdf",
        mimeType: "application/pdf",
        fileSizeBytes: 120_000,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("uploadDocument stores in R2 and resets kybSubmittedAt when PENDING/REJECTED", async () => {
    prisma.businessProfile.findUnique.mockResolvedValue({
      id: "bp-1",
      userId: "u-1",
      kybStatus: KybStatus.PENDING,
    });
    prisma.kybDocument.create.mockResolvedValue({
      id: "doc-1",
      businessProfileId: "bp-1",
      documentType: KybDocumentType.CERTIFICATE_OF_INCORPORATION,
      fileName: "cac-cert.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 120_000,
      createdAt: new Date("2026-10-16T07:00:00Z"),
    });
    prisma.businessProfile.update.mockResolvedValue({});

    const doc = await service.uploadDocument("u-1", {
      documentType: KybDocumentType.CERTIFICATE_OF_INCORPORATION,
      fileName: "cac-cert.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 120_000,
    });

    expect(doc.id).toBe("doc-1");
    expect(storage.uploadPrivateObject).toHaveBeenCalled();
    expect(prisma.businessProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "bp-1" },
        data: expect.objectContaining({
          kybStatus: KybStatus.PENDING,
          kybSubmittedAt: expect.any(Date),
        }),
      }),
    );
  });

  it("getAdminDocumentSignedUrl records verificationAccessLog and returns signed URL", async () => {
    prisma.kybDocument.findUnique.mockResolvedValue({
      id: "doc-1",
      businessProfileId: "bp-1",
      objectKey: "kyb/bp-1/doc-1.pdf",
      fileName: "cac-cert.pdf",
      mimeType: "application/pdf",
    });

    const res = await service.getAdminDocumentSignedUrl("admin-1", "doc-1");
    expect(res.documentId).toBe("doc-1");
    expect(res.signedUrl).toContain("data:application/pdf;base64");
    expect(prisma.verificationAccessLog.create).toHaveBeenCalledWith({
      data: {
        adminId: "admin-1",
        documentId: "doc-1",
        target: "bp-1",
      },
    });
  });

  it("decide approves profile and records adminAuditLog", async () => {
    prisma.businessProfile.findUnique.mockResolvedValue({ id: "bp-1", kybStatus: KybStatus.PENDING });
    prisma.businessProfile.update.mockResolvedValue({ id: "bp-1", kybStatus: KybStatus.APPROVED });

    const updated = await service.decide("bp-1", "admin-1", { decision: "APPROVE" });
    expect(updated.kybStatus).toBe(KybStatus.APPROVED);
    expect(prisma.businessProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "bp-1" },
        data: expect.objectContaining({ kybStatus: KybStatus.APPROVED, kybReviewedBy: "admin-1" }),
      }),
    );
    expect(prisma.adminAuditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        adminId: "admin-1",
        action: "KYB_APPROVE",
        targetType: "BusinessProfile",
        targetId: "bp-1",
      }),
    });
  });

  it("decide allows admin to edit KYB status even after APPROVED (e.g. reset to PENDING or REJECT)", async () => {
    prisma.businessProfile.findUnique.mockResolvedValue({ id: "bp-1", kybStatus: KybStatus.APPROVED });
    prisma.businessProfile.update.mockResolvedValue({ id: "bp-1", kybStatus: KybStatus.PENDING });

    const updated = await service.decide("bp-1", "admin-1", {
      decision: "PENDING",
      reason: "Re-opened for compliance re-verification",
    });
    expect(updated.kybStatus).toBe(KybStatus.PENDING);
    expect(prisma.adminAuditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        adminId: "admin-1",
        action: "KYB_RESET_PENDING",
        targetType: "BusinessProfile",
        targetId: "bp-1",
      }),
    });
  });
});
