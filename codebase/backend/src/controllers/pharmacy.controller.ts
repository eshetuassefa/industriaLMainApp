import { PrismaClient, DeliveryStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Validation Schemas
const drugSchema = z.object({
  name: z.string().min(3),
  genericName: z.string().optional(),
  dosageForm: z.enum(['TABLET', 'CAPSULE', 'LIQUID', 'INJECTION', 'TOPICAL', 'SUPPOSITORY', 'POWDER', 'OTHER']),
  strength: z.string(),
  manufacturer: z.string().optional(),
  reorderLevel: z.number().int().positive().optional(),
});

const inventorySchema = z.object({
  drugId: z.string().uuid(),
  batchNumber: z.string().min(3),
  expirationDate: z.string().datetime(),
  quantity: z.number().int().positive(),
  supplier: z.string().optional(),
  purchaseDate: z.string().datetime().optional(),
  purchasePrice: z.number().positive().optional(),
  sellingPrice: z.number().positive().optional(),
});

const updateDrugSchema = drugSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK']).optional(),
});

const searchDrugSchema = z.object({
  name: z.string().optional(),
  status: z.string().optional(),
});

// Drug Management Controllers
export const addDrug = [
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  async (req: Request, res: Response) => {
    try {
      const validatedData = drugSchema.parse(req.body);
      const newDrug = await prisma.drug.create({
        data: {
          ...validatedData,
          status: 'ACTIVE', // Default status
        },
      });
      res.status(201).json({ message: 'Drug added successfully', drug: newDrug });
    } catch (error) {
      handleError(res, error, 'Failed to add drug');
    }
  }
];

export const updateDrug = [
  authenticateToken,
  authorizeRoles('PHARMACIST', 'ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const validatedData = updateDrugSchema.parse(req.body);
      const updatedDrug = await prisma.drug.update({
        where: { id: validatedData.id },
        data: validatedData,
      });
      res.status(200).json({ message: 'Drug updated successfully', drug: updatedDrug });
    } catch (error) {
      handleError(res, error, 'Failed to update drug');
    }
  }
];

export const addInventory = [
  authenticateToken,
  authorizeRoles('PHARMACIST', 'ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const validatedData = inventorySchema.parse(req.body);
      const newInventory = await prisma.drugInventory.create({
        data: {
          ...validatedData,
          expirationDate: new Date(validatedData.expirationDate),
          purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : undefined,
        },
      });
      res.status(201).json({ message: 'Inventory added successfully', inventory: newInventory });
    } catch (error) {
      handleError(res, error, 'Failed to add inventory');
    }
  }
];

export const fetchDrugs = [
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  async (req: Request, res: Response) => {
    try {
      const validatedData = searchDrugSchema.parse(req.query);
      const query: any = {
        include: { inventory: true },
        where: {},
      };

      if (validatedData.name) {
        query.where.name = { contains: validatedData.name, mode: 'insensitive' };
      }

      if (validatedData.status) {
        query.where.status = validatedData.status;
      }

      const drugs = await prisma.drug.findMany(query);
      res.status(200).json(drugs);
    } catch (error) {
      handleError(res, error, 'Failed to fetch drugs');
    }
  }
];

export const deleteDrug = [
  authenticateToken,
  authorizeRoles('PHARMACIST', 'ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      
      // Check for existing inventory
      const inventory = await prisma.drugInventory.findFirst({
        where: { drugId: id, quantity: { gt: 0 } },
      });

      if (inventory) {
        return res.status(400).json({ message: 'Cannot delete drug with existing inventory' });
      }

      await prisma.drug.delete({ where: { id } });
      res.status(200).json({ message: 'Drug deleted successfully' });
    } catch (error) {
      handleError(res, error, 'Failed to delete drug');
    }
  }
];

