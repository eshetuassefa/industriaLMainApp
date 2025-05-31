import { Request, Response, NextFunction, RequestHandler } from "express";
import {
  loginSchema,
  tokenSchema,
  refreshTokenSchema,
  passwordResetSchema,
  newPasswordSchema,
} from "../validators/auth.validator";
import { PrismaClient, RoleType } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const login: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        person: true,
      },
    });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Verify password
    const validPassword = await bcrypt.compare(
      validatedData.password,
      user.password
    );
    if (!validPassword) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        personId: user.personId,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key",
      { expiresIn: "7d" }
    );

    // Determine redirect URL based on role
    let redirectUrl = "/";
    switch (user.role) {
      case RoleType.SUPERADMIN:
        redirectUrl = "/superadmin/dashboard";
        break;
      case RoleType.ADMIN:
        redirectUrl = "/admin/dashboard";
        break;
      case RoleType.HEALTHCARE_PROVIDER:
        redirectUrl = "/doctor/dashboard";
        break;
      case RoleType.PHARMACIST:
        redirectUrl = "/pharmacy/dashboard";
        break;
      case RoleType.LAB_TECHNICIAN:
        redirectUrl = "/lab/dashboard";
        break;
      case RoleType.RADIOLOGIST:
        redirectUrl = "/radiology/dashboard";
        break;
      case RoleType.RECEPTIONIST:
        redirectUrl = "/reception/dashboard";
        break;
      default:
        redirectUrl = "/";
    }

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        person: user.person,
        redirectUrl,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const refreshToken: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = refreshTokenSchema.parse(req.body);

    // Verify refresh token
    const decoded = jwt.verify(
      validatedData.refreshToken,
      process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key"
    );

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: (decoded as any).id },
      include: {
        person: true,
      },
    });

    if (!user) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    // Generate new access token
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        personId: user.personId,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "15m" }
    );

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};
