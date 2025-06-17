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

// Forward patient to a doctor
export const forwardPatient = [
  authenticateToken,
  authorizeRoles("RECEPTIONIST"),
  async (req: Request, res: Response) => {
    try {
      const validatedData = forwardPatientSchema.parse(req.body);
      const { patientId, doctorId, notes } = validatedData;

      // Check if patient exists
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Check if doctor exists and is a healthcare provider
      const doctor = await prisma.user.findFirst({
        where: {
          id: doctorId,
          role: "HEALTHCARE_PROVIDER",
        },
      });

      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found or not a healthcare provider" });
      }

      // Create or update assignment
      const assignment = await prisma.patientDoctorAssignment.upsert({
        where: {
          patientId_doctorId: {
            patientId,
            doctorId,
          },
        },
        update: {
          status: "ACTIVE",
          notes,
          updatedAt: new Date(),
        },
        create: {
          patientId,
          doctorId,
          notes,
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

      res.status(200).json({
        message: "Patient forwarded successfully",
        data: assignment,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.error(error);
        res.status(500).json({ message: "Failed to forward patient", error });
      }
    }
  },
];
