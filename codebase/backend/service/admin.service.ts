import { PrismaClient, RoleType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

export const registerStaffService = async (data: StaffData) => {
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

  // Validate role
  const allowedRoles = [
    "RECEPTIONIST",
    "PHARMACIST",
    "LAB_TECHNICIAN",
    "RADIOLOGIST",
    "HEALTHCARE_PROVIDER", // Optional: if you add this role to enum
  ];

  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role provided for staff registration");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate a username based on the role and email
  let username = `${role.toLowerCase()}-${email.split("@")[0]}`;
  // Example: For "LAB_TECHNICIAN" role and email "mekdes@example.com", username becomes "lab_technician-mekdes"

  // Optional: Ensure the username is unique (you can add a check here to see if the username exists already)

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
          username, // Include the generated username
        },
      },
    },
    include: {
      user: true,
    },
  });

  return person;
};
