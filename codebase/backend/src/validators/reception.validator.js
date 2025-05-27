"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPatientSchema = exports.updatePatientSchema = exports.patientSchema = exports.emergencyContactSchema = void 0;
const zod_1 = require("zod");
// Emergency contact validator
exports.emergencyContactSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Emergency contact name must be at least 2 characters long'),
    phone: zod_1.z.string().min(10, 'Phone number must be at least 10 digits long'),
});
// Patient validators
exports.patientSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters long'),
    middleName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().min(2, 'Last name must be at least 2 characters long'),
    sex: zod_1.z.enum(['MALE', 'FEMALE', 'OTHER']),
    dob: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }),
    phoneNumber: zod_1.z.string().min(10, 'Phone number must be at least 10 digits long'),
    address: zod_1.z.string().min(5, 'Address must be at least 5 characters long'),
    nationalId: zod_1.z.string().optional(),
    birthCertificate: zod_1.z.string().optional(),
    emergencyContact: exports.emergencyContactSchema,
});
exports.updatePatientSchema = exports.patientSchema.extend({
    id: zod_1.z.string().uuid('Invalid patient ID'),
});
exports.searchPatientSchema = zod_1.z.object({
    nationalId: zod_1.z.string().optional(),
    name: zod_1.z.string().optional(),
});
