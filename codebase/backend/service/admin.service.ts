// Import Prisma client and RoleType enum from Prisma schema
import { PrismaClient, RoleType } from "@prisma/client";
// Import bcrypt for password hashing
import bcrypt from "bcryptjs";

// Instantiate Prisma client
const prisma = new PrismaClient();

// Define the shape of staff data expected in the request
interface StaffData {
  firstName: string;
  middleName?: string;
  lastName: string;
  sex: string;
  dob: string;
  phoneNumber?: string;
  address?: string;
  email: string;
  password: string;
  role: RoleType;
}

// Service function to register a new staff member
export const registerStaffService = async (data: StaffData) => {
  // Destructure fields from the input data
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
  } = data;

  // Validate if the role is within the allowed list
  const allowedRoles = [
    "RECEPTIONIST",
    "PHARMACIST",
    "LAB_TECHNICIAN",
    "RADIOLOGIST",
    "HEALTHCARE_PROVIDER", // Optional role
  ];
  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role provided for staff registration");
  }

  // Secure the password using bcrypt hashing
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate a username using role and email prefix
  let username = `${role.toLowerCase()}-${email.split("@")[0]}`;
  // Example: lab_technician-mekdes

  // TODO: Add a check here if you want to ensure the username is unique

  // Create a new person and associated user record in the database
  const person = await prisma.person.create({
    data: {
      firstName,
      middleName,
      lastName,
      sex,
      dob: new Date(dob),
      phoneNumber,
      address,
      user: {
        create: {
          email,
          password: hashedPassword,
          role,
          username,
        },
      },
    },
    // Include the created user data in the response
    include: {
      user: true,
    },
  });

  // Return the full person object with nested user info
  return person;
};


// Get all staff members (including related user info)
export const getAllStaffsService = async () => {
  return await prisma.person.findMany({
    include: { user: true },
  });
};
export const getStaffByIdService = async (id: string) => {
  try {
    const staff = await prisma.person.findUnique({
      where: { id },
      include: { user: true }, // Include user data as well if you need it
    });

    if (!staff) {
      throw new Error("Staff not found");
    }

    return staff;
  } catch (err) {
    console.error("Error getting staff:", err);
    throw new Error("Failed to get staff");
  }
};


// Update a staff member by ID
export const updateStaffService = async (
  id: string,
  data: Partial<StaffData>
) => {
  const { password, email, role, dob, ...rest } = data;
  let updateData: any = { ...rest };

  // Convert dob to Date if it's provided as a string
  if (dob) {
    updateData.dob = new Date(dob); // Convert to Date object
  }

  // Handle password update
  if (password) {
    updateData.user = {
      update: {
        password: await bcrypt.hash(password, 10), // Hash the new password
      },
    };
  }

  // Handle email update in the user table
  if (email) {
    updateData.user = {
      update: {
        email, // Update the email in the user table
      },
    };
  }

  // Handle role update in the user table
  if (role) {
    updateData.user = {
      update: {
        role, // Update the role in the user table
      },
    };
  }

  // Update staff data in the database
  return await prisma.person.update({
    where: { id },
    data: updateData,
    include: { user: true },
  });
};


// Delete a staff member and their user account
export const deleteStaffService = async (id: string) => {
  try {
    // Delete the related user first
    await prisma.user.delete({
      where: {
        personId: id, // Assuming the foreign key is `personId` in the `user` table
      },
    });

    // Then delete the person record
    return await prisma.person.delete({
      where: {
        id,
      },
    });
  } catch (err) {
    console.error("Error deleting staff:", err);
    throw new Error("Failed to delete staff");
  }
};

