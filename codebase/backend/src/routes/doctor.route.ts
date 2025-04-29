import express from 'express';
import {
  getPatientRecords,
  addMedicalRecord,
  requestTest,
  prescribeMedicine,
  createAppointment,
  getDoctorAppointments,
  updateAppointment,
  deleteAppointment,
} from '../controllers/doctor.controller';

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
 *         description: Patient information and medical records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     patient:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         personId:
 *                           type: string
 *                           format: uuid
 *                         
 *                         person:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             firstName:
 *                               type: string
 *                             lastName:
 *                               type: string
 *                             dateOfBirth:
 *                               type: string
 *                               format: date
 *                             gender:
 *                               type: string
 *                             phoneNumber:
 *                               type: string
 *                           
 *                             address:
 *                               type: string
 *                     records:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           visitDate:
 *                             type: string
 *                             format: date-time
 *                           diagnosis:
 *                             type: string
 *                           notes:
 *                             type: string
 *                           doctor:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               person:
 *                                 type: object
 *                                 properties:
 *                                   firstName:
 *                                     type: string
 *                                   lastName:
 *                                     type: string
 *                           labResults:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 testName:
 *                                   type: string
 *                                 resultValue:
 *                                   type: string
 *                           prescriptions:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 medicineName:
 *                                   type: string
 *                                 dosage:
 *                                   type: string
 *                                 frequency:
 *                                   type: string
 *                                 duration:
 *                                   type: string
 *                                 instructions:
 *                                   type: string
 *       404:
 *         description: Patient not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/patient/:patientId/records', ...getPatientRecords);

/**
 * @swagger
 * /api/doctor/records:
 *   post:
 *     summary: Add new medical record
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
 *                 format: uuid
 *                 description: ID of the patient
 *               visitDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date of the visit (defaults to current date if not provided)
 *               diagnosis:
 *                 type: string
 *                 description: Medical diagnosis
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *               labResults:
 *                 type: array
 *                 description: List of lab test results
 *                 items:
 *                   type: object
 *                   required:
 *                     - testType
 *                     - result
 *                   properties:
 *                     testType:
 *                       type: string
 *                       example: Blood Test
 *                     result:
 *                       type: string
 *                       example: Normal
 *               prescriptions:
 *                 type: array
 *                 description: List of prescribed medications
 *                 items:
 *                   type: object
 *                   required:
 *                     - medication
 *                     - dosage
 *                   properties:
 *                     medication:
 *                       type: string
 *                       example: Ibuprofen
 *                     dosage:
 *                       type: string
 *                       example: 200mg
 *                     frequency:
 *                       type: string
 *                       example: Every 6 hours
 *                     duration:
 *                       type: string
 *                       example: 7 days
 *               radiologyReports:
 *                 type: array
 *                 description: List of radiology reports
 *                 items:
 *                   type: object
 *                   required:
 *                     - findings
 *                   properties:
 *                     findings:
 *                       type: string
 *                       example: No abnormalities detected
 *     responses:
 *       201:
 *         description: Medical record created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Medical record added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     visitDate:
 *                       type: string
 *                       format: date-time
 *                     diagnosis:
 *                       type: string
 *                     notes:
 *                       type: string
 *                     labResults:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           testType:
 *                             type: string
 *                           result:
 *                             type: string
 *                           testDate:
 *                             type: string
 *                             format: date-time
 *                     prescriptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           medication:
 *                             type: string
 *                           dosage:
 *                             type: string
 *                           frequency:
 *                             type: string
 *                           duration:
 *                             type: string
 *                           prescribedById:
 *                             type: string
 *                             format: uuid
 *                     radiologyReports:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           imagingType:
 *                             type: string
 *                           findings:
 *                             type: string
 *                           reportDate:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
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

/**
 * @swagger
 * /api/doctor/appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - date
 *               - duration
 *               - type
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 240
 *               type:
 *                 type: string
 *                 enum: [CONSULTATION, FOLLOW_UP, EMERGENCY, ROUTINE_CHECK]
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, CANCELLED, COMPLETED]
 *                 default: SCHEDULED
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     duration:
 *                       type: integer
 *                     type:
 *                       type: string
 *                     status:
 *                       type: string
 *                     patient:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         person:
 *                           type: object
 *                           properties:
 *                             firstName:
 *                               type: string
 *                             lastName:
 *                               type: string
 */
router.post('/appointments', ...createAppointment);

/**
 * @swagger
 * /api/doctor/appointments:
 *   get:
 *     summary: Get all appointments for the doctor
 *     tags: [Doctor]
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       duration:
 *                         type: integer
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       patient:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           person:
 *                             type: object
 *                             properties:
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 */
router.get('/appointments', ...getDoctorAppointments);

/**
 * @swagger
 * /api/doctor/appointments/{appointmentId}:
 *   put:
 *     summary: Update an appointment
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 240
 *               type:
 *                 type: string
 *                 enum: [CONSULTATION, FOLLOW_UP, EMERGENCY, ROUTINE_CHECK]
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, CANCELLED, COMPLETED]
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     duration:
 *                       type: integer
 *                     type:
 *                       type: string
 *                     status:
 *                       type: string
 */
router.put('/appointments/:appointmentId', ...updateAppointment);

/**
 * @swagger
 * /api/doctor/appointments/{appointmentId}:
 *   delete:
 *     summary: Delete an appointment
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete('/appointments/:appointmentId', ...deleteAppointment);

export default router;