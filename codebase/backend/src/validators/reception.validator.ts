import { z } from 'zod';

// Emergency contact validator
export const emergencyContactSchema = z.object({
    name: z.string().min(2, 'Emergency contact name must be at least 2 characters long'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits long'),
});

// Patient validators
export const patientSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters long'),
    middleName: z.string().optional(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters long'),
    sex: z.enum(['MALE', 'FEMALE', 'OTHER']),
    dob: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits long'),
    address: z.string().min(5, 'Address must be at least 5 characters long'),
    nationalId: z.string().optional(),
    birthCertificate: z.string().optional(),
    emergencyContact: emergencyContactSchema,
});

export const updatePatientSchema = patientSchema.extend({
    id: z.string().uuid('Invalid patient ID'),
});

export const searchPatientSchema = z.object({
    nationalId: z.string().optional(),
    name: z.string().optional(),
});

// Type exports
export type PatientInput = z.infer<typeof patientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type SearchPatientInput = z.infer<typeof searchPatientSchema>;
