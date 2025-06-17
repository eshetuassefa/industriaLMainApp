import { Request, Response, NextFunction, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware";
import multer, { StorageEngine } from "multer";
import path from "path";
import fs from "fs";

// Import the custom types
/// <reference path="../types/express.d.ts" />

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadPath = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Middleware composition function
const composeHandler = (
  middlewares: RequestHandler[],
  handler: (req: Request, res: Response) => Promise<void>
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Execute middlewares sequentially and stop if a response is sent
      for (const middleware of middlewares) {
        await new Promise<void>((resolve, reject) => {
          middleware(req, res, (err) => (err ? reject(err) : resolve()));
        });
        if (res.headersSent) {
          console.log("Response already sent by middleware, skipping handler");
          return; // Exit if middleware sent a response
        }
      }
      if (!res.headersSent) {
        await handler(req, res);
      }
    } catch (error) {
      next(error);
    }
  };
};

export const createRadiologyRequest = composeHandler(
  [authenticateToken, authorizeRoles("HEALTHCARE_PROVIDER")],
  async (req: Request, res: Response): Promise<void> => {
    console.log("Handling createRadiologyRequest");
    try {
      const { patientId, imagingType, bodyPart, notes } = req.body;

      const latestMedicalRecord = await prisma.medicalRecord.findFirst({
        where: { patientId },
        orderBy: { visitDate: "desc" },
      });

      if (!latestMedicalRecord) {
        res
          .status(404)
          .json({ message: "No medical record found for this patient." });
        return;
      }

      const request = await prisma.radiologyRequest.create({
        data: {
          medicalRecordId: latestMedicalRecord.id,
          imagingType,
          bodyPart,
          notes,
          status: "PENDING",
        },
      });

      res.status(201).json({
        message: "Radiology request created successfully",
        data: request,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create radiology request" });
    }
  }
);

export const startRadiologyRequest = composeHandler(
  [authenticateToken, authorizeRoles("RADIOLOGIST")],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;

      const request = await prisma.radiologyRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        res.status(404).json({ message: "Radiology request not found" });
        return;
      }

      if (request.status !== "PENDING") {
        res
          .status(400)
          .json({ message: "Request already in progress or completed" });
        return;
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

      res.status(201).json({
        message: "Radiology report started",
        data: report,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to start radiology request" });
    }
  }
);

export const submitRadiologyReport = composeHandler(
  [authenticateToken, authorizeRoles("RADIOLOGIST"), upload.array("images", 5)],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const { reportText, notes } = req.body;

      const report = await prisma.radiologyReport.findFirst({
        where: { radiologyRequestId: requestId },
      });

      if (!report) {
        res
          .status(404)
          .json({ message: "Associated radiology report not found" });
        return;
      }

      let imageUrls: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        imageUrls = req.files.map(
          (file: Express.Multer.File) => `/uploads/${file.filename}`
        );
      } else if (req.files && typeof req.files === "object") {
        imageUrls = Object.values(req.files)
          .flat()
          .map((file: Express.Multer.File) => `/uploads/${file.filename}`);
      }

      const updatedReport = await prisma.radiologyReport.update({
        where: { id: report.id },
        data: {
          reportText,
          notes,
          imageUrls: imageUrls.length ? { set: imageUrls } : undefined,
          reportDate: new Date(),
        },
      });

      await prisma.radiologyRequest.update({
        where: { id: requestId },
        data: { status: "COMPLETED" },
      });

      res.status(200).json({
        message: "Radiology report submitted successfully",
        data: updatedReport,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to submit radiology report" });
    }
  }
);

export const getRadiologyReport = composeHandler(
  [authenticateToken, authorizeRoles("HEALTHCARE_PROVIDER", "RADIOLOGIST")],
  async (req: Request, res: Response): Promise<void> => {
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
        res.status(404).json({ message: "Radiology report not found" });
        return;
      }

      res.status(200).json({
        message: "Radiology report retrieved successfully",
        data: report,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to retrieve radiology report" });
    }
  }
);

export const getAllRadiologyRequests = composeHandler(
  [
    authenticateToken,
    authorizeRoles("RADIOLOGIST", "HEALTHCARE_PROVIDER", "SUPERADMIN"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const requests = await prisma.radiologyRequest.findMany({
        include: {
          medicalRecord: {
            select: { patientId: true },
          },
          report: true,
        },
      });

      res.status(200).json({
        message: "All radiology requests retrieved successfully",
        data: requests,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Failed to retrieve radiology requests" });
    }
  }
);

export const getRadiologyRequestById = composeHandler(
  [
    authenticateToken,
    authorizeRoles("RADIOLOGIST", "HEALTHCARE_PROVIDER", "SUPERADMIN"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;

      const request = await prisma.radiologyRequest.findUnique({
        where: { id: requestId },
        include: {
          medicalRecord: {
            select: { patientId: true },
          },
          report: true,
        },
      });

      if (!request) {
        res.status(404).json({ message: "Radiology request not found" });
        return;
      }

      res.status(200).json({
        message: "Radiology request retrieved successfully",
        data: request,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to retrieve radiology request" });
    }
  }
);
