import { User } from "@prisma/client"; // If using Prisma User model

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        // Add other user properties as needed
      };
    }
  }
}