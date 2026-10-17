-- CreateEnum
CREATE TYPE "KybDocumentType" AS ENUM ('CERTIFICATE_OF_INCORPORATION', 'TAX_CLEARANCE_CERTIFICATE', 'DIRECTOR_ID', 'PROOF_OF_ADDRESS', 'OTHER');

-- AlterTable
ALTER TABLE "BusinessProfile"
ADD COLUMN "businessEmail" TEXT,
ADD COLUMN "businessAddress" TEXT,
ADD COLUMN "website" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "primaryCategory" TEXT,
ADD COLUMN "registrationNumberHash" TEXT,
ADD COLUMN "registrationNumberMasked" TEXT,
ADD COLUMN "taxIdHash" TEXT,
ADD COLUMN "taxIdMasked" TEXT,
ADD COLUMN "kybSubmittedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "KybDocument" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "documentType" "KybDocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "objectKey" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KybDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KybDocument_objectKey_key" ON "KybDocument"("objectKey");

-- CreateIndex
CREATE INDEX "KybDocument_businessProfileId_idx" ON "KybDocument"("businessProfileId");

-- AddForeignKey
ALTER TABLE "KybDocument" ADD CONSTRAINT "KybDocument_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
