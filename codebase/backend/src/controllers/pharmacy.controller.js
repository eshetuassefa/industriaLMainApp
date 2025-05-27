"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrescription = exports.confirmDrugDelivery = exports.createPrescription = exports.deleteDrug = exports.fetchDrugs = exports.addInventory = exports.updateDrug = exports.addDrug = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middleware/auth.middleware");
const prisma = new client_1.PrismaClient();
// Validation Schemas
const drugSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    genericName: zod_1.z.string().optional(),
    dosageForm: zod_1.z.enum(['TABLET', 'CAPSULE', 'LIQUID', 'INJECTION', 'TOPICAL', 'SUPPOSITORY', 'POWDER', 'OTHER']),
    strength: zod_1.z.string(),
    manufacturer: zod_1.z.string().optional(),
    reorderLevel: zod_1.z.number().int().positive().optional(),
});
const inventorySchema = zod_1.z.object({
    drugId: zod_1.z.string().uuid(),
    batchNumber: zod_1.z.string().min(3),
    expirationDate: zod_1.z.string().datetime(),
    quantity: zod_1.z.number().int().positive(),
    supplier: zod_1.z.string().optional(),
    purchaseDate: zod_1.z.string().datetime().optional(),
    purchasePrice: zod_1.z.number().positive().optional(),
    sellingPrice: zod_1.z.number().positive().optional(),
});
const updateDrugSchema = drugSchema.partial().extend({
    id: zod_1.z.string().uuid(),
    status: zod_1.z.enum(['ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK']).optional(),
});
const searchDrugSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
// Drug Management Controllers
exports.addDrug = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)('SUPERADMIN'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validatedData = drugSchema.parse(req.body);
            const newDrug = yield prisma.drug.create({
                data: Object.assign(Object.assign({}, validatedData), { status: 'ACTIVE' }),
            });
            res.status(201).json({ message: 'Drug added successfully', drug: newDrug });
        }
        catch (error) {
            handleError(res, error, 'Failed to add drug');
        }
    })
];
exports.updateDrug = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)('PHARMACIST', 'ADMIN'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validatedData = updateDrugSchema.parse(req.body);
            const updatedDrug = yield prisma.drug.update({
                where: { id: validatedData.id },
                data: validatedData,
            });
            res.status(200).json({ message: 'Drug updated successfully', drug: updatedDrug });
        }
        catch (error) {
            handleError(res, error, 'Failed to update drug');
        }
    })
];
exports.addInventory = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)('PHARMACIST', 'ADMIN'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validatedData = inventorySchema.parse(req.body);
            const newInventory = yield prisma.drugInventory.create({
                data: Object.assign(Object.assign({}, validatedData), { expirationDate: new Date(validatedData.expirationDate), purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : undefined }),
            });
            res.status(201).json({ message: 'Inventory added successfully', inventory: newInventory });
        }
        catch (error) {
            handleError(res, error, 'Failed to add inventory');
        }
    })
];
exports.fetchDrugs = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)('SUPERADMIN'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validatedData = searchDrugSchema.parse(req.query);
            const query = {
                include: { inventory: true },
                where: {},
            };
            if (validatedData.name) {
                query.where.name = { contains: validatedData.name, mode: 'insensitive' };
            }
            if (validatedData.status) {
                query.where.status = validatedData.status;
            }
            const drugs = yield prisma.drug.findMany(query);
            res.status(200).json(drugs);
        }
        catch (error) {
            handleError(res, error, 'Failed to fetch drugs');
        }
    })
];
exports.deleteDrug = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)('PHARMACIST', 'ADMIN'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = zod_1.z.object({ id: zod_1.z.string().uuid() }).parse(req.params);
            // Check for existing inventory
            const inventory = yield prisma.drugInventory.findFirst({
                where: { drugId: id, quantity: { gt: 0 } },
            });
            if (inventory) {
                return res.status(400).json({ message: 'Cannot delete drug with existing inventory' });
            }
            yield prisma.drug.delete({ where: { id } });
            res.status(200).json({ message: 'Drug deleted successfully' });
        }
        catch (error) {
            handleError(res, error, 'Failed to delete drug');
        }
    })
];
// Prescription Management Controllers
exports.createPrescription = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)("HEALTHCARE_PROVIDER"),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            const medicalRecord = yield prisma.medicalRecord.findFirst({
                where: { patientId },
            });
            if (!medicalRecord) {
                return res
                    .status(404)
                    .json({ message: "Medical record not found for patient" });
            }
            // Create prescriptions for each drug
            const createdPrescriptions = yield Promise.all(drugs.map((drug) => prisma.prescription.create({
                data: {
                    medicalRecordId: medicalRecord.id,
                    drugName: drug.name,
                    dosage: drug.dosage,
                    frequency: drug.frequency,
                    duration: drug.duration,
                    instructions: drug.instructions || null,
                    quantity: drug.quantity || 1,
                    deliveryStatus: client_1.DeliveryStatus.PENDING,
                    prescribedById: req.user.id
                },
            })));
            return res.status(201).json({
                message: "Prescriptions created successfully",
                data: createdPrescriptions,
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Failed to create prescription" });
        }
    }),
];
exports.confirmDrugDelivery = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)("PHARMACIST"),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { prescriptionId } = req.params;
            const prescription = yield prisma.prescription.findUnique({
                where: { id: prescriptionId },
            });
            if (!prescription)
                return res.status(404).json({ message: "Prescription not found" });
            if (prescription.deliveryStatus !== client_1.DeliveryStatus.PENDING)
                return res.status(400).json({
                    message: `Cannot confirm delivery for prescription with status '${prescription.deliveryStatus}'`,
                });
            const updated = yield prisma.prescription.update({
                where: { id: prescriptionId },
                data: {
                    deliveryStatus: client_1.DeliveryStatus.DELIVERED,
                    deliveredAt: new Date(),
                    deliveredById: req.user.id,
                },
            });
            return res.status(200).json({
                message: "Prescription marked as delivered",
                data: updated,
            });
        }
        catch (error) {
            console.error(error);
            return res
                .status(500)
                .json({ message: "Failed to confirm drug delivery" });
        }
    }),
];
exports.getPrescription = [
    auth_middleware_1.authenticateToken,
    (0, auth_middleware_1.authorizeRoles)("PHARMACIST"),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { prescriptionId } = req.params;
            const prescription = yield prisma.prescription.findUnique({
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
                    prescribedBy: ((_a = prescription.prescribedBy) === null || _a === void 0 ? void 0 : _a.person)
                        ? {
                            firstName: prescription.prescribedBy.person.firstName,
                            lastName: prescription.prescribedBy.person.lastName,
                        }
                        : null,
                    deliveredBy: ((_b = prescription.deliveredBy) === null || _b === void 0 ? void 0 : _b.person)
                        ? {
                            firstName: prescription.deliveredBy.person.firstName,
                            lastName: prescription.deliveredBy.person.lastName,
                        }
                        : null,
                },
            });
        }
        catch (error) {
            console.error(error);
            return res
                .status(500)
                .json({ message: "Failed to retrieve prescription" });
        }
    }),
];
// Utility function for error handling
function handleError(res, error, defaultMessage) {
    if (error instanceof zod_1.z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: defaultMessage });
}
