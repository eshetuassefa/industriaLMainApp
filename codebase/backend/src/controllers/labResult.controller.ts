// Import the necessary modules from Express
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// Submit Test Result by Lab Technician
export const submitTestResult = [
    authenticateToken,
    authorizeRoles('LAB_TECHNICIAN'),
    async (req: Request, res: Response) => {
        try {
            const { requestId } = req.params;
            const { values } = req.body;

            const result = await prisma.testResult.create({
                data: {
                    requestId,
                    technicianId: req.user!.id, // Non-null assertion after middleware validation
                    values,
                    status: "COMPLETED",
                    completedAt: new Date(),
                },
            });

            await prisma.testRequest.update({
                where: { id: requestId },
                data: { status: "COMPLETED" },
            });

            res.status(200).json({ message: "Test result submitted", result });
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            } else {
                console.error(error);
                res.status(500).json({ message: "Failed to submit test result", error });
            }
        }
    }
];

// Get Test Result (for Healthcare Provider)
export const getTestResult = [
    authenticateToken,
    authorizeRoles('HEALTHCARE_PROVIDER'),
    async (req: Request, res: Response) => {
        try {
            const { requestId } = req.params;

            const result = await prisma.testResult.findFirst({
                where: { requestId },
                include: {
                    technician: { select: { id: true, person: true } },
                    request: {
                        include: {
                            patient: { include: { person: true } },
                            testType: true,
                        },
                    },
                },
            });

            if (!result) {
                res.status(404).json({ message: "Test result not found" });
                return;
            }

            res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            } else {
                console.error(error);
                res.status(500).json({ message: "Failed to retrieve test result", error });
            }
        }
    }
];