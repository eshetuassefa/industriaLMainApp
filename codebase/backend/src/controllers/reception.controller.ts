import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import {
  patientSchema,
  updatePatientSchema,
  searchPatientSchema,
  forwardPatientSchema,
} from "../validators/reception.validator";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// Add a new patient
// export const addPatient = [
//   authenticateToken,
//   authorizeRoles("RECEPTIONIST"), //NB. add receptionist role latter when they created
//   async (req: Request, res: Response) => {
//     try {
//       const validatedData = patientSchema.parse(req.body);
//       const newPatient = await prisma.patient.create({
//         data: {
//           nationalId: validatedData.nationalId,
//           birthCertificate: validatedData.birthCertificate,
//           person: {
//             create: {
//               firstName: validatedData.firstName,
//               middleName: validatedData.middleName,
//               lastName: validatedData.lastName,
//               sex: validatedData.sex,
//               dob: new Date(validatedData.dob),
//               phoneNumber: validatedData.phoneNumber,
//               address: validatedData.address,
//             },
//           },
//           emergencyContact: {
//             create: {
//               name: validatedData.emergencyContact.name,
//               phone: validatedData.emergencyContact.phone,
//             },
//           },
//         },
//         include: {
//           person: true,
//           emergencyContact: true,
//         },
//       });

//       res
//         .status(201)
//         .json({ message: "Patient added successfully", patient: newPatient });
//     } catch (error) {
//       if (error instanceof Error) {
//         res.status(400).json({ message: error.message });
//       } else {
//         console.error(error);
//         res.status(500).json({ message: "Failed to add patient", error });
//       }
//     }
//   },
// ];
export const addPatient = [
  authenticateToken,
  authorizeRoles("RECEPTIONIST"), // 👈 Only RECEPTIONIST can access
  async (req: Request, res: Response) => {
    try {
      const validatedData = patientSchema.parse(req.body);

      const newPatient = await prisma.patient.create({
        data: {
          nationalId: validatedData.nationalId,
          birthCertificate: validatedData.birthCertificate,
          person: {
            create: {
              firstName: validatedData.firstName,
              middleName: validatedData.middleName,
              lastName: validatedData.lastName,
              sex: validatedData.sex,
              dob: new Date(validatedData.dob),
              phoneNumber: validatedData.phoneNumber,
              address: validatedData.address,
            },
          },
          bloodType: validatedData.bloodType,
          emergencyContact: {
            create: {
              name: validatedData.emergencyContact.name,
              phone: validatedData.emergencyContact.phone,
            },
          },
        },
        include: {
          person: true,
          emergencyContact: true,
        },
      });

      res.status(201).json({
        message: "Patient added successfully",
        patient: newPatient,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: "Failed to add patient", error });
      }
    }
  },
];
// Update patient details
export const updatePatient = [
  authenticateToken,
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  async (req: Request, res: Response) => {
    try {
      const patientId = req.params.id;
      const validatedData = updatePatientSchema.parse(req.body);
      
      const updatedPatient = await prisma.patient.update({
        where: { id: patientId },
        data: {
          nationalId: validatedData.nationalId,
          birthCertificate: validatedData.birthCertificate,
          person: {
            update: {
              firstName: validatedData.firstName,
              middleName: validatedData.middleName,
              lastName: validatedData.lastName,
              sex: validatedData.sex,
              dob: new Date(validatedData.dob),
              phoneNumber: validatedData.phoneNumber,
              address: validatedData.address,
            },
          },
          bloodType: validatedData.bloodType,
          emergencyContact: {
            upsert: {
                update: {
                name: validatedData.emergencyContact.name,
                phone: validatedData.emergencyContact.phone,
                },
                create: {
                name: validatedData.emergencyContact.name,
                phone: validatedData.emergencyContact.phone,
              },
            },
              },
        },
        include: {
          person: true,
          emergencyContact: true,
        },
      });

      res.status(200).json({
        message: "Patient updated successfully",
        patient: updatedPatient,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: "Failed to update patient", error });
      }
    }
  },
];

