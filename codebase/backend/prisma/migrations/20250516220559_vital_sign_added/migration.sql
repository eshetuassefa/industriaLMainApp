-- AlterTable
ALTER TABLE "MedicalRecord" ADD COLUMN     "bloodPressure" TEXT,
ADD COLUMN     "chiefComplaint" TEXT,
ADD COLUMN     "heartRate" INTEGER,
ADD COLUMN     "physicalExamination" TEXT,
ADD COLUMN     "temperature" DOUBLE PRECISION;
