// Import necessary types from Express for typing request and response objects
import { Request, Response } from "express";
// Import the service functions that will handle the actual logic for CRUD operations
import {
  registerStaffService,
  getAllStaffsService,
  updateStaffService,
  deleteStaffService,
  getStaffByIdService,
} from "../service/admin.service";

// Controller to handle the registration of a new staff member
export const registerStaffController = async (req: Request, res: Response) => {
  try {
    // Extract the staff data sent in the request body
    const staffData = req.body;
    // Call the service function to register the staff and await the result
    const registeredUser = await registerStaffService(staffData);

    // Respond with a success message and the registered user data
    res.status(201).json({
      message: "Staff registered successfully",
      data: registeredUser,
    });
  } catch (err: any) {
    // In case of an error, log it and respond with a failure message
    console.error("RegisterStaffController Error:", err);
    res
      .status(500)
      .json({ message: "Failed to register staff", error: err.message });
  }
};

// Controller to handle fetching all staff members
export const getAllStaffsController = async (_req: Request, res: Response) => {
  try {
    // Call the service function to fetch all staff members
    const staffs = await getAllStaffsService();
    // Respond with the list of staff members
    res.status(200).json({ data: staffs });
  } catch (err: any) {
    // Handle errors by logging them and responding with a failure message
    res
      .status(500)
      .json({ message: "Failed to fetch staff list", error: err.message });
  }
};

// Controller to handle updating an existing staff member
export const updateStaffController = async (req: Request, res: Response) => {
  try {
    // Call the service function to update a staff member by ID and request body data
    const updatedStaff = await updateStaffService(req.params.id, req.body);
    // Respond with a success message and the updated staff data
    res.status(200).json({ message: "Staff updated", data: updatedStaff });
  } catch (err: any) {
    // Handle errors by responding with a failure message
    res
      .status(500)
      .json({ message: "Failed to update staff", error: err.message });
  }
};

// Controller to handle deleting a staff member
export const deleteStaffController = async (req: Request, res: Response) => {
  try {
    // Call the service function to delete a staff member by ID
    await deleteStaffService(req.params.id);
    // Respond with a success message once deletion is complete
    res.status(200).json({ message: "Staff deleted" });
  } catch (err: any) {
    // Handle errors by responding with a failure message
    res
      .status(500)
      .json({ message: "Failed to delete staff", error: err.message });
  }
};

// Controller to handle fetching a single staff member by ID
export const getStaffByIdController = async (req: Request, res: Response) => {
  const { id } = req.params; // Extract the staff ID from the URL parameters

  try {
    // Call the service function to fetch a staff member's data by their ID
    const staff = await getStaffByIdService(id);

    // Respond with the staff data if found
    res.status(200).json({
      message: "Staff retrieved successfully",
      data: staff,
    });
  } catch (err: any) {
    // Handle errors by logging them and responding with a failure message
    console.error("GetStaffByIdController Error:", err);
    res
      .status(500)
      .json({ message: "Failed to get staff", error: err.message });
  }
};
