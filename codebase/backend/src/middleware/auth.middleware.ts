import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { tokenSchema } from '../validators/auth.validator';


declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader?.split(' ')[1];
  
      if (!token) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return;
      }
  
      tokenSchema.parse({ token });
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ message: 'Invalid token' });
        return;
      }
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: 'Token expired' });
        return;
      }
      res.status(401).json({ message: 'Authentication failed' });
    }
  };

// Role-based middleware
export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
  
      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          message: `Access denied. Required roles: ${roles.join(', ')}`
        });
        return;
      }
  
      next();
    };
  };