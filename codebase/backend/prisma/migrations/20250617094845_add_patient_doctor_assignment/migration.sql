-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "PatientDoctorAssignment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientDoctorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatientDoctorAssignment_patientId_idx" ON "PatientDoctorAssignment"("patientId");

-- CreateIndex
CREATE INDEX "PatientDoctorAssignment_doctorId_idx" ON "PatientDoctorAssignment"("doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientDoctorAssignment_patientId_doctorId_key" ON "PatientDoctorAssignment"("patientId", "doctorId");

-- AddForeignKey
ALTER TABLE "PatientDoctorAssignment" ADD CONSTRAINT "PatientDoctorAssignment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDoctorAssignment" ADD CONSTRAINT "PatientDoctorAssignment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
