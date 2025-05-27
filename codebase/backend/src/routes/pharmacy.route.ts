import { Router } from "express";
import {
  addDrug,
  updateDrug,
  addInventory,
  fetchDrugs,
  deleteDrug,
  createPrescription,
  confirmDrugDelivery,
  getPrescription,
} from "../controllers/pharmacy.controller";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Pharmacy
 *   description: Drug inventory and prescription management
 */

/**
 * @swagger
 * /api/pharmacy/add-drug:
 *   post:
 *     summary: Add a new drug to the inventory
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
 *               name:
 *                 type: string
 *               genericName:
 *                 type: string
 *               dosageForm:
 *                 type: string
 *               strength:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               reorderLevel:
 *                 type: number
 *             required:
 *               - name
 *               - genericName
 *               - dosageForm
 *               - strength
 *               - manufacturer
 *     responses:
 *       201:
 *         description: Drug added successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post(
  "/add-drug",
  authenticateToken,
  authorizeRoles("PHARMACIST", "ADMIN"),
  addDrug
);

/**
 * @swagger
 * /api/pharmacy/update-drug/{id}:
 *   put:
 *     summary: Update an existing drug
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Drug ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               genericName:
 *                 type: string
 *               dosageForm:
 *                 type: string
 *               strength:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               reorderLevel:
 *                 type: number
 *     responses:
 *       200:
 *         description: Drug updated successfully
 *       404:
 *         description: Drug not found
 *       500:
 *         description: Server error
 */
router.put(
  "/update-drug/:id",
  authenticateToken,
  authorizeRoles("PHARMACIST", "ADMIN"),
  updateDrug
);

/**
 * @swagger
 * /api/pharmacy/add-inventory:
 *   post:
 *     summary: Add inventory for a drug
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
 *               drugId:
 *                 type: string
 *               batchNumber:
 *                 type: string
 *               quantity:
 *                 type: number
 *               expirationDate:
 *                 type: string
 *                 format: date
 *             required:
 *               - drugId
 *               - batchNumber
 *               - quantity
 *               - expirationDate
 *     responses:
 *       201:
 *         description: Inventory added successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post(
  "/add-inventory",
  authenticateToken,
  authorizeRoles("PHARMACIST", "ADMIN"),
  addInventory
);

/**
 * @swagger
 * /api/pharmacy/drugs:
 *   get:
 *     summary: Get all drugs
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of drugs retrieved successfully
 *       500:
 *         description: Server error
 */
router.get(
  "/drugs",
  authenticateToken,
  authorizeRoles("PHARMACIST", "ADMIN", "DOCTOR"),
  fetchDrugs
);

/**
 * @swagger
 * /api/pharmacy/drugs/{id}:
 *   delete:
 *     summary: Delete a drug
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Drug ID
 *     responses:
 *       200:
 *         description: Drug deleted successfully
 *       404:
 *         description: Drug not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/drugs/:id",
  authenticateToken,
  authorizeRoles("PHARMACIST", "ADMIN"),
  deleteDrug
);

/**
 * @swagger
 * /api/pharmacy/prescriptions:
 *   post:
 *     summary: Create a new prescription
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
 *               medicalRecordId:
 *                 type: string
 *               drugName:
 *                 type: string
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *               duration:
 *                 type: string
 *               instructions:
 *                 type: string
 *               quantity:
 *                 type: number
 *             required:
 *               - medicalRecordId
 *               - drugName
 *               - dosage
 *               - frequency
 *               - duration
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post(
  "/prescriptions",
  authenticateToken,
  authorizeRoles("DOCTOR"),
  createPrescription
);

/**
 * @swagger
 * /api/pharmacy/prescriptions/{id}/deliver:
 *   post:
 *     summary: Confirm drug delivery for a prescription
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Drug delivery confirmed successfully
 *       404:
 *         description: Prescription not found
 *       500:
 *         description: Server error
 */
router.post(
  "/prescriptions/:id/deliver",
  authenticateToken,
  authorizeRoles("PHARMACIST"),
  confirmDrugDelivery
);

/**
 * @swagger
 * /api/pharmacy/prescriptions/{id}:
 *   get:
 *     summary: Get prescription details
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Prescription details retrieved successfully
 *       404:
 *         description: Prescription not found
 *       500:
 *         description: Server error
 */
router.get(
  "/prescriptions/:id",
  authenticateToken,
  authorizeRoles("DOCTOR", "PHARMACIST"),
  getPrescription
);

export default router; 