"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reception_controller_1 = require("../controllers/reception.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Reception
 *   description: Patient registration and management
 */
/**
 * @swagger
 * /api/reception/add-patient:
 *   post:
 *     summary: Add a new patient
 *     tags: [Reception]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - sex
 *               - dob
 *               - phoneNumber
 *               - address
 *               - emergencyContact
 *             properties:
 *               firstName:
 *                 type: string
 *               middleName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               sex:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               nationalId:
 *                 type: string
 *               birthCertificate:
 *                 type: string
 *               emergencyContact:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *     responses:
 *       201:
 *         description: Patient added successfully
 */
router.post('/add-patient', reception_controller_1.addPatient);
/**
 * @swagger
 * /api/reception/update-patient:
 *   put:
 *     summary: Update patient details
 *     tags: [Reception]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *               firstName:
 *                 type: string
 *               middleName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               sex:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               nationalId:
 *                 type: string
 *               birthCertificate:
 *                 type: string
 *               emergencyContact:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *     responses:
 *       200:
 *         description: Patient updated successfully
 */
router.put('/update-patient', ...reception_controller_1.updatePatient);
/**
 * @swagger
 * /api/reception/fetch-patients:
 *   get:
 *     summary: Fetch all patients or search by national ID or name
 *     tags: [Reception]
 *     parameters:
 *       - in: query
 *         name: nationalId
 *         schema:
 *           type: string
 *         description: National ID to search for
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Name (first, middle, or last) to search for
 *     responses:
 *       200:
 *         description: List of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   nationalId:
 *                     type: string
 *                   birthCertificate:
 *                     type: string
 *                   person:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                       middleName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       sex:
 *                         type: string
 *                       dob:
 *                         type: string
 *                         format: date
 *                       phoneNumber:
 *                         type: string
 *                       address:
 *                         type: string
 *                   emergencyContact:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       phone:
 *                         type: string
 */
router.get('/fetch-patients', ...reception_controller_1.fetchPatients);
exports.default = router;
