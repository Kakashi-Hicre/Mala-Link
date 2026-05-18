/*
  Warnings:

  - You are about to drop the column `fileType` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the `ApplicationForm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IDCard` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `captureMethod` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentType` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PASSPORT_PHOTO', 'FINGERPRINT', 'DIGITAL_SIGNATURE', 'NATIONAL_ID_SCAN', 'MEDICAL_CERTIFICATE', 'BIRTH_CERTIFICATE', 'SUPPORTING_DOC');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('NEVER_MARRIED', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "LicenceCategory" AS ENUM ('A', 'B', 'C1', 'C', 'D1', 'D');

-- CreateEnum
CREATE TYPE "CaptureMethod" AS ENUM ('WEBCAM', 'UPLOAD');

-- DropForeignKey
ALTER TABLE "ApplicationForm" DROP CONSTRAINT "ApplicationForm_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "IDCard" DROP CONSTRAINT "IDCard_applicationId_fkey";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "fileType",
ADD COLUMN     "captureMethod" "CaptureMethod" NOT NULL,
ADD COLUMN     "documentType" "DocumentType" NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL;

-- DropTable
DROP TABLE "ApplicationForm";

-- DropTable
DROP TABLE "IDCard";

-- CreateTable
CREATE TABLE "NrbForm" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "otherNames" TEXT,
    "surname" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "sex" "Sex" NOT NULL,
    "maritalStatus" "MaritalStatus" NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Malawian',
    "secondNationality" TEXT,
    "colourOfEyes" TEXT NOT NULL,
    "heightMeters" DOUBLE PRECISION NOT NULL,
    "phone" TEXT NOT NULL,
    "birthCertNo" TEXT,
    "passportNo" TEXT,
    "disability" TEXT,
    "birthDistrict" TEXT NOT NULL,
    "birthTA" TEXT NOT NULL,
    "birthVillage" TEXT NOT NULL,
    "residentialDistrict" TEXT NOT NULL,
    "residentialTA" TEXT NOT NULL,
    "residentialVillage" TEXT NOT NULL,
    "permanentDistrict" TEXT NOT NULL,
    "permanentTA" TEXT NOT NULL,
    "permanentVillage" TEXT NOT NULL,
    "motherFullName" TEXT NOT NULL,
    "motherNationality" TEXT NOT NULL DEFAULT 'Malawian',
    "motherIdNo" TEXT,
    "motherDistrict" TEXT NOT NULL,
    "motherTA" TEXT,
    "motherVillage" TEXT,
    "fatherFullName" TEXT NOT NULL,
    "fatherNationality" TEXT NOT NULL DEFAULT 'Malawian',
    "fatherIdNo" TEXT,
    "fatherDistrict" TEXT NOT NULL,
    "fatherTA" TEXT,
    "fatherVillage" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NrbForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImmigrationForm" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "givenNames" TEXT NOT NULL,
    "maidenName" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "placeOfBirth" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Malawian',
    "occupation" TEXT NOT NULL,
    "nationalIdNo" TEXT NOT NULL,
    "heightMeters" DOUBLE PRECISION NOT NULL,
    "eyeColour" TEXT NOT NULL,
    "permanentAddress" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "previousPassportNo" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImmigrationForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrtssForm" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "sex" "Sex" NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Malawian',
    "nationalIdNo" TEXT NOT NULL,
    "residentialAddress" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "licenceCategories" "LicenceCategory"[],
    "existingLicenceNo" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrtssForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdCard" (
    "id" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "holderName" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "cardStatus" "CardStatus" NOT NULL DEFAULT 'ACTIVE',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicationId" TEXT,

    CONSTRAINT "IdCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NrbForm_applicationId_key" ON "NrbForm"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "ImmigrationForm_applicationId_key" ON "ImmigrationForm"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "DrtssForm_applicationId_key" ON "DrtssForm"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "IdCard_cardNumber_key" ON "IdCard"("cardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "IdCard_applicationId_key" ON "IdCard"("applicationId");

-- AddForeignKey
ALTER TABLE "NrbForm" ADD CONSTRAINT "NrbForm_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImmigrationForm" ADD CONSTRAINT "ImmigrationForm_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrtssForm" ADD CONSTRAINT "DrtssForm_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdCard" ADD CONSTRAINT "IdCard_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;
