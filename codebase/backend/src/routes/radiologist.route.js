"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const radiologist_controller_1 = require("../controllers/radiologist.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Radiology
 *   description: Radiology imaging and report management
 */
/**
 * @swagger
 * /api/radiology/create-request:
 *   post:
 *     summary: Healthcare provider creates a new radiology request
 *     tags: [Radiology]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medicalRecordId:
 *                 type: string
 *               imagingType:
 *                 type: string
 *               bodyPart:
 *                 type: string
 *               notes:
 *                 type: string
 *             required:
 *               - medicalRecordId
 *               - imagingType
 *     responses:
 *       201:
 *         description: Radiology request created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post("/create-request", radiologist_controller_1.createRadiologyRequest);
/**
 * @swagger
 * /api/radiology/start-request/{requestId}:
 *   post:
 *     summary: Radiologist starts processing a radiology request
 *     tags: [Radiology]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the radiology request to start
 *     responses:
 *       201:
 *         description: Radiology report started
 *       400:
 *         description: Invalid request status
 *       404:
 *         description: Radiology request not found
 *       500:
 *         description: Server error
 */
router.post("/start-request/:requestId", radiologist_controller_1.startRadiologyRequest);
/**
 * @swagger
 * /api/radiology/submit-report/{requestId}:
 *   post:
 *     summary: Radiologist submits the radiology report
 *     tags: [Radiology]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the radiology request to submit report for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reportText:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Radiology report submitted successfully
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.post("/submit-report/:requestId", radiologist_controller_1.submitRadiologyReport);
/**
 * @swagger
 * /api/radiology/view-report/{requestId}:
 *   get:
 *     summary: Healthcare provider or radiologist views the radiology report
 *     tags: [Radiology]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the radiology request
 *     responses:
 *       200:
 *         description: Radiology report retrieved successfully
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.get("/view-report/:requestId", radiologist_controller_1.getRadiologyReport);
exports.default = router;
