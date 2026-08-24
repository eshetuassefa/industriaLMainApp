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
      departmentName,
    } = req.body;

    // Get admin's hospital ID from the JWT token
    const adminHospitalId = req.user?.hospitalId;
    if (!adminHospitalId) {
      res.status(400).json({
        message: "Admin must be associated with a hospital to create staff",
      });
      return;
    }

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

      // Find or create the department
      const department = await prisma.department.upsert({
        where: {
          name: departmentName,
        },
        update: {
          hospitalId: adminHospitalId,
        },
        create: {
          name: departmentName,
          code: departmentName.toUpperCase().replace(/\s+/g, "_"),
          hospitalId: adminHospitalId,
        },
      });
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

    // Create user with hospital and conditional department assignment
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: normalizedRole as RoleType,
        username,
        hospital: {
          connect: { id: adminHospitalId },
        },
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
      include: {
        person: true,
        department: true,
        hospital: true,
      },
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
    // Get admin's hospital ID from the JWT token
    const adminHospitalId = req.user?.hospitalId;

    console.log("User hospital ID:", adminHospitalId);
    console.log("User role:", req.user?.role);

    const staffs = await prisma.user.findMany({
      where: {
        role: {
          in: allowedRoles,
        },
        ...(adminHospitalId ? { hospitalId: adminHospitalId } : {}), // Only filter by hospital if adminHospitalId exists
      },
      include: {
        person: true,
        department: true,
        hospital: true,
      },
    });

    console.log("Found staff members:", staffs.length);
    console.log(
      "Healthcare providers:",
      staffs.filter((s) => s.role === "HEALTHCARE_PROVIDER").length
    );

    // Log each healthcare provider's department
    staffs
      .filter((s) => s.role === "HEALTHCARE_PROVIDER")
      .forEach((provider, index) => {
        console.log(`Provider ${index + 1}:`, {
          name: `${provider.person?.firstName} ${provider.person?.lastName}`,
          department: provider.department?.name,
          departmentId: provider.department?.id,
          hospitalId: provider.hospitalId,
        });
      });

    res.status(200).json({ data: staffs });
  } catch (error) {
    console.error("Error fetching staff:", error);
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
    const adminHospitalId = req.user?.hospitalId;
    if (!adminHospitalId) {
      res.status(400).json({
        message: "Admin must be associated with a hospital to view staff",
      });
      return;
    }

    const staff = await prisma.user.findFirst({
      where: {
        id,
        hospitalId: adminHospitalId, // Only get staff from admin's hospital
      },
      include: {
        person: true,
        department: true,
        hospital: true,
      },
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
    const adminHospitalId = req.user?.hospitalId;
    if (!adminHospitalId) {
      res.status(400).json({
        message: "Admin must be associated with a hospital to update staff",
      });
      return;
    }

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
      departmentName,
    } = req.body;

    // Check if user exists and belongs to admin's hospital
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        hospitalId: adminHospitalId,
      },
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
        // Check if department exists in admin's hospital
        const department = await prisma.department.findFirst({
          where: {
            name: departmentName,
            hospitalId: adminHospitalId,
          },
        });
        if (!department) {
          res.status(400).json({
            message: `Department "${departmentName}" not found in your hospital`,
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
        include: {
          person: true,
          department: true,
          hospital: true,
        },
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
    const adminHospitalId = req.user?.hospitalId;
    if (!adminHospitalId) {
      res.status(400).json({
        message: "Admin must be associated with a hospital to delete staff",
      });
      return;
    }

    // Ensure the user exists and belongs to admin's hospital
    const userToDelete = await prisma.user.findFirst({
      where: {
        id,
        hospitalId: adminHospitalId,
      },
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
    const adminHospitalId = req.user?.hospitalId;

    console.log("User hospital ID:", adminHospitalId);
    console.log("User role:", req.user?.role);

    const departments = await prisma.department.findMany({
      where: adminHospitalId
        ? {
            hospitalId: adminHospitalId,
          }
        : {}, // If no hospitalId, get all departments
      orderBy: {
        name: "asc",
      },
    });

    console.log("Found departments:", departments.length);
    console.log("Departments:", departments);

    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    next(error);
  }
};

// Create department
export const createDepartmentController: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const { name, code } = req.body;
    const adminHospitalId = req.user?.hospitalId;

    if (!adminHospitalId) {
      res.status(400).json({
        message:
          "Admin must be associated with a hospital to create departments",
      });
      return;
    }

    // Check if department already exists in the hospital
    const existingDepartment = await prisma.department.findFirst({
      where: {
        name,
        hospitalId: adminHospitalId,
      },
    });

    if (existingDepartment) {
      res.status(400).json({
        message: `Department "${name}" already exists in your hospital`,
      });
      return;
    }

    // Create new department
    const department = await prisma.department.create({
      data: {
        name,
        code,
        hospitalId: adminHospitalId,
      },
    });

    res.status(201).json({
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

// Associate departments with hospital
export const associateDepartmentsController: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const adminHospitalId = req.user?.hospitalId;
    if (!adminHospitalId) {
      res.status(400).json({
        message:
          "Admin must be associated with a hospital to manage departments",
      });
      return;
    }

    // Get all departments that don't have a hospital ID
    const unassignedDepartments = await prisma.department.findMany({
      where: {
        hospitalId: null,
      },
    });

    // Associate each department with the admin's hospital
    const updatedDepartments = await Promise.all(
      unassignedDepartments.map((dept) =>
        prisma.department.update({
          where: { id: dept.id },
          data: { hospitalId: adminHospitalId },
        })
      )
    );

    res.status(200).json({
      message: "Departments associated with hospital successfully",
      data: updatedDepartments,
    });
  } catch (error) {
    next(error);
  }
};

// Get all departments (without hospital filtering)
export const getAllDepartmentsNoFilterController: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    console.log("Getting all departments without hospital filter");

    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
    });

    console.log("Found departments (no filter):", departments.length);
    console.log("Departments (no filter):", departments);

    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments (no filter):", error);
    next(error);
  }
};
