import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import {
  fetchPatientSchema,
  addMedicalRecordSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentIdSchema,
} from '../validators/doctor.validator';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// View all medical records for a patient
export const getPatientRecords = [
  authenticateToken,
  authorizeRoles("HEALTHCARE_PROVIDER"),
  async (req: Request, res: Response) => {
    try {
      const { patientId } = fetchPatientSchema.parse(req.params);

      // Fetch patient details with safe selection
      const patient = await prisma.patient.findUnique({
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
              address: true,
            },
          },
        },
      });

      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Fetch medical records with secure relationships
      const records = await prisma.medicalRecord.findMany({
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
                },
              },
            },
          },
        },
        orderBy: { visitDate: "desc" },
      });

      // Format response with safe data structure
      res.status(200).json({
        message: "Medical records retrieved successfully",
        data: {
          patient,
          records: records.map((record) => ({
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
              id: record.doctor?.id,
              role: record.doctor?.role,
              name: record.doctor?.person
                ? {
                    firstName: record.doctor.person.firstName,
                    lastName: record.doctor.person.lastName,
                  }
                : null,
            },
            labResults: record.labResults,
            prescriptions: record.prescriptions,
            radiologyReports: record.radiologyReports,
          })),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: "Error fetching medical records" });
      }
    }
  },
];

// Add a medical record (with optional labResults, prescriptions, and radiologyReports)
export const addMedicalRecord = [
  authenticateToken,
  authorizeRoles("HEALTHCARE_PROVIDER"),
  async (req: Request, res: Response) => {
    try {
      const validatedData = addMedicalRecordSchema.parse(req.body);

      // Create medical record with all fields
      const medicalRecord = await prisma.medicalRecord.create({
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
                  drugName: p.drug,
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
          doctor: {
            include: {
              person: true,
            },
          },
        },
      });

      // Return complete response with all fields
      res.status(201).json({
        message: "Medical record added successfully",
        data: {
          ...medicalRecord,
          // Explicitly list critical fields for clarity
          chiefComplaint: medicalRecord.chiefComplaint,
          bloodPressure: medicalRecord.bloodPressure,
          heartRate: medicalRecord.heartRate,
          temperature: medicalRecord.temperature,
          physicalExamination: medicalRecord.physicalExamination,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      console.error(error);
      res.status(500).json({ message: "Error adding medical record" });
    }
  },
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