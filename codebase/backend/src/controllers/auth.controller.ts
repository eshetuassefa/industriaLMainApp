import { Request, Response, NextFunction, RequestHandler } from 'express';
import { 
    loginSchema, 
    tokenSchema, 
    refreshTokenSchema, 
    passwordResetSchema, 
    newPasswordSchema 
} from '../validators/auth.validator';

export const login: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    // Your login logic here using validatedData
    res.status(200).json({ 
      message: 'Login successful',
      token: 'your-jwt-token',
      refreshToken: 'your-refresh-token'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const refreshToken: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = refreshTokenSchema.parse(req.body);
    // Your refresh token logic here using validatedData
    res.status(200).json({ 
      message: 'Token refreshed successfully',
      token: 'your-new-jwt-token',
      refreshToken: 'your-new-refresh-token'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const resetPassword: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = passwordResetSchema.parse(req.body);
    // Your password reset logic here using validatedData
    res.status(200).json({ 
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const setNewPassword: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = newPasswordSchema.parse(req.body);
    // Your new password setting logic here using validatedData
    res.status(200).json({ 
      message: 'Password updated successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};