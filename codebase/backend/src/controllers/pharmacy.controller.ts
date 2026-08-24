import { PrismaClient, DeliveryStatus } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// Validation Schemas
const drugSchema = z.object({
  name: z.string().min(3),
  genericName: z.string().optional(),
  dosageForm: z.enum([
    "TABLET",
    "CAPSULE",
    "LIQUID",
    "INJECTION",
    "TOPICAL",
    "SUPPOSITORY",
    "POWDER",
    "OTHER",
  ]),
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
  status: z.enum(["ACTIVE", "DISCONTINUED", "OUT_OF_STOCK"]).optional(),
});

const searchDrugSchema = z.object({
  name: z.string().optional(),
  status: z.string().optional(),
});

const prescriptionIdSchema = z.object({
  id: z.string().uuid(),
});

// Drug Management Controllers
export const addDrug = [
  authenticateToken,
  authorizeRoles("PHARMACIST", "SUPERADMIN"),
  async (req: Request, res: Response) => {
    try {
      const validatedData = drugSchema.parse(req.body);
      const newDrug = await prisma.drug.create({
        data: {
          ...validatedData,
          status: "ACTIVE",
        },
      });
      res
        .status(201)
        .json({ message: "Drug added successfully", drug: newDrug });
    } catch (error) {
      handleError(res, error, "Failed to add drug");
    }
  },
];

export const updateDrug = [
  authenticateToken,
  authorizeRoles("PHARMACIST", "SUPERADMIN"),
  async (req: Request, res: Response) => {
    try {
      const validatedData = updateDrugSchema.parse(req.body);
      const updatedDrug = await prisma.drug.update({
        where: { id: validatedData.id },
        data: validatedData,
      });
      res
        .status(200)
        .json({ message: "Drug updated successfully", drug: updatedDrug });
    } catch (error) {
      handleError(res, error, "Failed to update drug");
    }
  },
];

export const addInventory = [
  authenticateToken,
  authorizeRoles("PHARMACIST", "SUPERADMIN"),
  async (req: Request, res: Response) => {
    try {
      const validatedData = inventorySchema.parse(req.body);
      const newInventory = await prisma.drugInventory.create({
        data: {
          ...validatedData,
          expirationDate: new Date(validatedData.expirationDate),
          purchaseDate: validatedData.purchaseDate
            ? new Date(validatedData.purchaseDate)
            : undefined,
        },
      });
      res.status(201).json({
        message: "Inventory added successfully",
        inventory: newInventory,
      });
    } catch (error) {
      handleError(res, error, "Failed to add inventory");
    }
  },
];

export const fetchDrugs = [
  authenticateToken,
  authorizeRoles("PHARMACIST", "SUPERADMIN"),
  async (req: Request, res: Response) => {
    try {
      const validatedData = searchDrugSchema.parse(req.query);
      const query: any = {
        include: { inventory: true },
        where: {},
      };

      if (validatedData.name) {
        query.where.name = {
          contains: validatedData.name,
          mode: "insensitive",
        };
      }

      if (validatedData.status) {
        query.where.status = validatedData.status;
      }

      const drugs = await prisma.drug.findMany(query);
      res.status(200).json(drugs);
    } catch (error) {
      handleError(res, error, "Failed to fetch drugs");
    }
  },
];

export const deleteDrug = [
  authenticateToken,
  authorizeRoles("PHARMACIST", "SUPERADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);

      const inventory = await prisma.drugInventory.findFirst({
        where: { drugId: id, quantity: { gt: 0 } },
      });

      if (inventory) {
        return res
          .status(400)
          .json({ message: "Cannot delete drug with existing inventory" });
      }

      await prisma.drug.delete({ where: { id } });
      res.status(200).json({ message: "Drug deleted successfully" });
    } catch (error) {
      handleError(res, error, "Failed to delete drug");
    }
  },
];

// Prescription Management Controllers
export const createPrescription = [
  authenticateToken,
  authorizeRoles("HEALTHCARE_PROVIDER"),
  async (req: Request, res: Response) => {
    try {
      const { patientId, notes, drugs } = req.body;

      if (!patientId)
        return res.status(400).json({ message: "patientId is required" });
      if (!Array.isArray(drugs) || drugs.length === 0)
        return res
          .status(400)
          .json({ message: "At least one drug is required" });

      const medicalRecord = await prisma.medicalRecord.findFirst({
        where: { patientId },
      });

      if (!medicalRecord) {
        return res
          .status(404)
          .json({ message: "Medical record not found for patient" });
      }

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
              prescribedById: req.user!.id,
            },
          })
        )
      );

      return res.status(201).json({
        message: "Prescriptions created successfully",
        data: createdPrescriptions,
      });
    } catch (error) {
      handleError(res, error, "Failed to create prescription");
    }
  },
];

