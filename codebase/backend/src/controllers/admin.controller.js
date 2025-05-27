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
exports.deleteStaffController = exports.updateStaffController = exports.getStaffByIdController = exports.getAllStaffsController = exports.registerStaffController = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const allowedRoles = [
    "RECEPTIONIST",
    "SUPERADMIN",
    "PHARMACIST",
    "LAB_TECHNICIAN",
    "RADIOLOGIST",
    "HEALTHCARE_PROVIDER",
];
// Register staff
const registerStaffController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, middleName, lastName, sex, dob, phoneNumber, address, email, password, role, } = req.body;
        // Validate role
        if (!allowedRoles.includes(role)) {
            res.status(400).json({
                message: "Invalid role provided for staff registration",
            });
            return;
        }
        // Check if the email already exists
        const existingUser = yield prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(400).json({
                message: "User with this email already exists",
            });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const username = `${role.toLowerCase()}-${email.split("@")[0]}`;
        // Create user and person
        const user = yield prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                username,
                person: {
                    create: {
                        firstName,
                        middleName,
                        lastName,
                        sex,
                        dob: new Date(dob),
                        phoneNumber,
                        address,
                    },
                },
            },
            include: { person: true },
        });
        res.status(201).json({
            message: "Staff registered successfully",
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.registerStaffController = registerStaffController;
// Get all staff
const getAllStaffsController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staffs = yield prisma.user.findMany({
            where: {
                role: {
                    in: allowedRoles,
                },
            },
            include: { person: true },
        });
        res.status(200).json({ data: staffs });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllStaffsController = getAllStaffsController;
// Get staff by ID
const getStaffByIdController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const staff = yield prisma.user.findUnique({
            where: { id },
            include: { person: true },
        });
        if (!staff || !allowedRoles.includes(staff.role)) {
            res.status(404).json({ message: "Staff not found" });
            return;
        }
        res.status(200).json({
            message: "Staff retrieved successfully",
            data: staff,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getStaffByIdController = getStaffByIdController;
// Update staff
const updateStaffController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { email, password, role, dob, firstName, middleName, lastName, sex, phoneNumber, address, } = req.body;
        // Check if user exists and has a person
        const existingUser = yield prisma.user.findUnique({
            where: { id },
            include: { person: true },
        });
        if (!existingUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const userUpdateData = {};
        const personUpdateData = {};
        // Update user-related fields
        if (email)
            userUpdateData.email = email;
        if (password)
            userUpdateData.password = yield bcryptjs_1.default.hash(password, 10);
        if (role) {
            if (!allowedRoles.includes(role)) {
                res.status(400).json({ message: "Invalid role for update" });
                return;
            }
            userUpdateData.role = role;
        }
        // Update person-related fields
        if (dob)
            personUpdateData.dob = new Date(dob);
        if (firstName)
            personUpdateData.firstName = firstName;
        if (middleName)
            personUpdateData.middleName = middleName;
        if (lastName)
            personUpdateData.lastName = lastName;
        if (sex)
            personUpdateData.sex = sex;
        if (phoneNumber)
            personUpdateData.phoneNumber = phoneNumber;
        if (address)
            personUpdateData.address = address;
        // If person data exists, update it
        if (existingUser.person) {
            // Perform updates separately for user and person
            const updatedStaff = yield prisma.user.update({
                where: { id },
                data: Object.assign(Object.assign({}, userUpdateData), { person: {
                        update: personUpdateData,
                    } }),
                include: { person: true },
            });
            res.status(200).json({
                message: "Staff updated successfully",
                data: updatedStaff,
            });
        }
        else {
            res.status(400).json({ message: "Person record not found" });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.updateStaffController = updateStaffController;
// Delete staff
const deleteStaffController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Ensure the user exists before attempting to delete
        const userToDelete = yield prisma.user.findUnique({
            where: { id },
        });
        if (!userToDelete) {
            res.status(404).json({ message: "Staff not found" });
            return;
        }
        yield prisma.user.delete({ where: { id } });
        res.status(200).json({ message: "Staff deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteStaffController = deleteStaffController;
