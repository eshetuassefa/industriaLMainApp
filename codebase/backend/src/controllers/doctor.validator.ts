import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import {
  fetchPatientSchema,
  addMedicalRecordSchema,
  requestTestSchema,
  prescribeSchema,
} from '../validators/doctor.validator';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const prisma = new PrismaClient();



// View all medical records for a patient
export const getPatientRecords = [
  authenticateToken,
  authorizeRoles('DOCTOR'),
  async (req: Request, res: Response) => {
    try {
      const { patientId } = fetchPatientSchema.parse(req.params);
      const records = await prisma.medicalRecord.findMany({
        where: { patientId },
        include: {
          labResults: true,
          prescriptions: true,
          radiologyReports: true
        },
        orderBy: { visitDate: 'desc' }
      });

      res.status(200).json({
        message: 'Medical records retrieved successfully',
        data: records
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Error fetching medical records' });
      }
    }
  }
];

// Add a medical record
export const addMedicalRecord = [
  authenticateToken,
  authorizeRoles('DOCTOR'),
  async (req: Request, res: Response) => {
    try {
      const validatedData = addMedicalRecordSchema.parse(req.body);
      const medicalRecord = await prisma.medicalRecord.create({
        data: {
          patientId: validatedData.patientId,
          visitDate: validatedData.visitDate ? new Date(validatedData.visitDate) : new Date(),
          diagnosis: validatedData.diagnosis,
          notes: validatedData.notes,
          doctorId: req.user!.id
        },
        include: {
          patient: {
            include: {
              person: true
            }
          }
        }
      });

      res.status(201).json({
        message: 'Medical record added successfully',
        data: medicalRecord
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Error adding medical record' });
      }
    }
  }
];

// Request a lab or radiology test
export const requestTest = [
  authenticateToken,
  authorizeRoles('DOCTOR'),
  async (req: Request, res: Response) => {
    try {
      const validatedData = requestTestSchema.parse(req.body);
      const testRequest = await prisma.testRequest.create({
        data: {
          patientId: validatedData.patientId,
          testTypeId: validatedData.testTypeId,
          hospitalId: validatedData.hospitalId,
          doctorId: req.user!.id,
          notes: validatedData.notes,
          status: 'REQUESTED'
        },
        include: {
          testType: true,
          hospital: true
        }
      });

      res.status(201).json({
        message: 'Test request created successfully',
        data: testRequest
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Error creating test request' });
      }
    }
  }
];

// Prescribe medicine
export const prescribeMedicine = [
  authenticateToken,
  authorizeRoles('DOCTOR'),
  async (req: Request, res: Response) => {
    try {
      const validatedData = prescribeSchema.parse(req.body);
      const activeRecord = await prisma.medicalRecord.findFirst({
        where: { patientId: validatedData.patientId },
        orderBy: { visitDate: 'desc' }
      });

      if (!activeRecord) {
        return res.status(400).json({ message: 'No active medical record found' });
      }

      const prescription = await prisma.prescription.create({
        data: {
          medicalRecordId: activeRecord.id,
          medicineName: validatedData.medicineName,
          dosage: validatedData.dosage,
          frequency: validatedData.frequency,
          duration: validatedData.duration,
          instructions: validatedData.instructions,
          prescribedById: req.user!.id
        },
        include: {
          medicalRecord: {
            include: {
              patient: true
            }
          }
        }
      });

      res.status(201).json({
        message: 'Prescription created successfully',
        data: prescription
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Error creating prescription' });
      }
    }
  }
];