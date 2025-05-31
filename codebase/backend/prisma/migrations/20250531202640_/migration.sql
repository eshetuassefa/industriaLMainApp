-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_hospitalId_fkey";

-- AlterTable
ALTER TABLE "Department" ALTER COLUMN "hospitalId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE SET NULL ON UPDATE CASCADE;
