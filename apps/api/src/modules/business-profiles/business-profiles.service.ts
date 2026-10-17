import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { createHash, randomUUID } from "crypto";
import {
  ErrorCode,
  KybStatus,
  type KybDecisionInput,
  type SubmitKybInput,
  type UpdateBusinessDetailsInput,
  type UploadKybDocumentInput,
} from "@afritrade/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { R2StorageService } from "./r2-storage.service";

@Injectable()
export class BusinessProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage?: R2StorageService,
  ) {}

  private hashIdentifier(raw: string): string {
    return createHash("sha256").update(raw.trim().toUpperCase()).digest("hex");
  }

  private maskIdentifier(raw: string): string {
    const cleaned = raw.trim();
    if (cleaned.length <= 4) {
      return cleaned;
    }
    const prefix = cleaned.slice(0, Math.min(3, cleaned.length - 4));
    const suffix = cleaned.slice(-4);
    return `${prefix}****${suffix}`;
  }

  private shapeProfile(profile: any) {
    if (!profile) return profile;
    const {
      registrationNumberHash: _regHash,
      taxIdHash: _taxHash,
      ...safeProfile
    } = profile;

    return {
      ...safeProfile,
      countryCode: profile.country?.isoCode ?? profile.countryCode,
      documents: Array.isArray(profile.documents)
        ? profile.documents.map((doc: any) => ({
            id: doc.id,
            businessProfileId: doc.businessProfileId,
            documentType: doc.documentType,
            fileName: doc.fileName,
            mimeType: doc.mimeType,
            fileSizeBytes: doc.fileSizeBytes,
            createdAt:
              doc.createdAt instanceof Date
                ? doc.createdAt.toISOString()
                : String(doc.createdAt),
          }))
        : undefined,
    };
  }

  async getMine(userId: string) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
      include: {
        country: true,
        documents: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!profile) {
      throw new NotFoundException({
        code: ErrorCode.KYB_PROFILE_NOT_FOUND,
        message: "Business profile not found",
      });
    }
    return this.shapeProfile(profile);
  }

  async getByIdForAdmin(profileId: string) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { id: profileId },
      include: {
        country: true,
        user: true,
        documents: { orderBy: { createdAt: "desc" } },
        products: { where: { isActive: true }, select: { id: true } },
      },
    });
    if (!profile) {
      throw new NotFoundException({
        code: ErrorCode.KYB_PROFILE_NOT_FOUND,
        message: "Business profile not found",
      });
    }
    return {
      ...this.shapeProfile(profile),
      activeListingsCount: Array.isArray(profile.products) ? profile.products.length : 0,
    };
  }

  /**
   * Operational business profile details (contactPhone, businessEmail, businessAddress,
   * website, description, primaryCategory) can be updated by the supplier at any time,
   * even after KYB is APPROVED.
   */
  async updateDetails(userId: string, input: UpdateBusinessDetailsInput) {
    const existing = await this.prisma.businessProfile.findUnique({
      where: { userId },
    });
    if (!existing) {
      throw new NotFoundException({
        code: ErrorCode.KYB_PROFILE_NOT_FOUND,
        message: "Submit your initial business profile before editing operational details",
      });
    }

    const updated = await this.prisma.businessProfile.update({
      where: { userId },
      data: {
        ...(input.contactPhone !== undefined
          ? { contactPhone: input.contactPhone.trim() || null }
          : {}),
        ...(input.businessEmail !== undefined
          ? { businessEmail: input.businessEmail.trim() || null }
          : {}),
        ...(input.businessAddress !== undefined
          ? { businessAddress: input.businessAddress.trim() || null }
          : {}),
        ...(input.website !== undefined
          ? { website: input.website.trim() || null }
          : {}),
        ...(input.description !== undefined
          ? { description: input.description.trim() || null }
          : {}),
        ...(input.primaryCategory !== undefined
          ? { primaryCategory: input.primaryCategory.trim() || null }
          : {}),
      },
      include: {
        country: true,
        documents: { orderBy: { createdAt: "desc" } },
      },
    });

    return this.shapeProfile(updated);
  }

  /**
   * Submits or updates KYB registration details.
   * Permitted only while unverified (NOT_SUBMITTED, PENDING, or REJECTED).
   * Updating while PENDING resets kybSubmittedAt (extending verification review window).
   */
  async submit(userId: string, input: SubmitKybInput) {
    const existing = await this.prisma.businessProfile.findUnique({ where: { userId } });
    if (existing && existing.kybStatus === KybStatus.APPROVED) {
      throw new BadRequestException({
        code: ErrorCode.KYB_PROFILE_ALREADY_REVIEWED,
        message: "Business profile is already approved and KYB credentials are locked",
      });
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_FOUND,
        message: "User not found",
      });
    }

    let countryId = user.countryId;
    if (input.countryCode && this.prisma.country?.findUnique) {
      const country = await this.prisma.country.findUnique({
        where: { isoCode: input.countryCode.toUpperCase() },
      });
      if (country) {
        countryId = country.id;
      }
    }

    const registrationData = input.registrationNumber?.trim()
      ? {
          registrationNumberHash: this.hashIdentifier(input.registrationNumber),
          registrationNumberMasked: this.maskIdentifier(input.registrationNumber),
        }
      : {};

    const taxData = input.taxId?.trim()
      ? {
          taxIdHash: this.hashIdentifier(input.taxId),
          taxIdMasked: this.maskIdentifier(input.taxId),
        }
      : {};

    const now = new Date();

    const upserted = await this.prisma.businessProfile.upsert({
      where: { userId },
      create: {
        userId,
        businessName: input.businessName,
        countryId,
        contactPhone: input.contactPhone ?? null,
        businessAddress: input.businessAddress ?? null,
        primaryCategory: input.primaryCategory ?? null,
        ...registrationData,
        ...taxData,
        kybStatus: KybStatus.PENDING,
        kybSubmittedAt: now,
      },
      update: {
        businessName: input.businessName,
        countryId,
        contactPhone: input.contactPhone ?? existing?.contactPhone ?? null,
        ...(input.businessAddress !== undefined
          ? { businessAddress: input.businessAddress || null }
          : {}),
        ...(input.primaryCategory !== undefined
          ? { primaryCategory: input.primaryCategory || null }
          : {}),
        ...registrationData,
        ...taxData,
        kybStatus: KybStatus.PENDING,
        kybSubmittedAt: now,
        kybRejectReason: null,
      },
      include: {
        country: true,
        documents: { orderBy: { createdAt: "desc" } },
      },
    });

    return this.shapeProfile(upserted);
  }

  /**
   * Uploads a KYB document to private Cloudflare R2 storage (or simulated R2 in dev/CI)
   * and attaches it to the supplier's BusinessProfile.
   * Allowed only while kybStatus !== APPROVED.
   */
  async uploadDocument(userId: string, input: UploadKybDocumentInput) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException({
        code: ErrorCode.KYB_PROFILE_NOT_FOUND,
        message: "Submit your business profile details before uploading KYB documents",
      });
    }

    if (profile.kybStatus === KybStatus.APPROVED) {
      throw new BadRequestException({
        code: ErrorCode.KYB_EDIT_LOCKED_WHEN_APPROVED,
        message: "KYB documents cannot be modified after verification is approved",
      });
    }

    const sanitizedName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectKey = `kyb/${profile.id}/${randomUUID()}-${sanitizedName}`;

    if (this.storage) {
      await this.storage.uploadPrivateObject({
        objectKey,
        mimeType: input.mimeType,
        fileBase64: input.fileBase64,
      });
    }

    const doc = await this.prisma.kybDocument.create({
      data: {
        businessProfileId: profile.id,
        documentType: input.documentType as any,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSizeBytes: input.fileSizeBytes,
        objectKey,
        uploadedById: userId,
      },
    });

    // Reset kybSubmittedAt (and move REJECTED/NOT_SUBMITTED -> PENDING) because document modifications require fresh compliance review
    await this.prisma.businessProfile.update({
      where: { id: profile.id },
      data: {
        kybStatus: KybStatus.PENDING,
        kybSubmittedAt: new Date(),
        kybRejectReason: null,
      },
    });

    return {
      id: doc.id,
      businessProfileId: doc.businessProfileId,
      documentType: doc.documentType,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      fileSizeBytes: doc.fileSizeBytes,
      createdAt:
        doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
    };
  }

  async deleteDocument(userId: string, documentId: string) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException({
        code: ErrorCode.KYB_PROFILE_NOT_FOUND,
        message: "Business profile not found",
      });
    }
    if (profile.kybStatus === KybStatus.APPROVED) {
      throw new BadRequestException({
        code: ErrorCode.KYB_EDIT_LOCKED_WHEN_APPROVED,
        message: "KYB documents cannot be deleted after verification is approved",
      });
    }

    const doc = await this.prisma.kybDocument.findUnique({
      where: { id: documentId },
    });
    if (!doc || doc.businessProfileId !== profile.id) {
      throw new NotFoundException({
        code: ErrorCode.KYB_DOCUMENT_NOT_FOUND,
        message: "KYB document not found",
      });
    }

    if (this.storage) {
      await this.storage.deletePrivateObject(doc.objectKey);
    }

    await this.prisma.kybDocument.delete({
      where: { id: documentId },
    });

    await this.prisma.businessProfile.update({
      where: { id: profile.id },
      data: { kybSubmittedAt: new Date() },
    });

    return { deleted: true, id: documentId };
  }

  async getSupplierDocumentSignedUrl(userId: string, documentId: string) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException({
        code: ErrorCode.KYB_PROFILE_NOT_FOUND,
        message: "Business profile not found",
      });
    }

    const doc = await this.prisma.kybDocument.findUnique({
      where: { id: documentId },
    });
    if (!doc || doc.businessProfileId !== profile.id) {
      throw new NotFoundException({
        code: ErrorCode.KYB_DOCUMENT_NOT_FOUND,
        message: "KYB document not found",
      });
    }

    const signed = this.storage
      ? await this.storage.getSignedReadUrl({
          objectKey: doc.objectKey,
          fileName: doc.fileName,
          mimeType: doc.mimeType,
        })
      : {
          signedUrl: `data:${doc.mimeType};base64,`,
          expiresAt: new Date(Date.now() + 300_000).toISOString(),
          storageMode: "simulated" as const,
        };

    return {
      documentId: doc.id,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      ...signed,
    };
  }

  /**
   * Generates a short-lived signed URL for an Admin to view a KYB document
   * and writes an audit record to `verification_access_logs` per RULES §3.
   */
  async getAdminDocumentSignedUrl(adminId: string, documentId: string) {
    const doc = await this.prisma.kybDocument.findUnique({
      where: { id: documentId },
    });
    if (!doc) {
      throw new NotFoundException({
        code: ErrorCode.KYB_DOCUMENT_NOT_FOUND,
        message: "KYB document not found",
      });
    }

    if (this.prisma.verificationAccessLog?.create) {
      await this.prisma.verificationAccessLog.create({
        data: {
          adminId,
          documentId: doc.id,
          target: doc.businessProfileId,
        },
      });
    }

    const signed = this.storage
      ? await this.storage.getSignedReadUrl({
          objectKey: doc.objectKey,
          fileName: doc.fileName,
          mimeType: doc.mimeType,
        })
      : {
          signedUrl: `data:${doc.mimeType};base64,`,
          expiresAt: new Date(Date.now() + 300_000).toISOString(),
          storageMode: "simulated" as const,
        };

    return {
      documentId: doc.id,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      ...signed,
    };
  }

  async queue(status: KybStatus = KybStatus.PENDING) {
    const profiles = await this.prisma.businessProfile.findMany({
      where: { kybStatus: status },
      include: {
        country: true,
        user: true,
        documents: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return profiles.map((p: any) => this.shapeProfile(p));
  }

  async decide(profileId: string, adminId: string, decision: KybDecisionInput) {
    const profile = await this.prisma.businessProfile.findUnique({ where: { id: profileId } });
    if (!profile) {
      throw new NotFoundException({
        code: ErrorCode.KYB_PROFILE_NOT_FOUND,
        message: "Business profile not found",
      });
    }

    const nextStatus =
      decision.decision === "APPROVE"
        ? KybStatus.APPROVED
        : decision.decision === "PENDING"
          ? KybStatus.PENDING
          : KybStatus.REJECTED;

    const updated = await this.prisma.businessProfile.update({
      where: { id: profileId },
      data: {
        kybStatus: nextStatus as any,
        kybReviewedBy: adminId,
        kybReviewedAt: new Date(),
        kybRejectReason:
          decision.decision === "REJECT" ? decision.reason ?? null : null,
      },
      include: {
        country: true,
        documents: { orderBy: { createdAt: "desc" } },
      },
    });

    // Write AdminAuditLog per RULES §4
    if (this.prisma.adminAuditLog?.create) {
      await this.prisma.adminAuditLog.create({
        data: {
          adminId,
          action:
            decision.decision === "APPROVE"
              ? "KYB_APPROVE"
              : decision.decision === "PENDING"
                ? "KYB_RESET_PENDING"
                : "KYB_REJECT",
          targetType: "BusinessProfile",
          targetId: profileId,
          reason: decision.reason ?? null,
        },
      });
    }

    return this.shapeProfile(updated);
  }
}
