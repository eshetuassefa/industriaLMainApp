import express from 'express';
import {
  addPatient,
  updatePatient,
  fetchPatients,
  forwardPatient
} from '../controllers/reception.controller';

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
router.post('/add-patient', addPatient);

/**
 * @swagger
 * /api/reception/update-patient/{patientId}:
 *   put:
 *     summary: Update patient details by ID
 *     tags: [Reception]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the patient to update
 *         example: "123e4567-e89b-12d3-a456-426614174000"
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
 *               emergencyContact:
 *                 type: object
 *                 required:
 *                   - name
 *                   - phone
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
router.put('/update-patient/:patientId', ...updatePatient);

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
router.get('/fetch-patients', ...fetchPatients);

/**
 * @swagger
 * /api/reception/forward-patient:
 *   post:
 *     tags: [Reception]
 *     summary: Forward a patient to a specific doctor
 *     description: Assigns a patient to a specific doctor for treatment
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
 *                 description: The ID of the patient to forward
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               doctorId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the doctor to forward the patient to
 *                 example: "123e4567-e89b-12d3-a456-426614174001"
 *               notes:
 *                 type: string
 *                 description: Optional notes about the forwarding
 *                 example: "Patient needs immediate attention"
 *     responses:
 *       200:
 *         description: Patient forwarded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Patient forwarded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     patientId:
 *                       type: string
 *                       format: uuid
 *                     doctorId:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       enum: [ACTIVE, INACTIVE, COMPLETED]
 *                     notes:
 *                       type: string
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request data"
 *       404:
 *         description: Patient or doctor not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Patient not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to forward patient"
 */
router.post('/forward-patient', forwardPatient);

export default router;