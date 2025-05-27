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
exports.authorizeRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_validator_1 = require("../validators/auth.validator");
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Access denied. No token provided.' });
            return;
        }
        auth_validator_1.tokenSchema.parse({ token });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ message: 'Token expired' });
            return;
        }
        res.status(401).json({ message: 'Authentication failed' });
    }
});
exports.authenticateToken = authenticateToken;
// Role-based middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        console.log("User Role:", req.user.role); // Debug log
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                message: `Access denied. Required roles: ${roles.join(", ")}`,
            });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
