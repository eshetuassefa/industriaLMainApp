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
  getPrescriptions,
  getPatients,
} from "../controllers/pharmacy.controller";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware";

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
router.post("/add-drug", authenticateToken, authorizeRoles("PHARMACIST", "SUPERADMIN"), addDrug);

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
router.put("/drugs/:id", authenticateToken, authorizeRoles("PHARMACIST", "SUPERADMIN"), updateDrug);

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
router.post("/inventory", authenticateToken, authorizeRoles("PHARMACIST", "SUPERADMIN"), addInventory);

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
router.get("/drugs", authenticateToken, authorizeRoles("PHARMACIST", "SUPERADMIN"), fetchDrugs);

/**
 * @swagger
 * /api/pharmacy/prescriptions:
 *   post:
 *     summary: Create new prescriptions for a patient
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
 *                     instructions:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *             required:
 *               - patientId
 *               - hospitalId
 *               - drugs
 *     responses:
 *       201:
 *         description: Prescriptions created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post("/prescriptions", authenticateToken, authorizeRoles("HEALTHCARE_PROVIDER"), createPrescription);

/**
 * @swagger
 * /api/pharmacy/prescriptions:
 *   get:
 *     summary: Get all prescriptions
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of prescriptions retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/prescriptions", authenticateToken, authorizeRoles("PHARMACIST"), getPrescriptions);

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
router.get("/prescriptions/:id", authenticateToken, authorizeRoles("PHARMACIST"), getPrescription);

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
router.post("/prescriptions/:id/deliver", authenticateToken, authorizeRoles("PHARMACIST", "HEALTHCARE_PROVIDER"), confirmDrugDelivery);

/**
 * @swagger
 * /api/pharmacy/patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/patients", authenticateToken, authorizeRoles("PHARMACIST"), getPatients);

export default router;
