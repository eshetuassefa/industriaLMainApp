// Import the necessary modules from Express
import { Request, Response } from "express";
// Import the PrismaClient to interact with the database
import { PrismaClient } from "@prisma/client";

// Instantiate the PrismaClient to connect to the database
const prisma = new PrismaClient();

// 1. Accept Test Request by Lab Technician
// Define the acceptTestRequest function to handle incoming test request acceptance
export const acceptTestRequest = async (
  req: Request, // Express request object
  res: Response // Express response object
): Promise<void> => {
  // The function returns a Promise
  try {
    // Extract the requestId parameter from the URL
    const { requestId } = req.params;

    // Check if the user is authenticated and has the 'LAB_TECHNICIAN' role
    if (!req.user || req.user.role !== "LAB_TECHNICIAN") {
      // If not authorized, respond with a 403 Forbidden status
      res
        .status(403)
        .json({ message: "Only lab technicians can accept test requests" });
      return; // Exit the function
    }

    // Update the testRequest status to 'IN_PROGRESS', and record the technician's info
    const testRequest = await prisma.testRequest.update({
      where: { id: requestId }, // Find the test request by its ID
      data: {
        status: "IN_PROGRESS", // Change the status of the test request
        acceptedById: req.user.id, // Store the lab technician's ID who accepted the request
        acceptedAt: new Date(), // Store the current date and time when the request was accepted
      },
    });

    // Respond with a success message and the updated test request
    res.status(200).json({ message: "Test request accepted", testRequest });
  } catch (error) {
    // If any error occurs, respond with a 500 Internal Server Error status
    res.status(500).json({ message: "Failed to accept test request", error });
  }
};

//  Submit Test Result by Lab Technician
// Define the submitTestResult function to handle test result submissions
export const submitTestResult = async (
  req: Request, // Express request object
  res: Response // Express response object
): Promise<void> => {
  // The function returns a Promise
  try {
    // Extract the requestId from the URL and test result values from the request body
    const { requestId } = req.params;
    const { values } = req.body; // Test values provided in the request body

    // Check if the user is authenticated and has the 'LAB_TECHNICIAN' role
    if (!req.user || req.user.role !== "LAB_TECHNICIAN") {
      // If not authorized, respond with a 403 Forbidden status
      res
        .status(403)
        .json({ message: "Only lab technicians can submit results" });
      return; // Exit the function
    }

    // Create a new test result entry in the database
    const result = await prisma.testResult.create({
      data: {
        requestId, // Attach the requestId to the test result
        technicianId: req.user.id, // Associate the test result with the lab technician's ID
        values, // Store the test result values
        status: "COMPLETED", // Mark the test result as 'COMPLETED'
        completedAt: new Date(), // Store the current date and time when the result was completed
      },
    });

    // Update the status of the corresponding test request to 'COMPLETED'
    await prisma.testRequest.update({
      where: { id: requestId }, // Find the test request by its ID
      data: { status: "COMPLETED" }, // Change the status of the test request to 'COMPLETED'
    });

    // Respond with a success message and the created test result
    res.status(200).json({ message: "Test result submitted", result });
  } catch (error) {
    // If any error occurs, respond with a 500 Internal Server Error status
    res.status(500).json({ message: "Failed to submit test result", error });
  }
};

// 3. Get Test Result (for Healthcare Provider)
// Define the getTestResult function to allow healthcare providers to view test results
export const getTestResult = async (
  req: Request, // Express request object
  res: Response // Express response object
): Promise<void> => {
  // The function returns a Promise
  try {
    // Extract the requestId from the URL
    const { requestId } = req.params;

    // Check if the user is authenticated and has the 'HEALTHCARE_PROVIDER' role
    if (!req.user || req.user.role !== "HEALTHCARE_PROVIDER") {
      // If not authorized, respond with a 403 Forbidden status
      res
        .status(403)
        .json({ message: "Only healthcare providers can view test results" });
      return; // Exit the function
    }

    // Fetch the test result based on the requestId
    const result = await prisma.testResult.findFirst({
      where: { requestId }, // Find the test result by its requestId
      include: {
        technician: { select: { id: true, person: true } }, // Include technician's info (ID and person data)
        request: {
          include: {
            patient: { include: { person: true } }, // Include patient info (including personal details)
            testType: true, // Include the type of test requested
          },
        },
      },
    });

    // If no test result is found, respond with a 404 Not Found status
    if (!result) {
      res.status(404).json({ message: "Test result not found" });
      return;
    }

    // Respond with the found test result
    res.status(200).json(result);
  } catch (error) {
    // If any error occurs, respond with a 500 Internal Server Error status
    res.status(500).json({ message: "Failed to retrieve test result", error });
  }
};
