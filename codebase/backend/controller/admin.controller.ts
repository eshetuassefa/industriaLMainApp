import { Request, Response } from "express";
import { registerStaffService } from "../service/admin.service";

export const registerStaffController = async (req: Request, res: Response) => {
  try {
    const staffData = req.body;
    const registeredUser = await registerStaffService(staffData);

    res.status(201).json({
      message: "Staff registered successfully",
      data: registeredUser,
    });
  } catch (err: any) {
    console.error("RegisterStaffController Error:", err);
    res
      .status(500)
      .json({ message: "Failed to register staff", error: err.message });
  }
};
