"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentIdSchema = exports.updateAppointmentSchema = exports.createAppointmentSchema = exports.fetchPatientSchema = exports.addMedicalRecordSchema = void 0;
const zod_1 = require("zod");
// Add Medical Record schema
exports.addMedicalRecordSchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid('Invalid Patient ID'),
    visitDate: zod_1.z.string().optional(),
    diagnosis: zod_1.z.string().optional(),
    // New fields
    chiefComplaint: zod_1.z.string().optional(),
    bloodPressure: zod_1.z.string().optional(),
    heartRate: zod_1.z.number().int().positive().optional(),
    temperature: zod_1.z.number().optional(),
    physicalExamination: zod_1.z.string().optional(),
    // Existing fields
    notes: zod_1.z.string().optional(),
    labResults: zod_1.z.array(zod_1.z.object({
        testName: zod_1.z.string(),
        testDate: zod_1.z.string().datetime(),
        resultValue: zod_1.z.string().optional(),
        unit: zod_1.z.string().optional(),
        referenceRange: zod_1.z.string().optional(),
    })).optional(),
    prescriptions: zod_1.z.array(zod_1.z.object({
        drug: zod_1.z.string(),
        dosage: zod_1.z.string().optional(),
        frequency: zod_1.z.string().optional(),
        duration: zod_1.z.string().optional(),
        instructions: zod_1.z.string().optional(),
    })).optional(),
    radiologyReports: zod_1.z.array(zod_1.z.object({
        imagingType: zod_1.z.string(),
        reportText: zod_1.z.string().optional(),
        bodyPart: zod_1.z.string().optional(),
        reportDate: zod_1.z.string().datetime(),
    })).optional(),
});
exports.fetchPatientSchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid("Invalid Patient ID"),
});
// Appointment schemas
exports.createAppointmentSchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid(),
    date: zod_1.z.string().datetime(),
    duration: zod_1.z.number().int().min(15).max(240), // Duration in minutes
    type: zod_1.z.enum(['CONSULTATION', 'FOLLOW_UP', 'EMERGENCY', 'ROUTINE_CHECK']),
    notes: zod_1.z.string().optional(),
    status: zod_1.z.enum(['SCHEDULED', 'CANCELLED', 'COMPLETED']).default('SCHEDULED')
});
exports.updateAppointmentSchema = zod_1.z.object({
    date: zod_1.z.string().datetime().optional(),
    duration: zod_1.z.number().int().min(15).max(240).optional(),
    type: zod_1.z.enum(['CONSULTATION', 'FOLLOW_UP', 'EMERGENCY', 'ROUTINE_CHECK']).optional(),
    notes: zod_1.z.string().optional(),
    status: zod_1.z.enum(['SCHEDULED', 'CANCELLED', 'COMPLETED']).optional()
});
exports.appointmentIdSchema = zod_1.z.object({
    appointmentId: zod_1.z.string().uuid()
});
