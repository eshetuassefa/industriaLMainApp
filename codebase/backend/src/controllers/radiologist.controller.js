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
exports.getRadiologyReport = exports.submitRadiologyReport = exports.startRadiologyRequest = exports.createRadiologyRequest = void 0;
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const prisma = new client_1.PrismaClient();
// 1. Healthcare provider creates a radiology request (using patientId instead of medicalRecordId)
exports.createRadiologyRequest = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)("HEALTHCARE_PROVIDER"),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { patientId, imagingType, bodyPart, notes } = req.body;
            // Step 1: Find the latest medical record for this patient
            const latestMedicalRecord = yield prisma.medicalRecord.findFirst({
                where: { patientId },
                orderBy: { visitDate: 'desc' },
            });
            if (!latestMedicalRecord) {
                return res.status(404).json({ message: "No medical record found for this patient." });
            }
            // Step 2: Create the radiology request using the medicalRecordId
            const request = yield prisma.radiologyRequest.create({
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
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Failed to create radiology request" });
        }
    }),
];
// 2. Radiologist starts processing the request
exports.startRadiologyRequest = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)("RADIOLOGIST"),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { requestId } = req.params;
            const request = yield prisma.radiologyRequest.findUnique({
                where: { id: requestId },
            });
            if (!request) {
                return res.status(404).json({ message: "Radiology request not found" });
            }
            if (request.status !== "PENDING") {
                return res.status(400).json({ message: "Request already in progress or completed" });
            }
            const report = yield prisma.radiologyReport.create({
                data: {
                    medicalRecordId: request.medicalRecordId,
                    imagingType: request.imagingType,
                    bodyPart: request.bodyPart,
                    reportDate: new Date(),
                    radiologistId: req.user.id,
                    radiologyRequestId: request.id,
                },
            });
            yield prisma.radiologyRequest.update({
                where: { id: requestId },
                data: { status: "IN_PROGRESS" },
            });
            return res.status(201).json({
                message: "Radiology report started",
                data: report,
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Failed to start radiology request" });
        }
    }),
];
// 3. Radiologist submits the report
exports.submitRadiologyReport = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)("RADIOLOGIST"),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { requestId } = req.params;
            const { reportText, notes } = req.body;
            const report = yield prisma.radiologyReport.findFirst({
                where: { radiologyRequestId: requestId },
            });
            if (!report) {
                return res.status(404).json({ message: "Associated radiology report not found" });
            }
            const updatedReport = yield prisma.radiologyReport.update({
                where: { id: report.id },
                data: {
                    reportText,
                    notes,
                    reportDate: new Date(),
                },
            });
            yield prisma.radiologyRequest.update({
                where: { id: requestId },
                data: { status: "COMPLETED" },
            });
            return res.status(200).json({
                message: "Radiology report submitted successfully",
                data: updatedReport,
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Failed to submit radiology report" });
        }
    }),
];
// 4. Healthcare provider views radiology report
exports.getRadiologyReport = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)("HEALTHCARE_PROVIDER", "RADIOLOGIST"),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { requestId } = req.params;
            const report = yield prisma.radiologyReport.findFirst({
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
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Failed to retrieve radiology report" });
        }
    }),
];
