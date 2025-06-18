import { Router } from "express";
import {
  createTestRequest,
  startTestRequest,
  submitTestResult,
  getTestResult,
  getAllTestRequests,
  getTestRequestById,
} from "../controllers/labResult.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Lab Results
 *   description: Laboratory test management and results
 */

/**
 * @swagger
 * /api/lab-results/create-request:
 *   post:
 *     summary: Healthcare provider creates a new lab test request
 *     tags: [Lab Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *               testTypeId:
 *                 type: string
 *               hospitalId:
 *                 type: string
 *               notes:
 *                 type: string
 *             required:
 *               - patientId
 *               - testTypeId
 *               - hospitalId
 *     responses:
 *       201:
 *         description: Test request created successfully
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
 *                     patientId:
 *                       type: string
 *                     testTypeId:
 *                       type: string
 *                     hospitalId:
 *                       type: string
 *                     doctorId:
 *                       type: string
 *                     notes:
 *                       type: string
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     testType:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                     hospital:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         address:
 *                           type: string
 *       400:
 *         description: Bad request
 *       404:
 *         description: Related entity not found
 *       500:
 *         description: Server error
 */
router.post("/create-request", createTestRequest);

/**
 * @swagger
 * /api/lab-results/start-request/{requestId}:
 *   post:
 *     summary: Lab technician starts processing a test request
 *     tags: [Lab Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the test request to start
 *     responses:
 *       200:
 *         description: Test request started successfully
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
 *                     patientId:
 *                       type: string
 *                     testTypeId:
 *                       type: string
 *                     hospitalId:
 *                       type: string
 *                     doctorId:
 *                       type: string
 *                     notes:
 *                       type: string
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     approvedAt:
 *                       type: string
 *                       format: date-time
 *                     patient:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         person:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             firstName:
 *                               type: string
 *                             lastName:
 *                               type: string
 *                             email:
 *                               type: string
 *                     doctor:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         person:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             firstName:
 *                               type: string
 *                             lastName:
 *                               type: string
 *                             email:
 *                               type: string
 *       400:
 *         description: Invalid test request status
 *       404:
 *         description: Test request not found
 *       500:
 *         description: Server error
 */
router.post("/start-request/:requestId", startTestRequest);

/**
 * @swagger
 * /api/lab-results/submit-result/{requestId}:
 *   post:
 *     summary: Lab technician submits test result
 *     tags: [Lab Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the test request to submit results for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               values:
 *                 type: object
 *                 description: JSON object containing test result values
 *               reportText:
 *                 type: string
 *                 description: Detailed text report of the test
 *               notes:
 *                 type: string
 *                 description: Additional notes about the test
 *             required:
 *               - values
 *     responses:
 *       200:
 *         description: Test result submitted successfully
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
 *                     requestId:
 *                       type: string
 *                     technicianId:
 *                       type: string
 *                     values:
 *                       type: object
 *                       description: JSON object containing test result values
 *                     status:
 *                       type: string
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                     request:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         patientId:
 *                           type: string
 *                         testTypeId:
 *                           type: string
 *                         hospitalId:
 *                           type: string
 *                         doctorId:
 *                           type: string
 *                         notes:
 *                           type: string
 *                         status:
 *                           type: string
 *                         patient:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             person:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 firstName:
 *                                   type: string
 *                                 lastName:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                         doctor:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             person:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 firstName:
 *                                   type: string
 *                                 lastName:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                     technician:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         person:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             firstName:
 *                               type: string
 *                             lastName:
 *                               type: string
 *                             email:
 *                               type: string
 *       400:
 *         description: Invalid input or test request status
 *       404:
 *         description: Test request not found
 *       500:
 *         description: Server error
 */
router.post("/submit-result/:requestId", submitTestResult);

/**
 * @swagger
 * /api/lab-results/get-result/{requestId}:
 *   get:
 *     summary: Healthcare provider or lab technician views test result
 *     tags: [Lab Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the test request
 *     responses:
 *       200:
 *         description: Test result retrieved successfully
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
 *                     requestId:
 *                       type: string
 *                     technicianId:
 *                       type: string
 *                     values:
 *                       type: object
 *                       description: JSON object containing test result values
 *                     status:
 *                       type: string
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                     technician:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         person:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             firstName:
 *                               type: string
 *                             lastName:
 *                               type: string
 *                             email:
 *                               type: string
 *                     request:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         patientId:
 *                           type: string
 *                         testTypeId:
 *                           type: string
 *                         hospitalId:
 *                           type: string
 *                         doctorId:
 *                           type: string
 *                         notes:
 *                           type: string
 *                         status:
 *                           type: string
 *                         patient:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             person:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 firstName:
 *                                   type: string
 *                                 lastName:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                         doctor:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             person:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 firstName:
 *                                   type: string
 *                                 lastName:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                         testType:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             description:
 *                               type: string
 *       403:
 *         description: Access denied
 *       404:
 *         description: Test result not found
 *       500:
 *         description: Server error
 */
router.get("/get-result/:requestId", getTestResult);

/**
 * @swagger
 * /api/lab-results/get-all-requests:
 *   get:
 *     summary: Retrieve all test requests
 *     tags: [Lab Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All test requests retrieved successfully
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
 *                       patientId:
 *                         type: string
 *                       testTypeId:
 *                         type: string
 *                       hospitalId:
 *                         type: string
 *                       doctorId:
 *                         type: string
 *                       notes:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       patient:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           person:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                       doctor:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           person:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                       testType:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                       results:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             requestId:
 *                               type: string
 *                             technicianId:
 *                               type: string
 *                             values:
 *                               type: object
 *                             status:
 *                               type: string
 *                             completedAt:
 *                               type: string
 *                               format: date-time
 *                             technician:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 person:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: string
 *                                     firstName:
 *                                       type: string
 *                                     lastName:
 *                                       type: string
 *                                     email:
 *                                       type: string
 *       500:
 *         description: Server error
 */
router.get("/get-all-requests", getAllTestRequests);

/**
 * @swagger
 * /api/lab-results/get-request/{requestId}:
 *   get:
 *     summary: Retrieve a specific test request by ID
 *     tags: [Lab Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the test request to retrieve
 *     responses:
 *       200:
 *         description: Test request retrieved successfully
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
 *                     patientId:
 *                       type: string
 *                     testTypeId:
 *                       type: string
 *                     hospitalId:
 *                       type: string
 *                     doctorId:
 *                       type: string
 *                     notes:
 *                       type: string
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                     patient:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         person:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             firstName:
 *                               type: string
 *                             lastName:
 *                               type: string
 *                             email:
 *                               type: string
 *                     doctor:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         person:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             firstName:
 *                               type: string
 *                             lastName:
 *                               type: string
 *                             email:
 *                               type: string
 *                     testType:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           requestId:
 *                             type: string
 *                           technicianId:
 *                             type: string
 *                           values:
 *                             type: object
 *                           status:
 *                             type: string
 *                           completedAt:
 *                             type: string
 *                             format: date-time
 *                           technician:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               person:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   firstName:
 *                                     type: string
 *                                   lastName:
 *                                     type: string
 *                                   email:
 *                                     type: string
 *       404:
 *         description: Test request not found
 *       500:
 *         description: Server error
 */
router.get("/get-request/:requestId", getTestRequestById);

export default router;
