import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { tokenSchema } from "../validators/auth.validator";
import { RoleType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define the shape of decoded JWT token
interface DecodedUser {
  id: string;
  role: RoleType;
  email: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}

// Authentication middleware: verifies JWT and attaches user
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Access denied. No token provided." });
      return;
    }

    // Validate token structure
    tokenSchema.parse({ token });

    // Decode and verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as DecodedUser;

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
    } else {
      res.status(401).json({ message: "Authentication failed" });
    }
  }
};

// Role-based middleware for specific roles
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(", ")}`,
      });
      return;
    }

    next();
  };
};

// Lab technician-only route guard
export const authorizeLabTechnician = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== RoleType.LAB_TECHNICIAN) {
      res.status(403).json({ message: "Access denied. Lab technician only." });
      return;
    }

    next();
  };
};

// Ownership middleware: check if lab technician owns the test request
export const checkTestRequestOwnership = (testRequestId: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const testRequest = await prisma.testRequest.findUnique({
        where: { id: testRequestId },
        include: {
          acceptedBy: true, // Ensure this matches your Prisma schema
        },
      });

      if (!testRequest) {
        res.status(404).json({ message: "Test request not found" });
        return;
      }

      if (testRequest.acceptedBy?.id !== req.user?.id) {
        res.status(403).json({
          message: "Access denied. You are not assigned to this test request.",
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};
