import { RequestHandler } from "express";
import {
  PrismaClient,
  RoleType,
  TestStatus,
  ResultStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const allowedRoles: RoleType[] = [
  "RECEPTIONIST",
  "SUPERADMIN",
  "PHARMACIST",
  "LAB_TECHNICIAN",
  "RADIOLOGIST",
  "HEALTHCARE_PROVIDER",
];

// Register staff
export const registerStaffController: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      sex,
      dob,
      phoneNumber,
      address,
      email,
      password,
      role,
    } = req.body;

    // Validate role
    if (!allowedRoles.includes(role)) {
      res.status(400).json({
        message: "Invalid role provided for staff registration",
      });
      return;
    }

    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      res.status(400).json({
        message: "User with this email already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = `${role.toLowerCase()}-${email.split("@")[0]}`;

    // Create user and person
    const user = await prisma.user.create({
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
  } catch (error) {
    next(error);
  }
};

// Get all staff
export const getAllStaffsController: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const staffs = await prisma.user.findMany({
      where: {
        role: {
          in: allowedRoles,
        },
      },
      include: { person: true },
    });

    res.status(200).json({ data: staffs });
  } catch (error) {
    next(error);
  }
};

// Get staff by ID
export const getStaffByIdController: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const { id } = req.params;
    const staff = await prisma.user.findUnique({
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
  } catch (error) {
    next(error);
  }
};

// Update staff
export const updateStaffController: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      email,
      password,
      role,
      dob,
      firstName,
      middleName,
      lastName,
      sex,
      phoneNumber,
      address,
    } = req.body;

    // Check if user exists and has a person
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { person: true },
    });

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userUpdateData: any = {};
    const personUpdateData: any = {};

    // Update user-related fields
    if (email) userUpdateData.email = email;
    if (password) userUpdateData.password = await bcrypt.hash(password, 10);
    if (role) {
      if (!allowedRoles.includes(role)) {
        res.status(400).json({ message: "Invalid role for update" });
        return;
      }
      userUpdateData.role = role;
    }

    // Update person-related fields
    if (dob) personUpdateData.dob = new Date(dob);
    if (firstName) personUpdateData.firstName = firstName;
    if (middleName) personUpdateData.middleName = middleName;
    if (lastName) personUpdateData.lastName = lastName;
    if (sex) personUpdateData.sex = sex;
    if (phoneNumber) personUpdateData.phoneNumber = phoneNumber;
    if (address) personUpdateData.address = address;

    // If person data exists, update it
    if (existingUser.person) {
      // Perform updates separately for user and person
      const updatedStaff = await prisma.user.update({
        where: { id },
        data: {
          ...userUpdateData,
          person: {
            update: personUpdateData,
          },
        },
        include: { person: true },
      });

      res.status(200).json({
        message: "Staff updated successfully",
        data: updatedStaff,
      });
    } else {
      res.status(400).json({ message: "Person record not found" });
    }
  } catch (error) {
    next(error);
  }
};


// Delete staff
export const deleteStaffController: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const { id } = req.params;

    // Ensure the user exists before attempting to delete
    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      res.status(404).json({ message: "Staff not found" });
      return;
    }

    await prisma.user.delete({ where: { id } });

    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error) {
    next(error);
  }
};
