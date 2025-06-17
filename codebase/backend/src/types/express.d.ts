import { Multer } from "multer";
import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        // Add more properties if needed
      } & Partial<User>; // Merge custom fields with Prisma's User model

      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
  }
}
