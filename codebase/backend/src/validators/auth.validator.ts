import { z } from 'zod';

// Login validator
export const loginSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .min(5, 'Email must be at least 5 characters long')
        .max(100, 'Email must not exceed 100 characters'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters long')
        .max(50, 'Password must not exceed 50 characters')
        
});

// JWT Token validator
export const tokenSchema = z.object({
    token: z.string()
        .min(10, 'Token must be at least 10 characters long')
        .regex(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/, 'Invalid JWT token format'),
});

// Refresh token validator
export const refreshTokenSchema = z.object({
    refreshToken: z.string()
        .min(10, 'Refresh token must be at least 10 characters long')
        .regex(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/, 'Invalid refresh token format'),
});

// Password reset validator
export const passwordResetSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .min(5, 'Email must be at least 5 characters long')
        .max(100, 'Email must not exceed 100 characters'),
});

// New password validator
export const newPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters long')
        .max(50, 'Password must not exceed 50 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type TokenInput = z.infer<typeof tokenSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
