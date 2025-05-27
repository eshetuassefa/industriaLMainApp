/*
  Warnings:

  - You are about to drop the column `medicineName` on the `Prescription` table. All the data in the column will be lost.
*/

-- CreateEnum
CREATE TYPE "DosageForm" AS ENUM ('TABLET', 'CAPSULE', 'LIQUID', 'INJECTION', 'TOPICAL', 'SUPPOSITORY', 'POWDER', 'OTHER');

-- CreateEnum
CREATE TYPE "DrugStatus" AS ENUM ('ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK');

-- Step 1: Create Drug table first with proper defaults
CREATE TABLE "Drug" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "dosageForm" "DosageForm" NOT NULL,
    "strength" TEXT NOT NULL,
    "manufacturer" TEXT,
    "status" "DrugStatus" NOT NULL DEFAULT 'ACTIVE',
    "reorderLevel" INTEGER DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Drug_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create temporary default drug
INSERT INTO "Drug" ("id", "name", "dosageForm", "strength")
VALUES (
    gen_random_uuid(),
    'LEGACY_MEDICATION',
    'TABLET'::"DosageForm",
    'UNKNOWN'
);

-- Step 3: Modify Prescription table in stages
-- First add nullable column
ALTER TABLE "Prescription" 
    ADD COLUMN "drugId" TEXT REFERENCES "Drug"("id"),
    ADD COLUMN "dispensed" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "quantity" INTEGER DEFAULT 1;

-- Migrate existing prescriptions to use temporary drug
UPDATE "Prescription" 
SET "drugId" = (SELECT "id" FROM "Drug" WHERE "name" = 'LEGACY_MEDICATION');

-- Now enforce non-null constraint
ALTER TABLE "Prescription" 
    ALTER COLUMN "drugId" SET NOT NULL,
    DROP COLUMN "medicineName";

-- Step 4: Create DrugInventory table
CREATE TABLE "DrugInventory" (
    "id" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "supplier" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DOUBLE PRECISION,
    "sellingPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DrugInventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Drug_name_key" ON "Drug"("name");

-- AddForeignKey
ALTER TABLE "DrugInventory" ADD CONSTRAINT "DrugInventory_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE RESTRICT ON UPDATE CASCADE;