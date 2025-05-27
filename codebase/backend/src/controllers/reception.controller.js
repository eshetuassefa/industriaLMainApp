"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPatients = exports.updatePatient = exports.addPatient = void 0;
const client_1 = require("@prisma/client");
const reception_validator_1 = require("../validators/reception.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const prisma = new client_1.PrismaClient();
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
exports.addPatient = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)("SUPERADMIN"), // 👈 Only RECEPTIONIST can access
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validatedData = reception_validator_1.patientSchema.parse(req.body);
            const newPatient = yield prisma.patient.create({
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
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                console.error(error);
                res.status(500).json({ message: "Failed to add patient", error });
            }
        }
    }),
];
// Update patient details
exports.updatePatient = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)('ADMIN', 'RECEPTIONIST'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validatedData = reception_validator_1.updatePatientSchema.parse(req.body);
            const updatedPatient = yield prisma.patient.update({
                where: { id: validatedData.id },
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
            res.status(200).json({ message: 'Patient updated successfully', patient: updatedPatient });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                console.error(error);
                res.status(500).json({ message: 'Failed to update patient', error });
            }
        }
    })
];
// Fetch all or searched patients
exports.fetchPatients = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)("SUPERADMIN"), // 👈 Only RECEPTIONIST can access
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validatedData = reception_validator_1.searchPatientSchema.parse(req.query);
            const query = {
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
                query.where = Object.assign(Object.assign({}, query.where), { person: {
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
                    } });
            }
            const patients = yield prisma.patient.findMany(query);
            res.status(200).json(patients);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                console.error(error);
                res.status(500).json({ message: "Failed to fetch patients", error });
            }
        }
    }),
];
