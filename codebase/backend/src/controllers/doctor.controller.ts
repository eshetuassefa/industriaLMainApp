import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import {
  fetchPatientSchema,
  addMedicalRecordSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentIdSchema,
} from "../validators/doctor.validator";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// View all medical records for a patient
export const getPatientRecords = [
  authenticateToken,
  authorizeRoles("HEALTHCARE_PROVIDER"),
  async (req: Request, res: Response) => {
    try {
      const { patientId } = fetchPatientSchema.parse(req.params);
      const doctorId = req.user!.id;

      // Check if patient is assigned to this doctor
      const assignment = await prisma.patientDoctorAssignment.findFirst({
        where: {
          patientId,
          doctorId,
          status: "ACTIVE",
        },
      });

      if (!assignment) {
        return res.status(403).json({
          message:
            "You don't have access to this patient's records. Please contact reception to get access.",
        });
      }

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
  authorizeRoles("HEALTHCARE_PROVIDER"),
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
              person: true,
            },
          },
          doctor: {
            include: {
              person: true,
            },
          },
        },
      });

      res.status(201).json({
        message: "Appointment created successfully",
        data: appointment,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: "Error creating appointment" });
      }
    }
  },
];

// Get all appointments for a doctor
export const getDoctorAppointments = [
  authenticateToken,
  authorizeRoles("HEALTHCARE_PROVIDER"),
  async (req: Request, res: Response) => {
    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          doctorId: req.user!.id,
        },
        include: {
          patient: {
            include: {
              person: true,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      res.status(200).json({
        message: "Appointments retrieved successfully",
        data: appointments,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: "Error fetching appointments" });
      }
    }
  },
];

