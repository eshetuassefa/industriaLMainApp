import express from "express";
import { registerStaffController } from "../controller/admin.controller";
// import { isAdmin } from "../../middleware/auth";

const router = express.Router();

router.post("/register-staff", registerStaffController);

export default router;
