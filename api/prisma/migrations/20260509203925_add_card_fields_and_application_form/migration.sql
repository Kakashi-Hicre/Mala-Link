/*
  Warnings:

  - Added the required column `dateOfBirth` to the `IDCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiryDate` to the `IDCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `holderName` to the `IDCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sex` to the `IDCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `IDCard` table without a default value. This is not possible if the table is not empty.
  - Made the column `issuedAt` on table `IDCard` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'LOST', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- DropForeignKey
ALTER TABLE "IDCard" DROP CONSTRAINT "IDCard_applicationId_fkey";

-- AlterTable
ALTER TABLE "IDCard" ADD COLUMN     "cardStatus" "CardStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "expiryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "holderName" TEXT NOT NULL,
ADD COLUMN     "sex" "Sex" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "issuedAt" SET NOT NULL,
ALTER COLUMN "issuedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "applicationId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ApplicationForm" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "sex" "Sex" NOT NULL,
    "placeOfBirth" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Malawian',
    "physicalAddress" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "nextOfKinName" TEXT NOT NULL,
    "nextOfKinPhone" TEXT NOT NULL,
    "nextOfKinRelation" TEXT NOT NULL,
    "existingLicenceNo" TEXT,
    "previousPassportNo" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationForm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationForm_applicationId_key" ON "ApplicationForm"("applicationId");

-- AddForeignKey
ALTER TABLE "ApplicationForm" ADD CONSTRAINT "ApplicationForm_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IDCard" ADD CONSTRAINT "IDCard_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;
