import { Request, Response } from "express";
import { PrismaClient, DeliveryStatus } from "@prisma/client";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// 1. Doctor prescribes a drug to a patient via medicalRecordId
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

      // Find medical record for patient (assume one record per patient; adjust as needed)
      const medicalRecord = await prisma.medicalRecord.findFirst({
        where: { patientId },
      });

      if (!medicalRecord) {
        return res
          .status(404)
          .json({ message: "Medical record not found for patient" });
      }

      // Create prescriptions for each drug linked to the medical record
      const createdPrescriptions = await Promise.all(
        drugs.map((drug: any) =>
          prisma.prescription.create({
            data: {
              medicalRecordId: medicalRecord.id,
              medicineName: drug.name,
              dosage: drug.dosage,
              frequency: drug.frequency,
              duration: drug.duration,
              instructions: drug.instructions || null,
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
      console.error(error);
      return res.status(500).json({ message: "Failed to create prescription" });
    }
  },
];
  
  

// 2. Pharmacist confirms drug delivery
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

// 3. Doctor or Admin fetches prescription details
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
          medicineName: prescription.medicineName,
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
  
  
