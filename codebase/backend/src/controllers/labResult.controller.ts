import { Request, Response, NextFunction, RequestHandler } from "express";
import { PrismaClient, TestStatus, ResultStatus } from "@prisma/client";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware";

// Import the custom types
/// <reference path="../types/express.d.ts" />

const prisma = new PrismaClient();

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

export const createTestRequest = composeHandler(
  [authenticateToken, authorizeRoles("HEALTHCARE_PROVIDER")],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { patientId, testTypeId, hospitalId, notes } = req.body;

      // Validate patient and testType existence
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
      });
      if (!patient) {
        res.status(404).json({ message: "Patient not found" });
        return;
      }

      const testType = await prisma.testType.findUnique({
        where: { id: testTypeId },
      });
      if (!testType) {
        res.status(404).json({ message: "Test type not found" });
        return;
      }

      const hospital = await prisma.hospital.findUnique({
        where: { id: hospitalId },
      });
      if (!hospital) {
        res.status(404).json({ message: "Hospital not found" });
        return;
      }

      const testRequest = await prisma.testRequest.create({
        data: {
          patientId,
          testTypeId,
          hospitalId,
          doctorId: req.user!.id,
          notes,
          status: TestStatus.REQUESTED,
        },
        include: {
          testType: true,
          hospital: true,
        },
      });

      res.status(201).json({
        message: "Test request created successfully",
        data: testRequest,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error creating test request" });
      }
    }
  }
);

export const startTestRequest = composeHandler(
  [authenticateToken, authorizeRoles("LAB_TECHNICIAN")],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;

      const testRequest = await prisma.testRequest.findUnique({
        where: { id: requestId },
        include: {
          patient: { include: { person: true } },
          doctor: { include: { person: true } },
        },
      });
      if (!testRequest) {
        res.status(404).json({ message: "Test request not found" });
        return;
      }

      if (testRequest.status !== TestStatus.REQUESTED) {
        res
          .status(400)
          .json({ message: `Request already in progress or completed` });
        return;
      }

      const updatedRequest = await prisma.testRequest.update({
        where: { id: requestId },
        data: {
          status: TestStatus.IN_PROGRESS,
          approvedAt: new Date(),
        },
        include: {
          patient: { include: { person: true } },
          doctor: { include: { person: true } },
        },
      });

      res.status(200).json({
        message: "Test request status updated to IN_PROGRESS",
        data: updatedRequest,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error starting test request" });
      }
    }
  }
);

export const submitTestResult = composeHandler(
  [authenticateToken, authorizeRoles("LAB_TECHNICIAN")],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const { values } = req.body;

      if (!values) {
        res.status(400).json({ message: "Test result values are required" });
        return;
      }

      const testRequest = await prisma.testRequest.findUnique({
        where: { id: requestId },
        include: {
          patient: { include: { person: true } },
          doctor: { include: { person: true } },
        },
      });
      if (!testRequest) {
        res.status(404).json({ message: "Test request not found" });
        return;
      }

      if (testRequest.status !== TestStatus.IN_PROGRESS) {
        res.status(400).json({
          message: `Cannot submit test results when test request status is '${testRequest.status}'`,
        });
        return;
      }

      const testResult = await prisma.testResult.create({
        data: {
          requestId,
          technicianId: req.user!.id,
          values,
          status: ResultStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: {
          request: {
            include: {
              patient: { include: { person: true } },
              doctor: { include: { person: true } },
            },
          },
          technician: {
            include: { person: true }, // Include person details for the technician
          },
        },
      });

      await prisma.testRequest.update({
        where: { id: requestId },
        data: { status: TestStatus.COMPLETED },
      });

      res.status(200).json({
        message: "Test result submitted successfully",
        data: testResult,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to submit test result" });
      }
    }
  }
);

export const getTestResult = composeHandler(
  [authenticateToken, authorizeRoles("HEALTHCARE_PROVIDER", "LAB_TECHNICIAN")],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;

      const testResult = await prisma.testResult.findFirst({
        where: { requestId },
        include: {
          technician: {
            include: { person: true }, // Include person details for the technician
          },
          request: {
            include: {
              patient: { include: { person: true } },
              testType: true,
              doctor: { include: { person: true } },
            },
          },
        },
      });

      if (!testResult) {
        res.status(404).json({ message: "Test result not found" });
        return;
      }

      if (
        testResult.request.doctorId !== req.user!.id &&
        testResult.technicianId !== req.user!.id &&
        req.user!.role !== "SUPERADMIN"
      ) {
        res.status(403).json({ message: "Access denied to this test result" });
        return;
      }

      res.status(200).json({
        message: "Test result retrieved successfully",
        data: testResult,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve test result" });
      }
    }
  }
);

export const getAllTestRequests = composeHandler(
  [
    authenticateToken,
    authorizeRoles("LAB_TECHNICIAN", "HEALTHCARE_PROVIDER", "SUPERADMIN"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const requests = await prisma.testRequest.findMany({
        include: {
          patient: { include: { person: true } },
          doctor: { include: { person: true } },
          testType: true,
          results: {
            include: {
              technician: {
                include: { person: true }, // Include person details for the technician
              },
            },
          },
        },
      });

      res.status(200).json({
        message: "All test requests retrieved successfully",
        data: requests,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to retrieve test requests" });
    }
  }
);

export const getTestRequestById = composeHandler(
  [
    authenticateToken,
    authorizeRoles("LAB_TECHNICIAN", "HEALTHCARE_PROVIDER", "SUPERADMIN"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;

      const request = await prisma.testRequest.findUnique({
        where: { id: requestId },
        include: {
          patient: { include: { person: true } },
          doctor: { include: { person: true } },
          testType: true,
          results: {
            include: {
              technician: {
                include: { person: true }, // Include person details for the technician
              },
            },
          },
        },
      });

      if (!request) {
        res.status(404).json({ message: "Test request not found" });
        return;
      }

      res.status(200).json({
        message: "Test request retrieved successfully",
        data: request,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to retrieve test request" });
    }
  }
);
