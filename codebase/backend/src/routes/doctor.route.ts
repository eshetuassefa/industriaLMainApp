import express from 'express';
import {
  getPatientRecords,
  addMedicalRecord,
  requestTest,
  prescribeMedicine,
} from '../controllers/doctor.validator';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Doctor
 *   description: Endpoints for doctors to manage patient data
 */


/**
 * @swagger
 * /api/doctor/patient/{patientId}/records:
 *   get:
 *     summary: View all medical records for a patient
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Patient UUID
 *     responses:
 *       200:
 *         description: Array of medical records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   visitDate:
 *                     type: string
 *                     format: date-time
 *                   diagnosis:
 *                     type: string
 *                   notes:
 *                     type: string
 *                   labResults:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         testName:
 *                           type: string
 *                         resultValue:
 *                           type: string
 *                   prescriptions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         medicineName:
 *                           type: string
 *                         dosage:
 *                           type: string
 */
router.get('/patient/:patientId/records', ...getPatientRecords);

/**
 * @swagger
 * /api/doctor/records:
 *   post:
 *     summary: Add new medical record
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               visitDate:
 *                 type: string
 *                 format: date-time
 *               diagnosis:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Medical record created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 visitDate:
 *                   type: string
 *                   format: date-time
 *                 diagnosis:
 *                   type: string
 *                 notes:
 *                   type: string
 */
router.post('/records', ...addMedicalRecord);

/**
 * @swagger
 * /api/doctor/test-requests:
 *   post:
 *     summary: Request a lab or radiology test
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - testTypeId
 *               - hospitalId
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               testTypeId:
 *                 type: string
 *                 format: uuid
 *               hospitalId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Test request created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   type: string
 *                   enum: [REQUESTED, IN_PROGRESS, COMPLETED, CANCELLED]
 *                 requestedAt:
 *                   type: string
 *                   format: date-time
 */
router.post('/test-requests', ...requestTest);

/**
 * @swagger
 * /api/doctor/prescriptions:
 *   post:
 *     summary: Prescribe medicine to a patient
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - medicineName
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               medicineName:
 *                 type: string
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *               duration:
 *                 type: string
 *               instructions:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prescription created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 medicineName:
 *                   type: string
 *                 dosage:
 *                   type: string
 *                 frequency:
 *                   type: string
 */
router.post('/prescriptions', ...prescribeMedicine);

export default router;