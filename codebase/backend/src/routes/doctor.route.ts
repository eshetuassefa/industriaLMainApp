import express from 'express';
import {
  getPatientRecords,
  addMedicalRecord,
  createAppointment,
  getDoctorAppointments,
  getAppointments,
  updateAppointment,
  deleteAppointment
} from '../controllers/doctor.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Doctor
 *   description: Endpoints for doctors to manage patient data and appointments
 */

/**
 * @swagger
 * /api/doctor/patients/{patientId}/records:
 *   get:
 *     summary: Get all medical records for a patient
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the patient
 *     responses:
 *       200:
 *         description: Medical records retrieved successfully
 *       404:
 *         description: Patient not found
 */
router.get('/patients/:patientId/records', getPatientRecords);

/**
 * @swagger
 * /api/doctor/medical-records:
 *   post:
 *     summary: Add a new medical record
 *     tags: [Doctor]
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
 *             properties:
 *               patientId:
 *                 type: string
 *               visitDate:
 *                 type: string
 *                 format: date-time
 *               diagnosis:
 *                 type: string
 *               chiefComplaint:
 *                 type: string
 *               bloodPressure:
 *                 type: string
 *               heartRate:
 *                 type: number
 *               temperature:
 *                 type: number
 *               physicalExamination:
 *                 type: string
 *               notes:
 *                 type: string
 *               labResults:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     testName:
 *                       type: string
 *                     testDate:
 *                       type: string
 *                       format: date-time
 *                     resultValue:
 *                       type: string
 *                     unit:
 *                       type: string
 *                     referenceRange:
 *                       type: string
 *               prescriptions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     drug:
 *                       type: string
 *                     dosage:
 *                       type: string
 *                     frequency:
 *                       type: string
 *                     duration:
 *                       type: string
 *                     instructions:
 *                       type: string
 *               radiologyReports:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     imagingType:
 *                       type: string
 *                     reportText:
 *                       type: string
 *                     bodyPart:
 *                       type: string
 *                     reportDate:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       201:
 *         description: Medical record added successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/medical-records', addMedicalRecord);

/**
 * @swagger
 * /api/doctor/appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Doctor]
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
 *               - date
 *               - time
 *             properties:
 *               patientId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 format: time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/appointments', createAppointment);

/**
 * @swagger
 * /api/doctor/appointments:
 *   get:
 *     summary: Get all appointments for the doctor
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 */
router.get('/appointments', getDoctorAppointments);

/**
 * @swagger
 * /api/doctor/appointments/{appointmentId}:
 *   get:
 *     summary: Get a specific appointment
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the appointment
 *     responses:
 *       200:
 *         description: Appointment retrieved successfully
 *       404:
 *         description: Appointment not found
 */
router.get('/appointments/:appointmentId', getAppointments);

/**
 * @swagger
 * /api/doctor/appointments/{appointmentId}:
 *   put:
 *     summary: Update an appointment
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the appointment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 format: time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       404:
 *         description: Appointment not found
 */
router.put('/appointments/:appointmentId', updateAppointment);

/**
 * @swagger
 * /api/doctor/appointments/{appointmentId}:
 *   delete:
 *     summary: Delete an appointment
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the appointment
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       404:
 *         description: Appointment not found
 */
router.delete('/appointments/:appointmentId', deleteAppointment);

export default router;