import { Router } from "express";
import {
  acceptTestRequest,
  submitTestResult,
  getTestResult,
} from "../controllers/labResult.controller";
import {
  authenticateToken,
  authorizeLabTechnician,
  // checkTestRequestOwnership
} from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/lab-results/accept-request/{requestId}:
 *   patch:
 *     summary: Lab technician accepts a test request
 *     tags: [Lab Results]
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         description: The ID of the test request to accept
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully accepted the test request
 *       403:
 *         description: Forbidden – only lab technicians allowed
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/accept-request/:requestId",
  authenticateToken,
  authorizeLabTechnician(),
  // checkTestRequestOwnership(req.params.requestId), // Optional ownership check
  acceptTestRequest
);

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
  authenticateToken,
  authorizeLabTechnician(),
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
router.get("/view-result/:requestId", authenticateToken, getTestResult);
/**
 * @swagger
 * /api/lab-results/accept-request/{requestId}:
 *   patch:
 *     summary: Lab technician accepts a test request
 *     tags: [Lab Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         description: The ID of the test request to accept
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully accepted the test request
 *       403:
 *         description: Forbidden – only lab technicians allowed
 *       401:
 *         description: Unauthorized – token missing or invalid
 */
router.patch("/accept-request/:requestId", authenticateToken, authorizeLabTechnician(), acceptTestRequest);

export default router;
