import express from "express";
import {
  registerStaffController,
  getAllStaffsController,
  getStaffByIdController,
  updateStaffController,
  deleteStaffController,
  getAllDepartmentsController,
  getAllDepartmentsNoFilterController,
  createDepartmentController,
  associateDepartmentsController,
} from "../controllers/admin.controller";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware";

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authenticateToken);

// Apply role-based authorization for specific routes
router.use("/staffs/register", authorizeRoles("ADMIN"));
router.use("/staff/update", authorizeRoles("ADMIN"));
router.use("/staff/delete", authorizeRoles("ADMIN"));
router.use("/departments/create", authorizeRoles("ADMIN"));
router.use("/departments/associate", authorizeRoles("ADMIN"));

// Routes accessible by both ADMIN and RECEPTIONIST
router.get(
  "/staffs/getall",
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  getAllStaffsController
);
router.get(
  "/staff/getsingle/:id",
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  getStaffByIdController
);
router.get(
  "/departments/getall",
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  getAllDepartmentsController
);
router.get(
  "/departments/getall-no-filter",
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  getAllDepartmentsNoFilterController
);

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
 * /api/admin/departments/create:
 *   post:
 *     summary: Create a new department
 *     description: Create a new department in the admin's hospital.
 *     tags: [Admin - Departments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the department
 *               code:
 *                 type: string
 *                 description: Unique code for the department
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Department created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     code:
 *                       type: string
 *       400:
 *         description: Invalid input or department already exists
 *       500:
 *         description: Internal Server Error
 */
router.post("/departments/create", createDepartmentController);

/**
 * @swagger
 * /api/admin/departments/associate:
 *   post:
 *     summary: Associate departments with hospital
 *     description: Associate all unassigned departments with the admin's hospital.
 *     tags: [Admin - Departments]
 *     responses:
 *       200:
 *         description: Departments associated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Departments associated with hospital successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *       400:
 *         description: Admin not associated with a hospital
 *       500:
 *         description: Internal Server Error
 */
router.post("/departments/associate", associateDepartmentsController);

export default router;
