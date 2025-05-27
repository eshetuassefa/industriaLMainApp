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
exports.refreshToken = exports.login = void 0;
const auth_validator_1 = require("../validators/auth.validator");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = auth_validator_1.loginSchema.parse(req.body);
        // Find user in database
        const user = yield prisma.user.findUnique({
            where: { email: validatedData.email },
            include: {
                person: true
            }
        });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Verify password
        const validPassword = yield bcrypt_1.default.compare(validatedData.password, user.password);
        if (!validPassword) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Generate tokens
        const accessToken = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            personId: user.personId
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key', { expiresIn: '7d' });
        // Determine redirect URL based on role
        let redirectUrl = '/';
        switch (user.role) {
            case client_1.RoleType.SUPERADMIN:
                redirectUrl = '/superadmin/dashboard';
                break;
            case client_1.RoleType.ADMIN:
                redirectUrl = '/admin/dashboard';
                break;
            case client_1.RoleType.HEALTHCARE_PROVIDER:
                redirectUrl = '/doctor/dashboard';
                break;
            case client_1.RoleType.PHARMACIST:
                redirectUrl = '/pharmacy/dashboard';
                break;
            case client_1.RoleType.LAB_TECHNICIAN:
                redirectUrl = '/lab/dashboard';
                break;
            case client_1.RoleType.RADIOLOGIST:
                redirectUrl = '/radiology/dashboard';
                break;
            case client_1.RoleType.RECEPTIONIST:
                redirectUrl = '/reception/dashboard';
                break;
            default:
                redirectUrl = '/';
        }
        res.status(200).json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                person: user.person,
                redirectUrl
            }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        }
        else {
            next(error);
        }
    }
});
exports.login = login;
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = auth_validator_1.refreshTokenSchema.parse(req.body);
        // Verify refresh token
        const decoded = jsonwebtoken_1.default.verify(validatedData.refreshToken, process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key');
        // Find user
        const user = yield prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                person: true
            }
        });
        if (!user) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }
        // Generate new access token
        const accessToken = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            personId: user.personId
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '15m' });
        res.status(200).json({
            message: 'Token refreshed successfully',
            accessToken
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        }
        else {
            next(error);
        }
    }
});
exports.refreshToken = refreshToken;
