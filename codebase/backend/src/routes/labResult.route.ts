import { LabResult } from './../../node_modules/.prisma/client/index.d';
import { login } from './../controllers/auth.controller';
import { Router } from "express";
import {
  submitTestResult,
  getTestResult,
} from "../controllers/labResult.controller";

const router = Router();


/**
 * @swagger
 * /api/lab-results/submit-result/{requestId}:
 *   post:
 *     summary: Lab technician submits test result
 *     tags: [Lab Results]
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         description: The ID of the test request to submit results for
 *         schema:
 *           type: string
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
 *       403:
 *         description: Forbidden – only lab technicians allowed
 *       500:
 *         description: Internal server error
 */
router.post(
  "/submit-result/:requestId",
 
  // checkTestRequestOwnership(req.params.requestId), // Optional ownership check
  submitTestResult
);

/**
 * @swagger
 * /api/lab-results/view-result/{requestId}:
 *   get:
 *     summary: Healthcare provider views test result
 *     tags: [Lab Results]
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         description: The test request ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the test result
 *       403:
 *         description: Forbidden – only healthcare providers allowed
 *       404:
 *         description: Result not found
 */
router.get("/view-result/:requestId", getTestResult);

export default router;
