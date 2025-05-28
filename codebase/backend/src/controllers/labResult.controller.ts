import { Request, Response } from "express";
import { PrismaClient, TestStatus, ResultStatus } from "@prisma/client";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// 1. Healthcare Provider creates a test request
export const createTestRequest = [
  authenticateToken,
  authorizeRoles("HEALTHCARE_PROVIDER"),
  async (req: Request, res: Response) => {
    try {
      const { patientId, testTypeId, hospitalId, notes } = req.body;

      // Validate patient and testType existence (optional but recommended)
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
      });
      if (!patient)
        return res.status(404).json({ message: "Patient not found" });

      const testType = await prisma.testType.findUnique({
        where: { id: testTypeId },
      });
      if (!testType)
        return res.status(404).json({ message: "Test type not found" });

      const hospital = await prisma.hospital.findUnique({
        where: { id: hospitalId },
      });
      if (!hospital)
        return res.status(404).json({ message: "Hospital not found" });

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

      return res.status(201).json({
        message: "Test request created successfully",
        data: testRequest,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Error creating test request" });
    }
  },
];

// 2. Lab Technician confirms (starts) the test request
export const startTestRequest = [
  authenticateToken,
  authorizeRoles("LAB_TECHNICIAN"),
  async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;

      const testRequest = await prisma.testRequest.findUnique({
        where: { id: requestId },
      });
      if (!testRequest)
        return res.status(404).json({ message: "Test request not found" });

      if (testRequest.status !== TestStatus.REQUESTED) {
        return res.status(400).json({
          message: `Test request cannot be started when status is '${testRequest.status}'`,
        });
      }

      // Mark the test request as IN_PROGRESS and record the approval time
      const updatedRequest = await prisma.testRequest.update({
        where: { id: requestId },
        data: {
          status: TestStatus.IN_PROGRESS,
          approvedAt: new Date(),
        },
      });

      return res.status(200).json({
        message: "Test request status updated to IN_PROGRESS",
        data: updatedRequest,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Error starting test request" });
    }
  },
];

// 3. Lab Technician submits test results
export const submitTestResult = [
  authenticateToken,
  authorizeRoles("LAB_TECHNICIAN"),
  async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;
      const { values } = req.body;

      if (!values) {
        return res
          .status(400)
          .json({ message: "Test result values are required" });
      }

      const testRequest = await prisma.testRequest.findUnique({
        where: { id: requestId },
      });
      if (!testRequest)
        return res.status(404).json({ message: "Test request not found" });

      if (testRequest.status !== TestStatus.IN_PROGRESS) {
        return res.status(400).json({
          message: `Cannot submit test results when test request status is '${testRequest.status}'`,
        });
      }

      // Create a test result entry
      const testResult = await prisma.testResult.create({
        data: {
          requestId,
          technicianId: req.user!.id,
          values,
          status: ResultStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      // Update the test request status to COMPLETED
      await prisma.testRequest.update({
        where: { id: requestId },
        data: { status: TestStatus.COMPLETED },
      });

      return res
        .status(200)
        .json({
          message: "Test result submitted successfully",
          data: testResult,
        });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Failed to submit test result" });
    }
  },
];

// 4. Healthcare Provider fetches test results for a request
export const getTestResult = [
  authenticateToken,
  authorizeRoles("HEALTHCARE_PROVIDER", "SUPERADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;

      const testResult = await prisma.testResult.findFirst({
        where: { requestId },
        include: {
          technician: { select: { id: true, person: true } },
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
        return res.status(404).json({ message: "Test result not found" });
      }

      // Optional: Ensure the healthcare provider owns the request (security)
      if (
        testResult.request.doctorId !== req.user!.id &&
        req.user!.role !== "SUPERADMIN"
      ) {
        return res
          .status(403)
          .json({ message: "Access denied to this test result" });
      }

      return res.status(200).json({
        message: "Test result retrieved successfully",
        data: testResult,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res
        .status(500)
        .json({ message: "Failed to retrieve test result" });
    }
  },
];
