// routes/staff.routes.ts

import express from "express";
import {
  registerStaffController,
  getAllStaffsController,
  getStaffByIdController,
  updateStaffController,
  deleteStaffController,
} from "../controllers/admin.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin - Staff
 *   description: Endpoints for managing staff members by Admin
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Person:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         firstName:
 *           type: string
 *         middleName:
 *           type: string
 *         lastName:
 *           type: string
 *         sex:
 *           type: string
 *         dob:
 *           type: string
 *           format: date
 *         phoneNumber:
 *           type: string
 *         address:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [ADMIN, SUPERADMIN, RECEPTIONIST, LAB_TECHNICIAN, RADIOLOGIST, PHARMACIST, HEALTHCARE_PROVIDER]
 */

/**
 * @swagger
 * /api/admin/staffs/register:
 *   post:
 *     summary: Register a new staff member
 *     description: Registers a new staff member with role validation (admin only).
 *     tags: [Admin - Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Person'
 *     responses:
 *       201:
 *         description: Staff registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff registered successfully.
 *                 data:
 *                   $ref: '#/components/schemas/Person'
 *       400:
 *         description: Invalid input or role.
 *       500:
 *         description: Internal Server Error.
 */
router.post("/staffs/register", registerStaffController);

/**
 * @swagger
 * /api/admin/staffs/getall:
 *   get:
 *     summary: Get all staff members
 *     description: Fetch a list of all staff members (admin only).
 *     tags: [Admin - Staff]
 *     responses:
 *       200:
 *         description: List of all staff members.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Person'
 *       500:
 *         description: Internal Server Error.
 */
router.get("/staffs/getall", getAllStaffsController);

/**
 * @swagger
 * /api/admin/staff/getsingle/{id}:
 *   get:
 *     summary: Get a staff member by ID
 *     description: Fetch a specific staff member's details by ID (admin only).
 *     tags: [Admin - Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Staff member ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff member found successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff retrieved successfully.
 *                 data:
 *                   $ref: '#/components/schemas/Person'
 *       404:
 *         description: Staff member not found.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/staff/getsingle/:id", getStaffByIdController);

/**
 * @swagger
 * /api/admin/staff/update/{id}:
 *   put:
 *     summary: Update staff member information
 *     description: Update an existing staff member's information (admin only).
 *     tags: [Admin - Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Staff member ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Person'
 *     responses:
 *       200:
 *         description: Staff member updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff updated successfully.
 *                 data:
 *                   $ref: '#/components/schemas/Person'
 *       404:
 *         description: Staff member not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put("/staff/update/:id", updateStaffController);

/**
 * @swagger
 * /api/admin/staff/delete/{id}:
 *   delete:
 *     summary: Delete a staff member
 *     description: Delete a staff member from the system (admin only).
 *     tags: [Admin - Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Staff member ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff member deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff deleted successfully.
 *       404:
 *         description: Staff member not found.
 *       500:
 *         description: Internal Server Error.
 */
router.delete("/staff/delete/:id", deleteStaffController);

export default router;