// Fetch all or searched patients
export const fetchPatients = [
  authenticateToken,
  authorizeRoles("SUPERADMIN", "RECEPTIONIST", "HEALTHCARE_PROVIDER"), // 👈 Only RECEPTIONIST can access
  async (req: Request, res: Response) => {
    try {
      const validatedData = searchPatientSchema.parse(req.query);
      const query: any = {
        include: {
          person: true,
          emergencyContact: true,
        },
        where: {},
      };

      if (validatedData.nationalId) {
        query.where.nationalId = validatedData.nationalId;
      }

      if (validatedData.name) {
        query.where = {
          ...query.where,
          person: {
            OR: [
              {
                firstName: {
                  contains: validatedData.name,
                  mode: "insensitive",
                },
              },
              {
                middleName: {
                  contains: validatedData.name,
                  mode: "insensitive",
                },
              },
              {
                lastName: { contains: validatedData.name, mode: "insensitive" },
              },
            ],
          },
        };
      }

      const patients = await prisma.patient.findMany(query);
      res.status(200).json(patients);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch patients", error });
      }
    }
  },
];

// Forward a patient to a specific doctor
export const forwardPatient = [
  authenticateToken,
  authorizeRoles('RECEPTIONIST'),
  async (req: Request, res: Response) => {
    try {
      const { patientId, doctorId, notes } = req.body;

      // Validate required fields
      if (!patientId || !doctorId) {
        return res.status(400).json({ message: 'Patient ID and Doctor ID are required' });
      }

      // Check if patient exists
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: { person: true }
      });

      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      // Check if doctor exists and is a healthcare provider
      const doctor = await prisma.user.findFirst({
        where: {
          id: doctorId,
          role: 'HEALTHCARE_PROVIDER'
        }
      });

      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found or is not a healthcare provider' });
      }

      // Create or update patient-doctor assignment
      const assignment = await prisma.patientDoctorAssignment.upsert({
        where: {
          patientId_doctorId: {
            patientId,
            doctorId
          }
        },
        update: {
          status: 'ACTIVE',
          notes,
          updatedAt: new Date()
        },
        create: {
          patientId,
          doctorId,
          notes,
          status: 'ACTIVE'
        }
      });

      res.status(200).json({
        message: 'Patient forwarded successfully',
        data: {
          assignment,
          patient: {
            id: patient.id,
            person: patient.person
          },
          doctor: {
            id: doctor.id,
            role: doctor.role
          }
        }
      });
    } catch (error) {
      console.error('Error forwarding patient:', error);
      res.status(500).json({ message: 'Error forwarding patient' });
    }
  }
];

// Get forwarded patient details with medical history
export const getForwardedPatient = [
  authenticateToken,
  authorizeRoles('RECEPTIONIST', 'HEALTHCARE_PROVIDER'),
  async (req: Request, res: Response) => {
    try {
      const { patientId, doctorId } = req.params;

      // Validate required fields
      if (!patientId || !doctorId) {
        return res.status(400).json({ message: 'Patient ID and Doctor ID are required' });
      }

      // Get patient-doctor assignment
      const assignment = await prisma.patientDoctorAssignment.findFirst({
        where: {
          patientId,
          doctorId,
          status: 'ACTIVE'
        }
      });

      if (!assignment) {
        return res.status(404).json({ message: 'You have No active assignment  ' });
      }

      // Get patient details with medical history
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
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
                  person: true
                }
              }
            },
            orderBy: {
              visitDate: 'desc'
            }
          }
        }
      });

      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      res.status(200).json({
        message: 'Forwarded patient details retrieved successfully',
        data: {
          assignment,
          patient: {
            id: patient.id,
            person: patient.person,
            emergencyContact: patient.emergencyContact,
            medicalRecords: patient.medicalRecords.map(record => ({
              id: record.id,
              visitDate: record.visitDate,
              diagnosis: record.diagnosis,
              chiefComplaint: record.chiefComplaint,
              bloodPressure: record.bloodPressure,
              heartRate: record.heartRate,
              temperature: record.temperature,
              physicalExamination: record.physicalExamination,
              notes: record.notes,
              doctor: record.doctor ? {
                id: record.doctor.id,
                role: record.doctor.role,
                person: record.doctor.person
              } : null,
              labResults: record.labResults,
              prescriptions: record.prescriptions,
              radiologyReports: record.radiologyReports
            }))
          }
        }
      });
    } catch (error) {
      console.error('Error getting forwarded patient:', error);
      res.status(500).json({ message: 'Error getting forwarded patient details' });
    }
  }
];
