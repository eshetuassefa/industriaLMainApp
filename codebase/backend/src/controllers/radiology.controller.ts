import { Request, Response, NextFunction, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Create a new radiology report with image
export const createRadiologyReport: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { medicalRecordId, imagingType, bodyPart, reportText, radiologistId, notes } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      res.status(400).json({ message: 'No image file uploaded' });
      return;
    }

    // Create the radiology report with image path
    const radiologyReport = await prisma.radiologyReport.create({
      data: {
        medicalRecordId,
        imagingType,
        bodyPart,
        reportText,
        reportDate: new Date(),
        radiologistId,
        notes,
        imagePath: `/uploads/radiology/${imageFile.filename}`
      },
      include: {
        medicalRecord: true,
        radiologist: true
      }
    });

    res.status(201).json({
      message: 'Radiology report created successfully',
      radiologyReport
    });
  } catch (error) {
    next(error);
  }
};

// Get all radiology reports
export const getAllRadiologyReports: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reports = await prisma.radiologyReport.findMany({
      include: {
        medicalRecord: {
          include: {
            patient: {
              include: {
                person: true
              }
            }
          }
        },
        radiologist: {
          include: {
            person: true
          }
        }
      }
    });

    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
};

// Get radiology report by ID
export const getRadiologyReportById: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const report = await prisma.radiologyReport.findUnique({
      where: { id },
      include: {
        medicalRecord: {
          include: {
            patient: {
              include: {
                person: true
              }
            }
          }
        },
        radiologist: {
          include: {
            person: true
          }
        }
      }
    });

    if (!report) {
      res.status(404).json({ message: 'Radiology report not found' });
      return;
    }

    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};

// Update radiology report
export const updateRadiologyReport: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { imagingType, bodyPart, reportText, notes } = req.body;
    const imageFile = req.file;

    const existingReport = await prisma.radiologyReport.findUnique({
      where: { id }
    });

    if (!existingReport) {
      res.status(404).json({ message: 'Radiology report not found' });
      return;
    }

    // If new image is uploaded, delete old image and update path
    let imagePath = existingReport.imagePath;
    if (imageFile) {
      // Delete old image if exists
      if (existingReport.imagePath) {
        const oldImagePath = path.join(__dirname, '..', '..', existingReport.imagePath);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagePath = `/uploads/radiology/${imageFile.filename}`;
    }

    const updatedReport = await prisma.radiologyReport.update({
      where: { id },
      data: {
        imagingType,
        bodyPart,
        reportText,
        notes,
        imagePath
      },
      include: {
        medicalRecord: true,
        radiologist: true
      }
    });

    res.status(200).json({
      message: 'Radiology report updated successfully',
      radiologyReport: updatedReport
    });
  } catch (error) {
    next(error);
  }
};

// Delete radiology report
export const deleteRadiologyReport: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const report = await prisma.radiologyReport.findUnique({
      where: { id }
    });

    if (!report) {
      res.status(404).json({ message: 'Radiology report not found' });
      return;
    }

    // Delete image file if exists
    if (report.imagePath) {
      const imagePath = path.join(__dirname, '..', '..', report.imagePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.radiologyReport.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Radiology report deleted successfully' });
  } catch (error) {
    next(error);
  }
}; 