// Get single appointments for a doctor
export const getAppointments = [
  authenticateToken,
  authorizeRoles("HEALTHCARE_PROVIDER"),
  async (req: Request, res: Response) => {
    try {
      const { appointmentId } = appointmentIdSchema.parse(req.params);

      const appointments = await prisma.appointment.findMany({
        where: {
          id: appointmentId,
          doctorId: req.user!.id,
        },
        include: {
          patient: {
            include: {
              person: true,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      res.status(200).json({
        message: "Appointments retrieved successfully",
        data: appointments,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: "Error fetching appointments" });
      }
    }
  },
];

// Update an appointment
export const updateAppointment = [
  authenticateToken,
  authorizeRoles("HEALTHCARE_PROVIDER"),
  async (req: Request, res: Response) => {
    try {
      const { appointmentId } = appointmentIdSchema.parse(req.params);
      const validatedData = updateAppointmentSchema.parse(req.body);

      const appointment = await prisma.appointment.update({
        where: {
          id: appointmentId,
          doctorId: req.user!.id, // Ensure only the doctor who created it can update
        },
        data: {
          ...validatedData,
          date: validatedData.date ? new Date(validatedData.date) : undefined,
        },
        include: {
          patient: {
            include: {
              person: true,
            },
          },
        },
      });

      res.status(200).json({
        message: "Appointment updated successfully",
        data: appointment,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: "Error updating appointment" });
      }
    }
  },
];

// Delete an appointment
export const deleteAppointment = [
  authenticateToken,
  authorizeRoles("HEALTHCARE_PROVIDER"),
  async (req: Request, res: Response) => {
    try {
      const { appointmentId } = appointmentIdSchema.parse(req.params);

      await prisma.appointment.delete({
        where: {
          id: appointmentId,
          doctorId: req.user!.id, // Ensure only the doctor who created it can delete
        },
      });

      res.status(200).json({
        message: "Appointment deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: "Error deleting appointment" });
      }
    }
  },
];

// Get dashboard statistics for doctor
export const getDashboardStats = [
  authenticateToken,
  authorizeRoles("HEALTHCARE_PROVIDER"),
  async (req: Request, res: Response) => {
    try {
      const doctorId = req.user!.id;
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      );
      const startOfWeek = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 7
      );

      // Get today's appointments
      const todayAppointments = await prisma.appointment.findMany({
        where: {
          doctorId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          patient: {
            include: {
              person: true,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      // Get upcoming appointments (next 7 days)
      const upcomingAppointments = await prisma.appointment.findMany({
        where: {
          doctorId,
          date: {
            gte: endOfDay,
            lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          patient: {
            include: {
              person: true,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
        take: 10,
      });

      // Get active patients (assigned to this doctor)
      const activePatients = await prisma.patientDoctorAssignment.findMany({
        where: {
          doctorId,
          status: "ACTIVE",
        },
        include: {
          patient: {
            include: {
              person: true,
            },
          },
        },
      });

      // Get recent patients (last 10 medical records)
      const recentPatients = await prisma.medicalRecord.findMany({
        where: {
          doctorId,
        },
        include: {
          patient: {
            include: {
              person: true,
            },
          },
        },
        orderBy: {
          visitDate: "desc",
        },
        take: 10,
      });

      // Get pending lab results (lab results without resultValue are considered pending)
      const pendingLabResults = await prisma.labResult.findMany({
        where: {
          medicalRecord: {
            doctorId,
          },
          resultValue: null,
        },
        include: {
          medicalRecord: {
            include: {
              patient: {
                include: {
                  person: true,
                },
              },
            },
          },
        },
      });

      // Get critical cases (patients with recent medical records that might need attention)
      const criticalCases = await prisma.medicalRecord.findMany({
        where: {
          doctorId,
          visitDate: {
            gte: startOfWeek,
          },
          OR: [
            { heartRate: { gte: 100 } },
            { heartRate: { lte: 60 } },
            { temperature: { gte: 38 } },
            { temperature: { lte: 35 } },
          ],
        },
        include: {
          patient: {
            include: {
              person: true,
            },
          },
        },
        orderBy: {
          visitDate: "desc",
        },
        take: 5,
      });

      // Calculate statistics
      const stats = {
        todayAppointments: {
          total: todayAppointments.length,
          remaining: todayAppointments.filter(
            (apt) => new Date(apt.date) > new Date()
          ).length,
        },
        activePatients: {
          total: activePatients.length,
          newThisWeek: activePatients.filter(
            (assignment) => assignment.createdAt >= startOfWeek
          ).length,
        },
        pendingLabResults: {
          total: pendingLabResults.length,
          urgent: pendingLabResults.filter(
            (result) =>
              result.medicalRecord?.patient?.person?.firstName
                ?.toLowerCase()
                .includes("urgent") ||
              result.medicalRecord?.patient?.person?.lastName
                ?.toLowerCase()
                .includes("urgent")
          ).length,
        },
        criticalCases: {
          total: criticalCases.length,
        },
        recentPatients: recentPatients,
        upcomingAppointments: upcomingAppointments,
      };

      res.status(200).json({
        message: "Dashboard statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res
          .status(500)
          .json({ message: "Error fetching dashboard statistics" });
      }
    }
  },
];

// Get forwarded patients for a doctor
export const getForwardedPatients = [
  authenticateToken,
  authorizeRoles("HEALTHCARE_PROVIDER"),
  async (req: Request, res: Response) => {
    try {
      const doctorId = req.user!.id;

      // Get all active patient assignments for this doctor
      const assignments = await prisma.patientDoctorAssignment.findMany({
        where: {
          doctorId,
          status: "ACTIVE",
        },
        include: {
          patient: {
            include: {
              person: true,
              emergencyContact: true,
              medicalRecords: {
                include: {
                  labResults: true,
                  prescriptions: true,
                  radiologyReports: true,
                  doctor: {
                    include: {
                      person: true,
                    },
                  },
                },
                orderBy: {
                  visitDate: "desc",
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Format the response
      const forwardedPatients = assignments.map((assignment) => ({
        id: assignment.id,
        patientId: assignment.patientId,
        doctorId: assignment.doctorId,
        status: assignment.status,
        notes: assignment.notes,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
        patient: {
          id: assignment.patient.id,
          person: assignment.patient.person,
          emergencyContact: assignment.patient.emergencyContact,
          medicalRecords: assignment.patient.medicalRecords.map((record) => ({
            id: record.id,
            visitDate: record.visitDate,
            diagnosis: record.diagnosis,
            chiefComplaint: record.chiefComplaint,
            bloodPressure: record.bloodPressure,
            heartRate: record.heartRate,
            temperature: record.temperature,
            physicalExamination: record.physicalExamination,
            notes: record.notes,
            doctor: record.doctor
              ? {
                  id: record.doctor.id,
                  role: record.doctor.role,
                  person: record.doctor.person,
                }
              : null,
            labResults: record.labResults,
            prescriptions: record.prescriptions,
            radiologyReports: record.radiologyReports,
          })),
        },
      }));

      res.status(200).json({
        success: true,
        message: "Forwarded patients retrieved successfully",
        data: forwardedPatients,
      });
    } catch (error) {
      console.error("Error getting forwarded patients:", error);
      res.status(500).json({
        success: false,
        message: "Error getting forwarded patients",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
];
