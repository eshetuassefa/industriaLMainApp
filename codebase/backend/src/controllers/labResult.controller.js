"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestResult = exports.submitTestResult = exports.startTestRequest = exports.createTestRequest = void 0;
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const prisma = new client_1.PrismaClient();
// 1. Healthcare Provider creates a test request
exports.createTestRequest = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)("HEALTHCARE_PROVIDER"),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { patientId, testTypeId, hospitalId, notes } = req.body;
            // Validate patient and testType existence (optional but recommended)
            const patient = yield prisma.patient.findUnique({
                where: { id: patientId },
            });
            if (!patient)
                return res.status(404).json({ message: "Patient not found" });
            const testType = yield prisma.testType.findUnique({
                where: { id: testTypeId },
            });
            if (!testType)
                return res.status(404).json({ message: "Test type not found" });
            const hospital = yield prisma.hospital.findUnique({
                where: { id: hospitalId },
            });
            if (!hospital)
                return res.status(404).json({ message: "Hospital not found" });
            const testRequest = yield prisma.testRequest.create({
                data: {
                    patientId,
                    testTypeId,
                    hospitalId,
                    doctorId: req.user.id,
                    notes,
                    status: client_1.TestStatus.REQUESTED,
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
        }
        catch (error) {
            console.error(error);
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Error creating test request" });
        }
    }),
];
// 2. Lab Technician confirms (starts) the test request
exports.startTestRequest = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)("LAB_TECHNICIAN"),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { requestId } = req.params;
            const testRequest = yield prisma.testRequest.findUnique({
                where: { id: requestId },
            });
            if (!testRequest)
                return res.status(404).json({ message: "Test request not found" });
            if (testRequest.status !== client_1.TestStatus.REQUESTED) {
                return res.status(400).json({
                    message: `Test request cannot be started when status is '${testRequest.status}'`,
                });
            }
            // Mark the test request as IN_PROGRESS and record the approval time
            const updatedRequest = yield prisma.testRequest.update({
                where: { id: requestId },
                data: {
                    status: client_1.TestStatus.IN_PROGRESS,
                    approvedAt: new Date(),
                },
            });
            return res.status(200).json({
                message: "Test request status updated to IN_PROGRESS",
                data: updatedRequest,
            });
        }
        catch (error) {
            console.error(error);
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Error starting test request" });
        }
    }),
];
// 3. Lab Technician submits test results
exports.submitTestResult = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)("LAB_TECHNICIAN"),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { requestId } = req.params;
            const { values } = req.body;
            if (!values) {
                return res
                    .status(400)
                    .json({ message: "Test result values are required" });
            }
            const testRequest = yield prisma.testRequest.findUnique({
                where: { id: requestId },
            });
            if (!testRequest)
                return res.status(404).json({ message: "Test request not found" });
            if (testRequest.status !== client_1.TestStatus.IN_PROGRESS) {
                return res.status(400).json({
                    message: `Cannot submit test results when test request status is '${testRequest.status}'`,
                });
            }
            // Create a test result entry
            const testResult = yield prisma.testResult.create({
                data: {
                    requestId,
                    technicianId: req.user.id,
                    values,
                    status: client_1.ResultStatus.COMPLETED,
                    completedAt: new Date(),
                },
            });
            // Update the test request status to COMPLETED
            yield prisma.testRequest.update({
                where: { id: requestId },
                data: { status: client_1.TestStatus.COMPLETED },
            });
            return res
                .status(200)
                .json({
                message: "Test result submitted successfully",
                data: testResult,
            });
        }
        catch (error) {
            console.error(error);
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Failed to submit test result" });
        }
    }),
];
// 4. Healthcare Provider fetches test results for a request
exports.getTestResult = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)("HEALTHCARE_PROVIDER", "SUPERADMIN"),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { requestId } = req.params;
            const testResult = yield prisma.testResult.findFirst({
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
            if (testResult.request.doctorId !== req.user.id &&
                req.user.role !== "SUPERADMIN") {
                return res
                    .status(403)
                    .json({ message: "Access denied to this test result" });
            }
            return res.status(200).json({
                message: "Test result retrieved successfully",
                data: testResult,
            });
        }
        catch (error) {
            console.error(error);
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
            return res
                .status(500)
                .json({ message: "Failed to retrieve test result" });
        }
    }),
];
