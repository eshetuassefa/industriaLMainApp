import { z } from 'zod';

// Add Medical Record schema
export const addMedicalRecordSchema = z.object({
  patientId: z.string().uuid('Invalid Patient ID'),
  visitDate: z.string().optional(),
  diagnosis: z.string().optional(),
  // New fields
  chiefComplaint: z.string().optional(),
  bloodPressure: z.string().optional(),
  heartRate: z.number().int().positive().optional(),
  temperature: z.number().optional(),
  physicalExamination: z.string().optional(),
  // Existing fields
  notes: z.string().optional(),
  labResults: z.array(
    z.object({
      testName: z.string(),
      testDate: z.string().datetime(),
      resultValue: z.string().optional(),
      unit: z.string().optional(),
      referenceRange: z.string().optional(),
    })
  ).optional(),
  prescriptions: z.array(
    z.object({
       drug: z.string(),
      dosage: z.string().optional(),
      frequency: z.string().optional(),
      duration: z.string().optional(),
      instructions: z.string().optional(),
    })
  ).optional(),
  radiologyReports: z.array(
    z.object({
      imagingType: z.string(),
      reportText: z.string().optional(),
      bodyPart: z.string().optional(),
      reportDate: z.string().datetime(),
    })
  ).optional(),
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