// Prescription Management Controllers
export const createPrescription = [
  authenticateToken,
  authorizeRoles("HEALTHCARE_PROVIDER"),
  async (req: Request, res: Response) => {
    try {
      const { patientId, hospitalId, notes, drugs } = req.body;

      if (!patientId) {
        return res.status(400).json({ message: "patientId is required" });
      }
      if (!hospitalId) {
        return res.status(400).json({ message: "hospitalId is required" });
      }
      if (!Array.isArray(drugs) || drugs.length === 0) {
        return res
          .status(400)
          .json({ message: "At least one drug is required" });
      }

      // Find medical record for patient
      const medicalRecord = await prisma.medicalRecord.findFirst({
        where: { patientId },
      });

      if (!medicalRecord) {
        return res
          .status(404)
          .json({ message: "Medical record not found for patient" });
      }

      // Create prescriptions for each drug
      const createdPrescriptions = await Promise.all(
        drugs.map((drug: any) =>
          prisma.prescription.create({
            data: {
              medicalRecordId: medicalRecord.id,
              drugName: drug.name,
              dosage: drug.dosage,
              frequency: drug.frequency,
              duration: drug.duration,
              instructions: drug.instructions || null,
              quantity: drug.quantity || 1,
              deliveryStatus: DeliveryStatus.PENDING,
              prescribedById: req.user!.id
            },
          })
        )
      );

      return res.status(201).json({
        message: "Prescriptions created successfully",
        data: createdPrescriptions,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to create prescription" });
    }
  },
];

export const confirmDrugDelivery = [
  authenticateToken,
  authorizeRoles("PHARMACIST"),
  async (req: Request, res: Response) => {
    try {
      const { prescriptionId } = req.params;

      const prescription = await prisma.prescription.findUnique({
        where: { id: prescriptionId },
      });

      if (!prescription)
        return res.status(404).json({ message: "Prescription not found" });

      if (prescription.deliveryStatus !== DeliveryStatus.PENDING)
        return res.status(400).json({
          message: `Cannot confirm delivery for prescription with status '${prescription.deliveryStatus}'`,
        });

      const updated = await prisma.prescription.update({
        where: { id: prescriptionId },
        data: {
          deliveryStatus: DeliveryStatus.DELIVERED,
          deliveredAt: new Date(),
          deliveredById: req.user!.id,
        },
      });

      return res.status(200).json({
        message: "Prescription marked as delivered",
        data: updated,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Failed to confirm drug delivery" });
    }
  },
];

export const getPrescription = [
  authenticateToken,
  authorizeRoles("PHARMACIST"),
  async (req: Request, res: Response) => {
    try {
      const { prescriptionId } = req.params;

      const prescription = await prisma.prescription.findUnique({
        where: { id: prescriptionId },
        include: {
          prescribedBy: { include: { person: true } },
          deliveredBy: { include: { person: true } },
        },
      });

      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }

      return res.status(200).json({
        message: "Prescription retrieved successfully",
        data: {
          id: prescription.id,
          drugName: prescription.drugName,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          duration: prescription.duration,
          instructions: prescription.instructions,
          deliveryStatus: prescription.deliveryStatus,
          deliveredAt: prescription.deliveredAt,
          prescribedBy: prescription.prescribedBy?.person
            ? {
                firstName: prescription.prescribedBy.person.firstName,
                lastName: prescription.prescribedBy.person.lastName,
              }
            : null,
          deliveredBy: prescription.deliveredBy?.person
            ? {
                firstName: prescription.deliveredBy.person.firstName,
                lastName: prescription.deliveredBy.person.lastName,
              }
            : null,
        },
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Failed to retrieve prescription" });
    }
  },
];

// Utility function for error handling
function handleError(res: Response, error: unknown, defaultMessage: string) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ message: 'Validation error', errors: error.errors });
  }
  
  if (error instanceof Error) {
    return res.status(400).json({ message: error.message });
  }

  console.error(error);
  res.status(500).json({ message: defaultMessage });
} 