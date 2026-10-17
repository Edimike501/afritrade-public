-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('CHARGE_SUCCEEDED', 'REFUND');

-- DropForeignKey
ALTER TABLE "BusinessProfile" DROP CONSTRAINT "BusinessProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_businessProfileId_fkey";

-- AlterTable
ALTER TABLE "BusinessProfile" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Currency" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "minorUnitExponent" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "paymentProvider" "PaymentProviderType" NOT NULL DEFAULT 'MOCK';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredCurrencyId" TEXT;

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
    "targetCurrency" TEXT NOT NULL,
    "ratePerUsd" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentLedgerEntry" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT,
    "type" "LedgerEntryType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currencyId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationAccessLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "documentId" TEXT,
    "target" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_targetCurrency_key" ON "ExchangeRate"("targetCurrency");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLedgerEntry_reference_key" ON "PaymentLedgerEntry"("reference");

-- CreateIndex
CREATE INDEX "PaymentLedgerEntry_paymentId_idx" ON "PaymentLedgerEntry"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentLedgerEntry_currencyId_idx" ON "PaymentLedgerEntry"("currencyId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_adminId_idx" ON "AdminAuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_targetType_targetId_idx" ON "AdminAuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "VerificationAccessLog_adminId_idx" ON "VerificationAccessLog"("adminId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_preferredCurrencyId_fkey" FOREIGN KEY ("preferredCurrencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLedgerEntry" ADD CONSTRAINT "PaymentLedgerEntry_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLedgerEntry" ADD CONSTRAINT "PaymentLedgerEntry_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
