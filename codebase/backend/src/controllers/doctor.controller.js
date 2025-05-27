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
exports.deleteAppointment = exports.updateAppointment = exports.getAppointments = exports.getDoctorAppointments = exports.createAppointment = exports.addMedicalRecord = exports.getPatientRecords = void 0;
const client_1 = require("@prisma/client");
const doctor_validator_1 = require("../validators/doctor.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const prisma = new client_1.PrismaClient();
// View all medical records for a patient
exports.getPatientRecords = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)('SUPERADMIN'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { patientId } = doctor_validator_1.fetchPatientSchema.parse(req.params);
            // Fetch patient details with safe selection
            const patient = yield prisma.patient.findUnique({
                where: { id: patientId },
                select: {
                    id: true,
                    personId: true,
                    person: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            dob: true,
                            sex: true,
                            phoneNumber: true,
                            address: true
                        }
                    }
                }
            });
            if (!patient) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            // Fetch medical records with secure relationships
            const records = yield prisma.medicalRecord.findMany({
                where: { patientId },
                include: {
                    labResults: true,
                    prescriptions: true,
                    radiologyReports: true,
                    doctor: {
                        select: {
                            id: true,
                            role: true,
                            person: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                }
                            }
                        }
                    }
                },
                orderBy: { visitDate: 'desc' }
            });
            // Format response with safe data structure
            res.status(200).json({
                message: 'Medical records retrieved successfully',
                data: {
                    patient,
                    records: records.map(record => {
                        var _a, _b, _c;
                        return ({
                            id: record.id,
                            visitDate: record.visitDate,
                            createdAt: record.createdAt,
                            updatedAt: record.updatedAt,
                            diagnosis: record.diagnosis,
                            chiefComplaint: record.chiefComplaint,
                            bloodPressure: record.bloodPressure,
                            heartRate: record.heartRate,
                            temperature: record.temperature,
                            physicalExamination: record.physicalExamination,
                            notes: record.notes,
                            doctor: {
                                id: (_a = record.doctor) === null || _a === void 0 ? void 0 : _a.id,
                                role: (_b = record.doctor) === null || _b === void 0 ? void 0 : _b.role,
                                name: ((_c = record.doctor) === null || _c === void 0 ? void 0 : _c.person) ? {
                                    firstName: record.doctor.person.firstName,
                                    lastName: record.doctor.person.lastName
                                } : null
                            },
                            labResults: record.labResults,
                            prescriptions: record.prescriptions,
                            radiologyReports: record.radiologyReports
                        });
                    })
                }
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                console.error(error);
                res.status(500).json({ message: 'Error fetching medical records' });
            }
        }
    })
];
// Add a medical record (with optional labResults, prescriptions, and radiologyReports)
exports.addMedicalRecord = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)("SUPERADMIN"),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validatedData = doctor_validator_1.addMedicalRecordSchema.parse(req.body);
            // Create medical record with all fields
            const medicalRecord = yield prisma.medicalRecord.create({
                data: {
                    patientId: validatedData.patientId,
                    visitDate: validatedData.visitDate
                        ? new Date(validatedData.visitDate)
                        : new Date(),
                    chiefComplaint: validatedData.chiefComplaint,
                    bloodPressure: validatedData.bloodPressure,
                    heartRate: validatedData.heartRate,
                    temperature: validatedData.temperature,
                    physicalExamination: validatedData.physicalExamination,
                    diagnosis: validatedData.diagnosis,
                    notes: validatedData.notes,
                    doctorId: req.user.id,
                    labResults: validatedData.labResults
                        ? {
                            create: validatedData.labResults.map(lr => ({
                                testName: lr.testName,
                                testDate: new Date(lr.testDate),
                                resultValue: lr.resultValue,
                                unit: lr.unit,
                                referenceRange: lr.referenceRange,
                            }))
                        }
                        : undefined,
                    prescriptions: validatedData.prescriptions
                        ? {
                            create: validatedData.prescriptions.map((p) => ({
                                drugName: p.drug,
                                dosage: p.dosage,
                                frequency: p.frequency,
                                duration: p.duration,
                                instructions: p.instructions,
                                prescribedById: req.user.id
                            }))
                        }
                        : undefined,
                    radiologyReports: validatedData.radiologyReports
                        ? {
                            create: validatedData.radiologyReports.map(report => ({
                                imagingType: report.imagingType,
                                reportText: report.reportText,
                                bodyPart: report.bodyPart,
                                reportDate: new Date(report.reportDate),
                            }))
                        }
                        : undefined,
                },
                include: {
                    patient: { include: { person: true } },
                    labResults: true,
                    prescriptions: true,
                    radiologyReports: true,
                    doctor: {
                        include: {
                            person: true
                        }
                    }
                }
            });
            // Return complete response with all fields
            res.status(201).json({
                message: 'Medical record added successfully',
                data: Object.assign(Object.assign({}, medicalRecord), { 
                    // Explicitly list critical fields for clarity
                    chiefComplaint: medicalRecord.chiefComplaint, bloodPressure: medicalRecord.bloodPressure, heartRate: medicalRecord.heartRate, temperature: medicalRecord.temperature, physicalExamination: medicalRecord.physicalExamination })
            });
        }
        catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
            console.error(error);
            res.status(500).json({ message: 'Error adding medical record' });
        }
    })
];
// Create a new appointment
exports.createAppointment = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)('SUPERADMIN'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validatedData = doctor_validator_1.createAppointmentSchema.parse(req.body);
            const appointment = yield prisma.appointment.create({
                data: Object.assign(Object.assign({}, validatedData), { doctorId: req.user.id, date: new Date(validatedData.date) }),
                include: {
                    patient: {
                        include: {
                            person: true
                        }
                    },
                    doctor: {
                        include: {
                            person: true
                        }
                    }
                }
            });
            res.status(201).json({
                message: 'Appointment created successfully',
                data: appointment
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                console.error(error);
                res.status(500).json({ message: 'Error creating appointment' });
            }
        }
    })
];
// Get all appointments for a doctor
exports.getDoctorAppointments = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)('SUPERADMIN'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const appointments = yield prisma.appointment.findMany({
                where: {
                    doctorId: req.user.id
                },
                include: {
                    patient: {
                        include: {
                            person: true
                        }
                    }
                },
                orderBy: {
                    date: 'asc'
                }
            });
            res.status(200).json({
                message: 'Appointments retrieved successfully',
                data: appointments
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                console.error(error);
                res.status(500).json({ message: 'Error fetching appointments' });
            }
        }
    })
];
// Get single appointments for a doctor
exports.getAppointments = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)('SUPERADMIN'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { appointmentId } = doctor_validator_1.appointmentIdSchema.parse(req.params);
            const appointments = yield prisma.appointment.findMany({
                where: {
                    id: appointmentId,
                    doctorId: req.user.id
                },
                include: {
                    patient: {
                        include: {
                            person: true
                        }
                    }
                },
                orderBy: {
                    date: 'asc'
                }
            });
            res.status(200).json({
                message: 'Appointments retrieved successfully',
                data: appointments
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                console.error(error);
                res.status(500).json({ message: 'Error fetching appointments' });
            }
        }
    })
];
// Update an appointment
exports.updateAppointment = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)('SUPERADMIN'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { appointmentId } = doctor_validator_1.appointmentIdSchema.parse(req.params);
            const validatedData = doctor_validator_1.updateAppointmentSchema.parse(req.body);
            const appointment = yield prisma.appointment.update({
                where: {
                    id: appointmentId,
                    doctorId: req.user.id // Ensure only the doctor who created it can update
                },
                data: Object.assign(Object.assign({}, validatedData), { date: validatedData.date ? new Date(validatedData.date) : undefined }),
                include: {
                    patient: {
                        include: {
                            person: true
                        }
                    }
                }
            });
            res.status(200).json({
                message: 'Appointment updated successfully',
                data: appointment
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                console.error(error);
                res.status(500).json({ message: 'Error updating appointment' });
            }
        }
    })
];
// Delete an appointment
exports.deleteAppointment = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)('SUPERADMIN'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { appointmentId } = doctor_validator_1.appointmentIdSchema.parse(req.params);
            yield prisma.appointment.delete({
                where: {
                    id: appointmentId,
                    doctorId: req.user.id // Ensure only the doctor who created it can delete
                }
            });
            res.status(200).json({
                message: 'Appointment deleted successfully'
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                console.error(error);
                res.status(500).json({ message: 'Error deleting appointment' });
            }
        }
    })
];
