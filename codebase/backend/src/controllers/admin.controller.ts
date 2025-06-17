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
      departmentName, // Use departmentName only
    } = req.body;

    // Normalize values
    const normalizedSex = sex?.toUpperCase();
    const normalizedRole = role?.toUpperCase();

    // Validate role
    if (!allowedRoles.includes(normalizedRole as RoleType)) {
      res.status(400).json({
        message: "Invalid role provided for staff registration",
      });
      return;
    }

    // Validate department for HEALTHCARE_PROVIDER
    let departmentId: string | null = null;
    if (normalizedRole === "HEALTHCARE_PROVIDER") {
      if (!departmentName) {
        res.status(400).json({
          message: "Department name is required for healthcare providers",
        });
        return;
      }

      // Check if department exists
      const department = await prisma.department.findFirst({
        where: { name: departmentName },
      });
      if (!department) {
        res.status(400).json({
          message: `Department "${departmentName}" not found`,
        });
        return;
      }
      departmentId = department.id;
    } else if (departmentName) {
      // Non-healthcare providers should not have a department
      res.status(400).json({
        message: "Department name is only allowed for healthcare providers",
      });
      return;
    }

    // Check for existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        message: "User with this email already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = `${normalizedRole.toLowerCase()}-${email.split("@")[0]}`;

    // Create user with conditional department assignment
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: normalizedRole as RoleType,
        username,
        department: departmentId
          ? { connect: { id: departmentId } }
          : undefined,
        person: {
          create: {
            firstName,
            middleName,
            lastName,
            sex: normalizedSex,
            dob: new Date(dob),
            phoneNumber,
            address,
          },
        },
      },
      include: { person: true, department: true },
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
      include: { person: true, department: true },
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
      include: { person: true, department: true },
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
      departmentName, // Use departmentName only
    } = req.body;

    // Check if user exists
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

    // Validate department for role changes or updates
    const normalizedRole = role ? role.toUpperCase() : existingUser.role;
    if (normalizedRole === "HEALTHCARE_PROVIDER") {
      if (departmentName) {
        // Check if department exists
        const department = await prisma.department.findFirst({
          where: { name: departmentName },
        });
        if (!department) {
          res.status(400).json({
            message: `Department "${departmentName}" not found`,
          });
          return;
        }
        userUpdateData.department = { connect: { id: department.id } };
      } else if (role && !existingUser.departmentId && !departmentName) {
        // If role is changed to HEALTHCARE_PROVIDER, departmentName is required
        res.status(400).json({
          message: "Department name is required for healthcare providers",
        });
        return;
      }
    } else if (departmentName) {
      // Non-healthcare providers should not have a department
      res.status(400).json({
        message: "Department name is only allowed for healthcare providers",
      });
      return;
    } else if (
      normalizedRole !== "HEALTHCARE_PROVIDER" &&
      existingUser.departmentId
    ) {
      // If role changes from HEALTHCARE_PROVIDER to another, remove department
      userUpdateData.department = { disconnect: true };
    }

    // Update user-related fields
    if (email) userUpdateData.email = email;
    if (password) userUpdateData.password = await bcrypt.hash(password, 10);
    if (role) {
      if (!allowedRoles.includes(normalizedRole as RoleType)) {
        res.status(400).json({ message: "Invalid role for update" });
        return;
      }
      userUpdateData.role = normalizedRole;
    }

    // Update person-related fields
    if (dob) personUpdateData.dob = new Date(dob);
    if (firstName) personUpdateData.firstName = firstName;
    if (middleName) personUpdateData.middleName = middleName;
    if (lastName) personUpdateData.lastName = lastName;
    if (sex) personUpdateData.sex = sex.toUpperCase();
    if (phoneNumber) personUpdateData.phoneNumber = phoneNumber;
    if (address) personUpdateData.address = address;

    // If person data exists, update it
    if (existingUser.person) {
      const updatedStaff = await prisma.user.update({
        where: { id },
        data: {
          ...userUpdateData,
          person: {
            update: personUpdateData,
          },
        },
        include: { person: true, department: true },
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

// Get all departments
export const getAllDepartmentsController: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json(departments);
  } catch (error) {
    next(error);
  }
};
