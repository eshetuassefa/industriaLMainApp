import express from "express";
import {
  createSystemAdmin,
  getAllSystemAdmins,
  updateSystemAdmin,
  deleteSystemAdmin,
  createHospital,
  getAllHospitals,
  updateHospital,
  deleteHospital,
  getAllRegions,
} from "../controllers/superadmin.controller";
// import { authenticateToken } from "../middleware/auth.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Superadmin
 *   description: System administration and hospital management
 */

/**
 * @swagger
 * /api/superadmin/system-admins:
 *   post:
 *     summary: Create a new system admin
 *     tags: [Superadmin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: System admin created successfully
 *       400:
 *         description: Invalid input or admin already exists
 */
router.post("/system-admins", createSystemAdmin);

/**
 * @swagger
 * /api/superadmin/system-admins:
 *   get:
 *     summary: Get all system admins
 *     tags: [Superadmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all system admins
 */
router.get("/system-admins", getAllSystemAdmins);

/**
 * @swagger
 * /api/superadmin/system-admins/{id}:
 *   put:
 *     summary: Update a system admin
 *     tags: [Superadmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: System admin updated successfully
 *       404:
 *         description: System admin not found
 */
router.put("/system-admins/:id", updateSystemAdmin);

/**
 * @swagger
 * /api/superadmin/system-admins/{id}:
 *   delete:
 *     summary: Delete a system admin
 *     tags: [Superadmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: System admin deleted successfully
 *       404:
 *         description: System admin not found
 */
router.delete("/system-admins/:id", deleteSystemAdmin);

/**
 * @swagger
 * /api/superadmin/hospitals:
 *   post:
 *     summary: Create a new hospital
 *     tags: [Superadmin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - regionId
 *               - city
 *               - zone
 *               - woreda
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the hospital
 *               code:
 *                 type: string
 *                 description: Unique code for the hospital
 *               regionId:
 *                 type: integer
 *                 description: ID of the region where the hospital is located
 *               city:
 *                 type: string
 *                 description: City where the hospital is located
 *               zone:
 *                 type: string
 *                 description: Zone where the hospital is located
 *               woreda:
 *                 type: string
 *                 description: Woreda where the hospital is located
 *     responses:
 *       201:
 *         description: Hospital created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 hospital:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     code:
 *                       type: string
 *                     region:
 *                       type: object
 *                     city:
 *                       type: string
 *                     zone:
 *                       type: string
 *                     woreda:
 *                       type: string
 *       400:
 *         description: Invalid input or region does not exist
 */
router.post("/hospitals", createHospital);

/**
 * @swagger
 * /api/superadmin/hospitals:
 *   get:
 *     summary: Get all hospitals
 *     tags: [Superadmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all hospitals with their regions and departments
 */
router.get("/hospitals", getAllHospitals);

/**
 * @swagger
 * /api/superadmin/hospitals/{id}:
 *   put:
 *     summary: Update a hospital
 *     tags: [Superadmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               regionId:
 *                 type: integer
 *               city:
 *                 type: string
 *               zone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hospital updated successfully
 *       404:
 *         description: Hospital not found
 */
router.put("/hospitals/:id", updateHospital);

/**
 * @swagger
 * /api/superadmin/hospitals/{id}:
 *   delete:
 *     summary: Delete a hospital
 *     tags: [Superadmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hospital deleted successfully
 *       404:
 *         description: Hospital not found
 */
router.delete("/hospitals/:id", deleteHospital);

/**
 * @swagger
 * /api/superadmin/hospital-admins:
 *   post:
 *     summary: Create a new hospital admin
 *     tags: [Superadmin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *               - hospitalId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               hospitalId:
 *                 type: string
 *                 description: The ID of the hospital to assign the admin to
 *     responses:
 *       201:
 *         description: Hospital admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     person:
 *                       type: object
 *                     hospital:
 *                       type: object
 *       400:
 *         description: Invalid input or admin already exists
 */
router.post("/hospital-admins", createSystemAdmin);

/**
 * @swagger
 * /api/superadmin/regions:
 *   get:
 *     summary: Get all regions
 *     tags: [Superadmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all regions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 */
router.get("/regions", getAllRegions);

export default router;
