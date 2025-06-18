import express from "express";
import {
  addPatient,
  updatePatient,
  fetchPatients,
  forwardPatient,
  getForwardedPatient,
} from "../controllers/reception.controller";

const router = express.Router();

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
 *     security:
 *       - bearerAuth: []
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
 *               bloodType:
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
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post("/add-patient", addPatient);

/**
 * @swagger
 * /api/reception/update-patient/{id}:
 *   put:
 *     summary: Update patient details by ID
 *     tags: [Reception]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the patient to update
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               middleName:
 *                 type: string
 *                 example: "Robert"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               sex:
 *                 type: string
 *                 enum: [MALE, FEMALE]
 *                 example: "MALE"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 example: "123 Main St, City"
 *               nationalId:
 *                 type: string
 *                 example: "ID123456"
 *               birthCertificate:
 *                 type: string
 *                 example: "BC789012"
 *               bloodType:
 *                 type: string
 *                 example: "O+"
 *               emergencyContact:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Jane Doe"
 *                   phone:
 *                     type: string
 *                     example: "+1987654321"
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Patient updated successfully"
 *                 patient:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     nationalId:
 *                       type: string
 *                       example: "ID123456"
 *                     person:
 *                       type: object
 *                       properties:
 *                         firstName:
 *                           type: string
 *                           example: "John"
 *                         lastName:
 *                           type: string
 *                           example: "Doe"
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.put("/update-patient/:id", updatePatient);

/**
 * @swagger
 * /api/reception/fetch-patients:
 *   get:
 *     summary: Fetch all patients or search by national ID or name
 *     tags: [Reception]
 *     security:
 *       - bearerAuth: []
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
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 */
router.get("/fetch-patients", fetchPatients);

/**
 * @swagger
 * /api/reception/forward-patient:
 *   post:
 *     summary: Forward a patient to a specific doctor
 *     tags: [Reception]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - doctorId
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               doctorId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient forwarded successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Patient or doctor not found
 *       500:
 *         description: Server error
 */
router.post("/forward-patient", forwardPatient);

/**
 * @swagger
 * /api/reception/forwarded-patient/{patientId}/{doctorId}:
 *   get:
 *     summary: Get forwarded patient details with medical history
 *     tags: [Reception]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the patient
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the doctor
 *     responses:
 *       200:
 *         description: Forwarded patient details retrieved successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: No active assignment found or patient not found
 *       500:
 *         description: Server error
 */
router.get("/forwarded-patient/:patientId/:doctorId", getForwardedPatient);

export default router;
