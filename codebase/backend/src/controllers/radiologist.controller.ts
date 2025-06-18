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

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."));
    }
  },
});

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

// Helper function to compute fullName with null safety
const getFullName = (person: any) => {
  return `${person?.firstName || ""} ${person?.middleName || ""} ${
    person?.lastName || ""
  }`.trim();
};

// Helper function to handle file uploads
const handleFileUpload = (req: Request) => {
  let imageUrls: string[] = [];
  
  if (req.files) {
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    imageUrls = files.map(file => `/uploads/${file.filename}`);
  }
  
  return imageUrls;
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
        include: {
          medicalRecord: {
            include: {
              patient: { include: { person: true } },
              doctor: { include: { person: true } },
            },
          },
        },
      });

      // Transform response to include fullName with null safety
      const transformedRequest = {
        ...request,
        medicalRecord: {
          ...request.medicalRecord,
          patient: {
            ...request.medicalRecord.patient,
            person: {
              ...request.medicalRecord.patient.person,
              fullName: getFullName(request.medicalRecord.patient.person),
            },
          },
          doctor: request.medicalRecord.doctor
            ? {
                ...request.medicalRecord.doctor,
                person: {
                  ...request.medicalRecord.doctor.person,
                  fullName: getFullName(request.medicalRecord.doctor.person),
                },
              }
            : null,
        },
      };

      res.status(201).json({
        message: "Radiology request created successfully",
        data: transformedRequest,
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
        include: {
          medicalRecord: {
            include: {
              patient: { include: { person: true } },
              doctor: { include: { person: true } },
            },
          },
        },
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
        include: {
          radiologist: { include: { person: true } },
          medicalRecord: {
            include: {
              patient: { include: { person: true } },
              doctor: { include: { person: true } },
            },
          },
        },
      });

      // Transform response to include fullName with null safety
      const transformedReport = {
        ...report,
        radiologist: report.radiologist
          ? {
              ...report.radiologist,
              person: {
                ...report.radiologist.person,
                fullName: getFullName(report.radiologist.person),
              },
            }
          : null,
        medicalRecord: {
          ...report.medicalRecord,
          patient: {
            ...report.medicalRecord.patient,
            person: {
              ...report.medicalRecord.patient.person,
              fullName: getFullName(report.medicalRecord.patient.person),
            },
          },
          doctor: report.medicalRecord.doctor
            ? {
                ...report.medicalRecord.doctor,
                person: {
                  ...report.medicalRecord.doctor.person,
                  fullName: getFullName(report.medicalRecord.doctor.person),
                },
              }
            : null,
        },
      };

      await prisma.radiologyRequest.update({
        where: { id: requestId },
        data: { status: "IN_PROGRESS" },
      });

      res.status(201).json({
        message: "Radiology report started",
        data: transformedReport,
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

      const request = await prisma.radiologyRequest.findUnique({
        where: { id: requestId },
        include: {
          report: {
            include: {
              radiologist: { include: { person: true } },
              medicalRecord: {
                include: {
                  patient: { include: { person: true } },
                  doctor: { include: { person: true } },
                },
              },
            },
          },
        },
      });

      if (!request || !request.report) {
        res
          .status(404)
          .json({ message: "Associated radiology report not found" });
        return;
      }

      const imageUrls = handleFileUpload(req);

      const updatedReport = await prisma.radiologyReport.update({
        where: { id: request.report.id },
        data: {
          reportText,
          notes,
          imageUrls: imageUrls.length ? { set: imageUrls } : undefined,
          reportDate: new Date(),
        },
        include: {
          radiologist: { include: { person: true } },
          medicalRecord: {
            include: {
              patient: { include: { person: true } },
              doctor: { include: { person: true } },
            },
          },
        },
      });

      // Transform response to include fullName with null safety
      const transformedReport = {
        ...updatedReport,
        radiologist: updatedReport.radiologist
          ? {
              ...updatedReport.radiologist,
              person: {
                ...updatedReport.radiologist.person,
                fullName: getFullName(updatedReport.radiologist.person),
              },
            }
          : null,
        medicalRecord: {
          ...updatedReport.medicalRecord,
          patient: {
            ...updatedReport.medicalRecord.patient,
            person: {
              ...updatedReport.medicalRecord.patient.person,
              fullName: getFullName(updatedReport.medicalRecord.patient.person),
            },
          },
          doctor: updatedReport.medicalRecord.doctor
            ? {
                ...updatedReport.medicalRecord.doctor,
                person: {
                  ...updatedReport.medicalRecord.doctor.person,
                  fullName: getFullName(
                    updatedReport.medicalRecord.doctor.person
                  ),
                },
              }
            : null,
        },
      };

      await prisma.radiologyRequest.update({
        where: { id: requestId },
        data: { status: "COMPLETED" },
      });

      res.status(200).json({
        message: "Radiology report submitted successfully",
        data: transformedReport,
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
          radiologist: {
            include: { person: true },
          },
          medicalRecord: {
            include: {
              patient: { include: { person: true } },
              doctor: { include: { person: true } },
            },
          },
        },
      });

      if (!report) {
        res.status(404).json({ message: "Radiology report not found" });
        return;
      }

      if (
        report.radiologistId !== req.user!.id &&
        report.medicalRecord.doctorId !== req.user!.id &&
        req.user!.role !== "SUPERADMIN"
      ) {
        res.status(403).json({ message: "Access denied to this report" });
        return;
      }

      // Transform response to include fullName with null safety
      const transformedReport = {
        ...report,
        radiologist: report.radiologist
          ? {
              ...report.radiologist,
              person: {
                ...report.radiologist.person,
                fullName: getFullName(report.radiologist.person),
              },
            }
          : null,
        medicalRecord: {
          ...report.medicalRecord,
          patient: {
            ...report.medicalRecord.patient,
            person: {
              ...report.medicalRecord.patient.person,
              fullName: getFullName(report.medicalRecord.patient.person),
            },
          },
          doctor: report.medicalRecord.doctor
            ? {
                ...report.medicalRecord.doctor,
                person: {
                  ...report.medicalRecord.doctor.person,
                  fullName: getFullName(report.medicalRecord.doctor.person),
                },
              }
            : null,
        },
      };

      res.status(200).json({
        message: "Radiology report retrieved successfully",
        data: transformedReport,
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
            include: {
              patient: { include: { person: true } },
              doctor: { include: { person: true } },
            },
          },
          report: {
            include: {
              radiologist: { include: { person: true } },
            },
          },
        },
      });

      // Transform response to include fullName with null safety
      const transformedRequests = requests.map((request) => ({
        ...request,
        medicalRecord: {
          ...request.medicalRecord,
          patient: {
            ...request.medicalRecord.patient,
            person: {
              ...request.medicalRecord.patient.person,
              fullName: getFullName(request.medicalRecord.patient.person),
            },
          },
          doctor: request.medicalRecord.doctor
            ? {
                ...request.medicalRecord.doctor,
                person: {
                  ...request.medicalRecord.doctor.person,
                  fullName: getFullName(request.medicalRecord.doctor.person),
                },
              }
            : null,
        },
        report: request.report
          ? {
              ...request.report,
              radiologist: request.report.radiologist
                ? {
                    ...request.report.radiologist,
                    person: {
                      ...request.report.radiologist.person,
                      fullName: getFullName(request.report.radiologist.person),
                    },
                  }
                : null,
            }
          : null,
      }));

      res.status(200).json({
        message: "All radiology requests retrieved successfully",
        data: transformedRequests,
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
            include: {
              patient: { include: { person: true } },
              doctor: { include: { person: true } },
            },
          },
          report: {
            include: {
              radiologist: { include: { person: true } },
            },
          },
        },
      });

      if (!request) {
        res.status(404).json({ message: "Radiology request not found" });
        return;
      }

      // Transform response to include fullName with null safety
      const transformedRequest = {
        ...request,
        medicalRecord: {
          ...request.medicalRecord,
          patient: {
            ...request.medicalRecord.patient,
            person: {
              ...request.medicalRecord.patient.person,
              fullName: getFullName(request.medicalRecord.patient.person),
            },
          },
          doctor: request.medicalRecord.doctor
            ? {
                ...request.medicalRecord.doctor,
                person: {
                  ...request.medicalRecord.doctor.person,
                  fullName: getFullName(request.medicalRecord.doctor.person),
                },
              }
            : null,
        },
        report: request.report
          ? {
              ...request.report,
              radiologist: request.report.radiologist
                ? {
                    ...request.report.radiologist,
                    person: {
                      ...request.report.radiologist.person,
                      fullName: getFullName(request.report.radiologist.person),
                    },
                  }
                : null,
            }
          : null,
      };

      res.status(200).json({
        message: "Radiology request retrieved successfully",
        data: transformedRequest,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to retrieve radiology request" });
    }
  }
);

// Export the upload middleware
export const uploadMiddleware = upload.array("images", 5); // Allow up to 5 images
