"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const superadmin_controller_1 = require("../controllers/superadmin.controller");
// import { authenticateToken } from "../middleware/auth.middleware";
const router = express_1.default.Router();
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
router.post("/system-admins", superadmin_controller_1.createSystemAdmin);
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
router.get("/system-admins", superadmin_controller_1.getAllSystemAdmins);
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
router.put("/system-admins/:id", superadmin_controller_1.updateSystemAdmin);
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
router.delete("/system-admins/:id", superadmin_controller_1.deleteSystemAdmin);
/**
 * @swagger
 * /api/superadmin/hospitals:
 *   post:
 *     summary: Create a new hospital
 *     tags: [2. Superadmin]
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
 *       201:
 *         description: Hospital created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/hospitals", superadmin_controller_1.createHospital);
/**
 * @swagger
 * /api/superadmin/hospitals:
 *   get:
 *     summary: Get all hospitals
 *     tags: [2. Superadmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all hospitals with their regions and departments
 */
router.get("/hospitals", superadmin_controller_1.getAllHospitals);
/**
 * @swagger
 * /api/superadmin/hospitals/{id}:
 *   put:
 *     summary: Update a hospital
 *     tags: [2. Superadmin]
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
router.put("/hospitals/:id", superadmin_controller_1.updateHospital);
/**
 * @swagger
 * /api/superadmin/hospitals/{id}:
 *   delete:
 *     summary: Delete a hospital
 *     tags: [2. Superadmin]
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
router.delete("/hospitals/:id", superadmin_controller_1.deleteHospital);
exports.default = router;
