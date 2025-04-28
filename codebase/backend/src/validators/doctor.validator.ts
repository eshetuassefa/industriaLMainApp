import { z } from 'zod';

// Add Medical Record schema
export const addMedicalRecordSchema = z.object({
  patientId: z.string().uuid("Invalid Patient ID"),
  visitDate: z.string().optional(), // e.g. "2025-12-01"
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
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

// Fetch Patient schema (simply a param or query in the route)
export const fetchPatientSchema = z.object({
  patientId: z.string().uuid("Invalid Patient ID"),
});