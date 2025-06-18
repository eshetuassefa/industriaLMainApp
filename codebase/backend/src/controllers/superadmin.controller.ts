import { Request, Response, NextFunction, RequestHandler } from "express";
import { PrismaClient, RoleType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Create a new admin (superadmin only)
export const createSystemAdmin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phoneNumber, hospitalId } = req.body;

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      res.status(400).json({ message: "Admin with this email already exists" });
      return;
    }

    // Check if hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
    });
    if (!hospital) {
      res.status(400).json({ message: "Hospital does not exist" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create person record first
    const person = await prisma.person.create({
      data: {
        firstName,
        lastName,
        phoneNumber,
        sex: "UNKNOWN", // Default value
        dob: new Date(), // Default value
      },
    });

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "ADMIN",
        personId: person.id,
        hospitalId: hospital.id,
      },
      include: {
        person: true,
        hospital: true,
      },
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        person: admin.person,
        hospital: admin.hospital,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all system admins
export const getAllSystemAdmins: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      include: {
        person: true,
        hospital: true,
      },
    });

    res.status(200).json(admins);
  } catch (error) {
    next(error);
  }
};

// Update system admin
export const updateSystemAdmin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, phoneNumber } = req.body;

    const admin = await prisma.user.update({
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
  } catch (error) {
    next(error);
  }
};

// Delete system admin
export const deleteSystemAdmin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: "System admin deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Create a new hospital
export const createHospital: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, code, regionId, city, zone } = req.body;

    // Validate region existence
    const region = await prisma.region.findUnique({
      where: { id: Number(regionId) },
    });

    if (!region) {
      res
        .status(400)
        .json({ message: `Region with ID ${regionId} does not exist` });
      return;
    }

    // Check if hospital code already exists
    const existingHospital = await prisma.hospital.findFirst({
      where: { code },
    });

    if (existingHospital) {
      res.status(400).json({ message: "Hospital with this code already exists" });
      return;
    }

    const hospital = await prisma.hospital.create({
      data: {
        name,
        code,
        regionId: Number(regionId),
        city,
        zone,
      },
      include: {
        region: true,
      },
    });

    res.status(201).json({
      message: "Hospital created successfully",
      hospital,
    });
  } catch (error) {
    next(error);
  }
};
  
// Get all hospitals
export const getAllHospitals: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hospitals = await prisma.hospital.findMany({
      include: {
        region: true,
        users: {
          where: {
            role: "ADMIN"
          },
          include: {
            person: true
          }
        }
      },
    });

    res.status(200).json(hospitals);
  } catch (error) {
    next(error);
  }
};

// Update hospital
export const updateHospital: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, code, regionId, city, zone } = req.body;

    const hospital = await prisma.hospital.update({
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
  } catch (error) {
    next(error);
  }
};

// Delete hospital
export const deleteHospital: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.hospital.delete({
      where: { id },
    });

    res.status(200).json({ message: "Hospital deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Get all regions
export const getAllRegions: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const regions = await prisma.region.findMany();
    res.status(200).json(regions);
  } catch (error) {
    next(error);
  }
};
