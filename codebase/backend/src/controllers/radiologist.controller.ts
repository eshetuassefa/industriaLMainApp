import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// 1. Healthcare provider creates a radiology request (using patientId instead of medicalRecordId)
export const createRadiologyRequest = [
  authenticateToken,
  authorizeRoles("HEALTHCARE_PROVIDER"),
  async (req: Request, res: Response) => {
    try {
      const { patientId, imagingType, bodyPart, notes } = req.body;

      // Step 1: Find the latest medical record for this patient
      const latestMedicalRecord = await prisma.medicalRecord.findFirst({
        where: { patientId },
        orderBy: { visitDate: 'desc' },
      });

      if (!latestMedicalRecord) {
        return res.status(404).json({ message: "No medical record found for this patient." });
      }

      // Step 2: Create the radiology request using the medicalRecordId
      const request = await prisma.radiologyRequest.create({
        data: {
          medicalRecordId: latestMedicalRecord.id,
          imagingType,
          bodyPart,
          notes,
          status: "PENDING",
        },
      });

      return res.status(201).json({
        message: "Radiology request created successfully",
        data: request,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to create radiology request" });
    }
  },
];


// 2. Radiologist starts processing the request
export const startRadiologyRequest = [
  authenticateToken,
  authorizeRoles("RADIOLOGIST"),
  async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;

      const request = await prisma.radiologyRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        return res.status(404).json({ message: "Radiology request not found" });
      }

      if (request.status !== "PENDING") {
        return res.status(400).json({ message: "Request already in progress or completed" });
      }

      const report = await prisma.radiologyReport.create({
        data: {
          medicalRecordId: request.medicalRecordId,
          imagingType: request.imagingType,
          bodyPart: request.bodyPart,
          reportDate: new Date(),
          radiologistId: req.user!.id,
          radiologyRequestId: request.id,
        },
      });

      await prisma.radiologyRequest.update({
        where: { id: requestId },
        data: { status: "IN_PROGRESS" },
      });

      return res.status(201).json({
        message: "Radiology report started",
        data: report,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to start radiology request" });
    }
  },
];

// 3. Radiologist submits the report
export const submitRadiologyReport = [
  authenticateToken,
  authorizeRoles("RADIOLOGIST"),
  async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;
      const { reportText, notes } = req.body;

      const report = await prisma.radiologyReport.findFirst({
        where: { radiologyRequestId: requestId },
      });

      if (!report) {
        return res.status(404).json({ message: "Associated radiology report not found" });
      }

      const updatedReport = await prisma.radiologyReport.update({
        where: { id: report.id },
        data: {
          reportText,
          notes,
          reportDate: new Date(),
        },
      });

      await prisma.radiologyRequest.update({
        where: { id: requestId },
        data: { status: "COMPLETED" },
      });

      return res.status(200).json({
        message: "Radiology report submitted successfully",
        data: updatedReport,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to submit radiology report" });
    }
  },
];

// 4. Healthcare provider views radiology report
export const getRadiologyReport = [
  authenticateToken,
  authorizeRoles("HEALTHCARE_PROVIDER", "RADIOLOGIST"),
  async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;

     const report = await prisma.radiologyReport.findFirst({
  where: { radiologyRequestId: requestId },
  include: {
    medicalRecord: true,
    radiologist: {
      select: {
        id: true,
        email: true,
        person: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
    },
  },
});


      if (!report) {
        return res.status(404).json({ message: "Radiology report not found" });
      }

      return res.status(200).json({
        message: "Radiology report retrieved successfully",
        data: report,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to retrieve radiology report" });
    }
  },
];
