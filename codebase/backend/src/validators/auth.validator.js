"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newPasswordSchema = exports.passwordResetSchema = exports.refreshTokenSchema = exports.tokenSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// Login validator
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email('Invalid email format')
        .min(5, 'Email must be at least 5 characters long')
        .max(100, 'Email must not exceed 100 characters'),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters long')
        .max(50, 'Password must not exceed 50 characters')
});
// JWT Token validator
exports.tokenSchema = zod_1.z.object({
    token: zod_1.z.string()
        .min(10, 'Token must be at least 10 characters long')
        .regex(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/, 'Invalid JWT token format'),
});
// Refresh token validator
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string()
        .min(10, 'Refresh token must be at least 10 characters long')
        .regex(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/, 'Invalid refresh token format'),
});
// Password reset validator
exports.passwordResetSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email('Invalid email format')
        .min(5, 'Email must be at least 5 characters long')
        .max(100, 'Email must not exceed 100 characters'),
});
// New password validator
exports.newPasswordSchema = zod_1.z.object({
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters long')
        .max(50, 'Password must not exceed 50 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: zod_1.z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
