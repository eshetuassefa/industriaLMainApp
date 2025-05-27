"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const labResult_controller_1 = require("../controllers/labResult.controller");
const router = (0, express_1.Router)();
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
 *       400:
 *         description: Bad request
 *       404:
 *         description: Related entity not found
 *       500:
 *         description: Server error
 */
router.post("/create-request", labResult_controller_1.createTestRequest);
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
 *       400:
 *         description: Invalid test request status
 *       404:
 *         description: Test request not found
 *       500:
 *         description: Server error
 */
router.post("/start-request/:requestId", labResult_controller_1.startTestRequest);
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
 *     responses:
 *       200:
 *         description: Test result submitted successfully
 *       400:
 *         description: Invalid input or test request status
 *       404:
 *         description: Test request not found
 *       500:
 *         description: Server error
 */
router.post("/submit-result/:requestId", labResult_controller_1.submitTestResult);
/**
 * @swagger
 * /api/lab-results/view-result/{requestId}:
 *   get:
 *     summary: Healthcare provider views test result
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
 *       403:
 *         description: Access denied
 *       404:
 *         description: Test result not found
 *       500:
 *         description: Server error
 */
router.get("/view-result/:requestId", labResult_controller_1.getTestResult);
exports.default = router;