export const confirmDrugDelivery = [
  authenticateToken,
  authorizeRoles("PHARMACIST", "HEALTHCARE_PROVIDER"),
  async (req: Request, res: Response) => {
    try {
      const { id: prescriptionId } = req.params;

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
        include: {
          deliveredBy: { include: { person: true } },
          prescribedBy: { include: { person: true } },
          medicalRecord: {
            include: { patient: { include: { person: true } } },
          },
        },
      });

      return res.status(200).json({
        message: "Prescription marked as delivered",
        data: {
          id: updated.id,
          drugName: updated.drugName,
          dosage: updated.dosage,
          frequency: updated.frequency,
          duration: updated.duration,
          instructions: updated.instructions,
          deliveryStatus: updated.deliveryStatus,
          deliveredAt: updated.deliveredAt,
          prescribedBy: updated.prescribedBy?.person
            ? {
                firstName: updated.prescribedBy.person.firstName,
                lastName: updated.prescribedBy.person.lastName,
              }
            : null,
          deliveredBy: updated.deliveredBy?.person
            ? {
                firstName: updated.deliveredBy.person.firstName,
                lastName: updated.deliveredBy.person.lastName,
              }
            : null,
          patient: updated.medicalRecord?.patient?.person
            ? {
                id: updated.medicalRecord.patient.id,
                name: `${updated.medicalRecord.patient.person.firstName} ${
                  updated.medicalRecord.patient.person.middleName
                    ? updated.medicalRecord.patient.person.middleName + " "
                    : ""
                }${updated.medicalRecord.patient.person.lastName}`,
              }
            : null,
        },
      });
    } catch (error) {
      handleError(res, error, "Failed to confirm drug delivery");
    }
  },
];

export const getPrescription = [
  authenticateToken,
  authorizeRoles("PHARMACIST"),
  async (req: Request, res: Response) => {
    try {
      // Validate the prescription ID
      const { id } = prescriptionIdSchema.parse(req.params);
      console.log("Fetching prescription with ID:", id); // Debug log

      const prescription = await prisma.prescription.findUnique({
        where: {
          id: id,
        },
        include: {
          prescribedBy: {
            include: {
              person: true,
            },
          },
          deliveredBy: {
            include: {
              person: true,
            },
          },
          medicalRecord: {
            include: {
              patient: {
                include: {
                  person: true,
                },
              },
            },
          },
        },
      });

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: "Prescription not found",
        });
      }

      return res.status(200).json({
        success: true,
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
          patient: prescription.medicalRecord?.patient?.person
            ? {
                id: prescription.medicalRecord.patient.id,
                name: `${prescription.medicalRecord.patient.person.firstName} ${
                  prescription.medicalRecord.patient.person.middleName
                    ? prescription.medicalRecord.patient.person.middleName + " "
                    : ""
                }${prescription.medicalRecord.patient.person.lastName}`,
              }
            : null,
        },
      });
    } catch (error: any) {
      console.error("Error fetching prescription:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid prescription ID format",
          error: error.errors,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve prescription",
        error: error.message || "Unknown error occurred",
      });
    }
  },
];

export const getPrescriptions = [
  authenticateToken,
  authorizeRoles("PHARMACIST"),
  async (req: Request, res: Response) => {
    try {
      const prescriptions = await prisma.prescription.findMany({
        include: {
          prescribedBy: { include: { person: true } },
          medicalRecord: {
            include: { patient: { include: { person: true } } },
          },
        },
      });

      return res.status(200).json({
        message: "Prescriptions retrieved successfully",
        data: prescriptions.map((p) => ({
          id: p.id,
          drugName: p.drugName,
          dosage: p.dosage,
          frequency: p.frequency,
          duration: p.duration,
          instructions: p.instructions,
          deliveryStatus: p.deliveryStatus,
          deliveredAt: p.deliveredAt,
          prescribedBy: p.prescribedBy?.person
            ? {
                firstName: p.prescribedBy.person.firstName,
                lastName: p.prescribedBy.person.lastName,
              }
            : null,
          patient: p.medicalRecord?.patient?.person
            ? {
                id: p.medicalRecord.patient.id,
                name: `${p.medicalRecord.patient.person.firstName} ${
                  p.medicalRecord.patient.person.middleName
                    ? p.medicalRecord.patient.person.middleName + " "
                    : ""
                }${p.medicalRecord.patient.person.lastName}`,
              }
            : null,
        })),
      });
    } catch (error) {
      handleError(res, error, "Failed to retrieve prescriptions");
    }
  },
];

export const getPatients = [
  authenticateToken,
  authorizeRoles("PHARMACIST"),
  async (req: Request, res: Response) => {
    try {
      const patients = await prisma.patient.findMany({
        include: { person: true },
      });

      return res.status(200).json({
        message: "Patients retrieved successfully",
        data: patients.map((p) => ({
          id: p.id,
          name: `${p.person.firstName} ${
            p.person.middleName ? p.person.middleName + " " : ""
          }${p.person.lastName}`,
        })),
      });
    } catch (error) {
      handleError(res, error, "Failed to retrieve patients");
    }
  },
];

export const getPrescriptionsByPatient = [
  authenticateToken,
  authorizeRoles("HEALTHCARE_PROVIDER", "PHARMACIST"),
  async (req: Request, res: Response) => {
    try {
      const { patientId } = req.params;
      if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required" });
      }
      // Find all medical records for this patient
      const medicalRecords = await prisma.medicalRecord.findMany({
        where: { patientId },
        select: { id: true },
      });
      const medicalRecordIds = medicalRecords.map((r) => r.id);
      // Find all prescriptions for these medical records
      const prescriptions = await prisma.prescription.findMany({
        where: { medicalRecordId: { in: medicalRecordIds } },
        include: {
          prescribedBy: { include: { person: true } },
        },
      });
      res.status(200).json({ data: prescriptions });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Failed to fetch prescriptions",
          error: error instanceof Error ? error.message : String(error),
        });
    }
  },
];

// Utility function for error handling
function handleError(res: Response, error: unknown, defaultMessage: string) {
  if (error instanceof z.ZodError) {
    return res
      .status(400)
      .json({ message: "Validation error", errors: error.errors });
  }

  if (error instanceof Error) {
    return res.status(400).json({ message: error.message });
  }

  console.error(error);
  res.status(500).json({ message: defaultMessage });
}
