import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import {
  fetchPatientSchema,
  addMedicalRecordSchema,
  requestTestSchema,
  prescribeSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentIdSchema,
} from '../validators/doctor.validator';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const prisma = new PrismaClient();



// View all medical records for a patient
export const getPatientRecords = [
  authenticateToken,
  authorizeRoles('SUPERADMIN'), //NB authorizeRoles need to be updated to include doctor
  async (req: Request, res: Response) => {
    try {
      const { patientId } = fetchPatientSchema.parse(req.params);
      
    
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
          person: true 
        }
      });

      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      // Then fetch medical records
      const records = await prisma.medicalRecord.findMany({
        where: { patientId },
        include: {
          labResults: true,
          prescriptions: true,
          radiologyReports: true,
          doctor: {
            include: {
              person: true // Include doctor's personal information
            }
          }
        },
        orderBy: { visitDate: 'desc' }
      });

      res.status(200).json({
        message: 'Medical records retrieved successfully',
        data: {
          patient: {
            id: patient.id,
            personId: patient.personId,
            
            person: patient.person 
          },
          records
        }
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

// Add a medical record (with optional labResults, prescriptions, and radiologyReports)
export const addMedicalRecord = [
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  async (req: Request, res: Response) => {
    try {
      const validatedData = addMedicalRecordSchema.parse(req.body);

      const medicalRecord = await prisma.medicalRecord.create({
        data: {
          patientId: validatedData.patientId,
          visitDate: validatedData.visitDate 
            ? new Date(validatedData.visitDate) 
            : new Date(),
          diagnosis: validatedData.diagnosis,
          notes: validatedData.notes,
          doctorId: req.user!.id,
          labResults: validatedData.labResults
            ? {
                create: validatedData.labResults.map((lr) => ({
                  testName: lr.testName,
                  testDate: new Date(lr.testDate),
                  resultValue: lr.resultValue,
                  unit: lr.unit,
                  referenceRange: lr.referenceRange,
                })),
              }
            : undefined,
          prescriptions: validatedData.prescriptions
            ? {
                create: validatedData.prescriptions.map((p) => ({
                  medicineName: p.medicineName,
                  dosage: p.dosage,
                  frequency: p.frequency,
                  duration: p.duration,
                  instructions: p.instructions,
                  prescribedById: req.user!.id,
                })),
              }
            : undefined,
          radiologyReports: validatedData.radiologyReports
            ? {
                create: validatedData.radiologyReports.map((report) => ({
                  imagingType: report.imagingType,
                  reportText: report.reportText,
                  bodyPart: report.bodyPart,
                  reportDate: new Date(report.reportDate),
                })),
              }
            : undefined,
        },
        include: {
          patient: { include: { person: true } },
          labResults: true,
          prescriptions: true,
          radiologyReports: true,
        },
      });

      res.status(201).json({
        message: 'Medical record added successfully',
        data: medicalRecord,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      console.error(error);
      res.status(500).json({ message: 'Error adding medical record' });
    }
  },
];

// Request a lab or radiology test
export const requestTest = [
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
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
  authorizeRoles('SUPERADMIN'),
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
export const getPrescriptionById = [
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const prescription = await prisma.prescription.findUnique({
        where: { id },
        include: {
          medicalRecord: {
            include: {
              patient: true
            }
          }
        }
      });

      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' });
      }

      res.status(200).json({
        message: 'Prescription retrieved successfully',
        data: prescription
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving prescription' });
      }
    }
  }
];

export const getAllPrescriptions = [
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  async (req: Request, res: Response) => {
    try {
      const prescriptions = await prisma.prescription.findMany({
        include: {
          medicalRecord: {
            include: {
              patient: true
            }
          }
        },
        orderBy: { id: 'desc' }
      });

      res.status(200).json({
        message: 'Prescriptions retrieved successfully',
        data: prescriptions
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving prescriptions' });
      }
    }
  }
];

// Create a new appointment
export const createAppointment = [
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  async (req: Request, res: Response) => {
    try {
      const validatedData = createAppointmentSchema.parse(req.body);
      
      const appointment = await prisma.appointment.create({
        data: {
          ...validatedData,
          doctorId: req.user!.id,
          date: new Date(validatedData.date),
        },
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
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Error creating appointment' });
      }
    }
  }
];

// Get all appointments for a doctor
export const getDoctorAppointments = [
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  async (req: Request, res: Response) => {
    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          doctorId: req.user!.id
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
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Error fetching appointments' });
      }
    }
  }
];
// Get single appointments for a doctor
export const getAppointments = [
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { appointmentId } = appointmentIdSchema.parse(req.params);
     

      const appointments = await prisma.appointment.findMany({
        where: {
          id: appointmentId,
          doctorId: req.user!.id
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
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Error fetching appointments' });
      }
    }
  }
];

// Update an appointment
export const updateAppointment = [
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { appointmentId } = appointmentIdSchema.parse(req.params);
      const validatedData = updateAppointmentSchema.parse(req.body);

      const appointment = await prisma.appointment.update({
        where: {
          id: appointmentId,
          doctorId: req.user!.id // Ensure only the doctor who created it can update
        },
        data: {
          ...validatedData,
          date: validatedData.date ? new Date(validatedData.date) : undefined
        },
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
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Error updating appointment' });
      }
    }
  }
];

// Delete an appointment
export const deleteAppointment = [
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { appointmentId } = appointmentIdSchema.parse(req.params);

      await prisma.appointment.delete({
        where: {
          id: appointmentId,
          doctorId: req.user!.id // Ensure only the doctor who created it can delete
        }
      });

      res.status(200).json({
        message: 'Appointment deleted successfully'
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Error deleting appointment' });
      }
    }
  }
];