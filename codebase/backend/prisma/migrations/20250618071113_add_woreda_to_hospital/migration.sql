/*
  Warnings:

  - Added the required column `woreda` to the `Hospital` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "woreda" TEXT;

-- Update existing records with a default value
UPDATE "Hospital" SET "woreda" = 'Unknown' WHERE "woreda" IS NULL;

-- Now make the column required
ALTER TABLE "Hospital" ALTER COLUMN "woreda" SET NOT NULL;

-- AlterTable
ALTER TABLE "RadiologyReport" ADD COLUMN     "imageUrls" JSONB;
