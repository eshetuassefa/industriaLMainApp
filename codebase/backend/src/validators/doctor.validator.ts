import { z } from 'zod';

// Add Medical Record schema
export const addMedicalRecordSchema = z.object({
  patientId: z.string().uuid('Invalid Patient ID'),
  visitDate: z.string().optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  // Optional arrays for related records
  labResults: z.array(
    z.object({
      testName: z.string(),
      resultValue: z.string().optional(),
    })
  ).optional(),
  prescriptions: z.array(
    z.object({
      medicineName: z.string(),
      dosage: z.string().optional(),
      frequency: z.string().optional(),
      duration: z.string().optional(),
      instructions: z.string().optional(),
    })
  ).optional(),
  radiologyReports: z.array(
    z.object({
      scanName: z.string(),
      findings: z.string().optional(),
    })
  ).optional(),
});

// Request Test schema (lab or radiology)
export const requestTestSchema = z.object({
  patientId: z.string().uuid("Invalid Patient ID"),
  testTypeId: z.string().uuid("Invalid TestType ID"),
  hospitalId: z.string().uuid("Invalid Hospital ID"),
  notes: z.string().optional(),
});

// Prescribe Medicine schema
export const prescribeSchema = z.object({
  patientId: z.string().uuid("Invalid Patient ID"),
  medicineName: z.string().min(1, 'Medicine name required'),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
});

export const fetchPatientSchema = z.object({
  patientId: z.string().uuid("Invalid Patient ID"),
});

// Appointment schemas
export const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  date: z.string().datetime(),
  duration: z.number().int().min(15).max(240), // Duration in minutes
  type: z.enum(['CONSULTATION', 'FOLLOW_UP', 'EMERGENCY', 'ROUTINE_CHECK']),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'CANCELLED', 'COMPLETED']).default('SCHEDULED')
});

export const updateAppointmentSchema = z.object({
  date: z.string().datetime().optional(),
  duration: z.number().int().min(15).max(240).optional(),
  type: z.enum(['CONSULTATION', 'FOLLOW_UP', 'EMERGENCY', 'ROUTINE_CHECK']).optional(),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'CANCELLED', 'COMPLETED']).optional()
});

export const appointmentIdSchema = z.object({
  appointmentId: z.string().uuid()
});