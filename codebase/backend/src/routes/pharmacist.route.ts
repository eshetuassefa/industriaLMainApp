import { Router } from "express";
import {
  confirmDrugDelivery,
  getPrescription,
  createPrescription,
} from "../controllers/pharmacist.controller";

const router = Router();





/**
 * @swagger
 * /api/pharmacy/create-prescription:
 *   post:
 *     summary: Doctor creates a new prescription for a patient
 *     tags: [Pharmacy]
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
 *               hospitalId:
 *                 type: string
 *               notes:
 *                 type: string
 *               drugs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     dosage:
 *                       type: string
 *                     frequency:
 *                       type: string
 *                     duration:
 *                       type: string
 *             required:
 *               - patientId
 *               - hospitalId
 *               - drugs
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Patient or hospital not found
 *       500:
 *         description: Server error
 */
router.post("/create-prescription", createPrescription);



/**
 * @swagger
 * /api/pharmacy/confirm-delivery/{prescriptionId}:
 *   post:
 *     summary: Pharmacist confirms drug delivery to the patient
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: prescriptionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the prescription to confirm delivery
 *     responses:
 *       200:
 *         description: Prescription marked as delivered
 *       400:
 *         description: Invalid prescription status
 *       404:
 *         description: Prescription not found
 *       500:
 *         description: Server error
 */
router.post("/confirm-delivery/:prescriptionId", confirmDrugDelivery);

/**
 * @swagger
 * /api/pharmacy/view-prescription/{prescriptionId}:
 *   get:
 *     summary: Pharmacist views prescription details
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: prescriptionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the prescription
 *     responses:
 *       200:
 *         description: Prescription details retrieved
 *       404:
 *         description: Prescription not found
 *       500:
 *         description: Server error
 */
router.get("/view-prescription/:prescriptionId", getPrescription);
export default router;
