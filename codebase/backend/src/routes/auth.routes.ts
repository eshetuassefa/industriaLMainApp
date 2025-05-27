import express from 'express';
import { login } from '../controllers/auth.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: superadmin@example.com
 *               password:
 *                 type: string
 *                 example: supersecure123
 *     responses:
 *       200:
 *         description: JWT token
 */
router.post('/login', login);

export default router;
