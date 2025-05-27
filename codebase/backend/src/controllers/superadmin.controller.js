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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHospital = exports.updateHospital = exports.getAllHospitals = exports.createHospital = exports.deleteSystemAdmin = exports.updateSystemAdmin = exports.getAllSystemAdmins = exports.createSystemAdmin = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
// Create a new admin (superadmin only)
const createSystemAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, firstName, lastName, phoneNumber } = req.body;
        // Check if admin already exists
        const existingAdmin = yield prisma.user.findUnique({
            where: { email },
        });
        if (existingAdmin) {
            res.status(400).json({ message: "Admin with this email already exists" });
            return;
        }
        // Hash password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Create person record first
        const person = yield prisma.person.create({
            data: {
                firstName,
                lastName,
                phoneNumber,
                sex: "UNKNOWN", // Default value
                dob: new Date(), // Default value
            },
        });
        // Create admin user
        const admin = yield prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "ADMIN",
                personId: person.id,
            },
            include: {
                person: true,
            },
        });
        res.status(201).json({
            message: "System admin created successfully",
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role,
                person: admin.person,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createSystemAdmin = createSystemAdmin;
// Get all system admins
const getAllSystemAdmins = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield prisma.user.findMany({
            where: {
                role: "ADMIN",
            },
            include: {
                person: true,
            },
        });
        res.status(200).json(admins);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllSystemAdmins = getAllSystemAdmins;
// Update system admin
const updateSystemAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { email, firstName, lastName, phoneNumber } = req.body;
        const admin = yield prisma.user.update({
            where: { id },
            data: {
                email,
                person: {
                    update: {
                        firstName,
                        lastName,
                        phoneNumber,
                    },
                },
            },
            include: {
                person: true,
            },
        });
        res.status(200).json({
            message: "System admin updated successfully",
            admin,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateSystemAdmin = updateSystemAdmin;
// Delete system admin
const deleteSystemAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.user.delete({
            where: { id },
        });
        res.status(200).json({ message: "System admin deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteSystemAdmin = deleteSystemAdmin;
// Create a new hospital
// export const createHospital: RequestHandler = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { name, code, regionId, city, zone } = req.body;
//     const hospital = await prisma.hospital.create({
//       data: {
//         name,
//         code,
//         regionId,
//         city,
//         zone,
//       },
//     });
//     res.status(201).json({
//       message: "Hospital created successfully",
//       hospital,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
const createHospital = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, code, regionId, city, zone } = req.body;
        // Validate region existence
        const region = yield prisma.region.findUnique({
            where: { id: regionId },
        });
        if (!region) {
            res
                .status(400)
                .json({ message: `Region with ID ${regionId} does not exist` });
            return;
        }
        const hospital = yield prisma.hospital.create({
            data: {
                name,
                code,
                regionId,
                city,
                zone,
            },
        });
        res.status(201).json({
            message: "Hospital created successfully",
            hospital,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createHospital = createHospital;
// Get all hospitals
const getAllHospitals = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hospitals = yield prisma.hospital.findMany({
            include: {
                region: true,
            },
        });
        res.status(200).json(hospitals);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllHospitals = getAllHospitals;
// Update hospital
const updateHospital = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, code, regionId, city, zone } = req.body;
        const hospital = yield prisma.hospital.update({
            where: { id },
            data: {
                name,
                code,
                regionId,
                city,
                zone,
            },
        });
        res.status(200).json({
            message: "Hospital updated successfully",
            hospital,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateHospital = updateHospital;
// Delete hospital
const deleteHospital = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.hospital.delete({
            where: { id },
        });
        res.status(200).json({ message: "Hospital deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteHospital = deleteHospital;
