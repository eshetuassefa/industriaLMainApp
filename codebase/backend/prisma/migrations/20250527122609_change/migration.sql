/*
  Warnings:

  - You are about to drop the column `drugId` on the `Prescription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[radiologyRequestId]` on the table `RadiologyReport` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `drugName` to the `Prescription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'DELIVERED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_drugId_fkey";

-- DropForeignKey
ALTER TABLE "TestType" DROP CONSTRAINT "TestType_departmentId_fkey";

-- AlterTable
ALTER TABLE "Prescription" DROP COLUMN "drugId",
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "deliveredById" TEXT,
ADD COLUMN     "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "drugName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RadiologyReport" ADD COLUMN     "radiologyRequestId" TEXT;

-- AlterTable
ALTER TABLE "TestRequest" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TestType" ALTER COLUMN "departmentId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "RadiologyRequest" (
    "id" TEXT NOT NULL,
    "medicalRecordId" TEXT NOT NULL,
    "imagingType" TEXT NOT NULL,
    "bodyPart" TEXT,
    "notes" TEXT,
    "status" "TestStatus" NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadiologyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RadiologyReport_radiologyRequestId_key" ON "RadiologyReport"("radiologyRequestId");

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_deliveredById_fkey" FOREIGN KEY ("deliveredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadiologyRequest" ADD CONSTRAINT "RadiologyRequest_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadiologyReport" ADD CONSTRAINT "RadiologyReport_radiologyRequestId_fkey" FOREIGN KEY ("radiologyRequestId") REFERENCES "RadiologyRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestType" ADD CONSTRAINT "TestType_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
