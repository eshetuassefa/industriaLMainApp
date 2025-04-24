import express from "express";
import {
  registerStaffController,
  getAllStaffsController,
  updateStaffController,
  deleteStaffController,
  getStaffByIdController,
} from "../controller/admin.controller";
// import { isAdmin } from "../../middleware/auth";

const router = express.Router();

// CREATE: Register a new staff
router.post("/register-staff", registerStaffController);

// READ: Get all staff
router.get("/staffs", getAllStaffsController);
//  READ: Get staff by ID
router.get("/staff/:id", getStaffByIdController);

// UPDATE: Update staff by ID
router.put("/staff/:id", updateStaffController);

// DELETE: Delete staff by ID
router.delete("/staff/:id", deleteStaffController);

export default router;
