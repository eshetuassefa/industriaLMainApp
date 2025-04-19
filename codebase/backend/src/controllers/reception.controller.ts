import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

// Add a new patient
export const addPatient = async (req: Request, res: Response) => {
    try {
        const {
            firstName,
            middleName,
            lastName,
            sex,
            dob,
            phoneNumber,
            address,
            nationalId,
            birthCertificate,
            emergencyContact, 
        } = req.body;

        const newPatient = await prisma.patient.create({
            data: {
                nationalId,
                birthCertificate,
                person: {
                    create: {
                        firstName,
                        middleName,
                        lastName,
                        sex,
                        dob: new Date(dob),
                        phoneNumber,
                        address,
                    },
                },
                emergencyContact: {
                    create: {
                        name: emergencyContact.name,
                        phone: emergencyContact.phone,
                    },
                },
            },
            include: {
                person: true,
                emergencyContact: true,
            },
        });

        res.status(201).json({ message: 'Patient added successfully', patient: newPatient });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add patient', error });
    }
};

// Update patient details
export const updatePatient = async (req: Request, res: Response) => {
    try {
        const {
            id,
            firstName,
            middleName,
            lastName,
            sex,
            dob,
            phoneNumber,
            address,
            nationalId,
            birthCertificate,
            emergencyContact, // { name, phone }
        } = req.body;

        const updatedPatient = await prisma.patient.update({
            where: { id },
            data: {
                nationalId,
                birthCertificate,
                person: {
                    update: {
                        firstName,
                        middleName,
                        lastName,
                        sex,
                        dob: new Date(dob),
                        phoneNumber,
                        address,
                    },
                },
                emergencyContact: {
                    upsert: {
                        update: {
                            name: emergencyContact.name,
                            phone: emergencyContact.phone,
                        },
                        create: {
                            name: emergencyContact.name,
                            phone: emergencyContact.phone,
                        },
                    },
                },
            },
            include: {
                person: true,
                emergencyContact: true,
            },
        });

        res.status(200).json({ message: 'Patient updated successfully', patient: updatedPatient });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update patient', error });
    }
};

// Fetch all or searched patients
export const fetchPatients = async (req: Request, res: Response) => {
    try {
        const { nationalId, name } = req.query;

        const query: any = {
            include: {
                person: true,
                emergencyContact: true,
            },
            where: {},
        };

        if (nationalId) {
            query.where.nationalId = nationalId as string;
        }

        if (name) {
            const nameSearch = name as string;
            query.where = {
                ...query.where,
                person: {
                    OR: [
                        { firstName: { contains: nameSearch, mode: 'insensitive' } },
                        { middleName: { contains: nameSearch, mode: 'insensitive' } },
                        { lastName: { contains: nameSearch, mode: 'insensitive' } },
                    ],
                },
            };
        }

        const patients = await prisma.patient.findMany(query);

        res.status(200).json(patients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch patients', error });
    }
};

