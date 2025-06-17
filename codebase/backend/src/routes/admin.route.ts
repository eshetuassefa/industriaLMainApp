import express from "express";
import {
  registerStaffController,
  getAllStaffsController,
  getStaffByIdController,
  updateStaffController,
  deleteStaffController,
  getAllDepartmentsController,
} from "../controllers/admin.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin - Staff
 *   description: Staff management by hospital administrators
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Person:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the person
 *         firstName:
 *           type: string
 *           description: First name of the person
 *         middleName:
 *           type: string
 *           description: Middle name of the person (optional)
 *         lastName:
 *           type: string
 *           description: Last name of the person
 *         sex:
 *           type: string
 *           enum: [Male, Female]
 *           description: Biological sex of the person
 *         dob:
 *           type: string
 *           format: date
 *           description: Date of birth
 *         phoneNumber:
 *           type: string
 *           description: Contact phone number
 *         address:
 *           type: string
 *           description: Residential address
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the user
 *         email:
 *           type: string
 *           description: Email address of the user
 *         username:
 *           type: string
 *           description: Generated username (e.g., role-emailPrefix)
 *         role:
 *           type: string
 *           enum: [RECEPTIONIST, SUPERADMIN, PHARMACIST, LAB_TECHNICIAN, RADIOLOGIST, HEALTHCARE_PROVIDER]
 *           description: Role of the staff member
 *         person:
 *           $ref: '#/components/schemas/Person'
 *           description: Associated person details
 *       required:
 *         - id
 *         - email
 *         - username
 *         - role
 *     StaffInput:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           description: First name of the staff
 *         middleName:
 *           type: string
 *           description: Middle name of the staff (optional)
 *         lastName:
 *           type: string
 *           description: Last name of the staff
 *         sex:
 *           type: string
 *           enum: [Male, Female]
 *           description: Biological sex
 *         dob:
 *           type: string
 *           format: date
 *           description: Date of birth
 *         phoneNumber:
 *           type: string
 *           description: Contact phone number
 *         address:
 *           type: string
 *           description: Residential address
 *         email:
 *           type: string
 *           description: Email address
 *         password:
 *           type: string
 *           description: Password for the staff account
 *         role:
 *           type: string
 *           enum: [RECEPTIONIST, SUPERADMIN, PHARMACIST, LAB_TECHNICIAN, RADIOLOGIST, HEALTHCARE_PROVIDER]
 *           description: Role of the staff member
 *       required:
 *         - firstName
 *         - lastName
 *         - sex
 *         - dob
 *         - email
 *         - password
 *         - role
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
 *             $ref: '#/components/schemas/StaffInput'
 *     responses:
 *       201:
 *         description: Staff registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff registered successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input, role, or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid role provided for staff registration
 *       500:
 *         description: Internal Server Error
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
 *         description: List of all staff members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal Server Error
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
 *         description: Staff member found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Staff member not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff not found
 *       500:
 *         description: Internal Server Error
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
 *             $ref: '#/components/schemas/StaffInput'
 *     responses:
 *       200:
 *         description: Staff member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input or role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid role for update
 *       404:
 *         description: Staff member not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal Server Error
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
 *         description: Staff member deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff deleted successfully
 *       404:
 *         description: Staff member not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff not found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/staff/delete/:id", deleteStaffController);

/**
 * @swagger
 * /api/admin/departments/getall:
 *   get:
 *     summary: Get all departments
 *     description: Fetch a list of all departments.
 *     tags: [Admin - Departments]
 *     responses:
 *       200:
 *         description: List of all departments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   code:
 *                     type: string
 *       500:
 *         description: Internal Server Error
 */
router.get("/departments/getall", getAllDepartmentsController);

export default router;
