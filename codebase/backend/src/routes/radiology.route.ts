import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  createRadiologyReport,
  getAllRadiologyReports,
  getRadiologyReportById,
  updateRadiologyReport,
  deleteRadiologyReport
} from '../controllers/radiology.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads', 'radiology'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * @swagger
 * tags:
 *   name: Radiology
 *   description: Radiology report management endpoints
 */

/**
 * @swagger
 * /api/radiology:
 *   post:
 *     summary: Create a new radiology report with image
 *     tags: [Radiology]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - medicalRecordId
 *               - imagingType
 *               - image
 *             properties:
 *               medicalRecordId:
 *                 type: string
 *               imagingType:
 *                 type: string
 *               bodyPart:
 *                 type: string
 *               reportText:
 *                 type: string
 *               radiologistId:
 *                 type: string
 *               notes:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Radiology report created successfully
 *       400:
 *         description: Invalid input or no image uploaded
 */
router.post('/', authenticateToken, upload.single('image'), createRadiologyReport);

/**
 * @swagger
 * /api/radiology:
 *   get:
 *     summary: Get all radiology reports
 *     tags: [Radiology]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all radiology reports
 */
router.get('/', authenticateToken, getAllRadiologyReports);

/**
 * @swagger
 * /api/radiology/{id}:
 *   get:
 *     summary: Get a radiology report by ID
 *     tags: [Radiology]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Radiology report details
 *       404:
 *         description: Radiology report not found
 */
router.get('/:id', authenticateToken, getRadiologyReportById);

/**
 * @swagger
 * /api/radiology/{id}:
 *   put:
 *     summary: Update a radiology report
 *     tags: [Radiology]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagingType:
 *                 type: string
 *               bodyPart:
 *                 type: string
 *               reportText:
 *                 type: string
 *               notes:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Radiology report updated successfully
 *       404:
 *         description: Radiology report not found
 */
router.put('/:id', authenticateToken, upload.single('image'), updateRadiologyReport);

/**
 * @swagger
 * /api/radiology/{id}:
 *   delete:
 *     summary: Delete a radiology report
 *     tags: [Radiology]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Radiology report deleted successfully
 *       404:
 *         description: Radiology report not found
 */
router.delete('/:id', authenticateToken, deleteRadiologyReport);

export default router; 