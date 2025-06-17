// receptionist.service.js

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const TOKEN_KEY = "accessToken";

// Get JWT token from localStorage
const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

// Create Axios instance with auth headers
const createAxiosInstance = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

const receptionistService = {
  // Fetch all patients
  async fetchPatients(searchParams = {}) {
    try {
      const client = createAxiosInstance();
      const response = await client.get("/reception/fetch-patients", {
        params: searchParams,
      });
      return {
        success: true,
        data: response.data || [],
        message: "Patients fetched successfully",
      };
    } catch (err) {
      return handleApiError(err, "Failed to fetch patients");
    }
  },

  // Fetch a single patient by ID
  async fetchPatientById(patientId) {
    try {
      if (!patientId) {
        throw new Error("Patient ID is required");
      }

      const client = createAxiosInstance();
      const response = await client.get(`/reception/patient/${patientId}`);

      return {
        success: true,
        data: response.data,
        message: "Patient fetched successfully",
      };
    } catch (err) {
      return handleApiError(err, "Failed to fetch patient");
    }
  },

  // Add a new patient
  async addPatient(patientData) {
    try {
      // Validate required fields
      if (
        !patientData.firstName ||
        !patientData.lastName ||
        !patientData.nationalId ||
        !patientData.phoneNumber ||
        !patientData.sex ||
        !patientData.emergencyContact?.name ||
        !patientData.emergencyContact?.phone
      ) {
        throw new Error(
          "Required fields are missing: firstName, lastName, nationalId, phoneNumber, sex, and emergency contact details"
        );
      }

      // Transform the data to match backend expectations
      const transformedData = {
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        nationalId: patientData.nationalId,
        dob: patientData.dob || null,
        sex: patientData.sex,
        phoneNumber: patientData.phoneNumber,
        email: patientData.email || null,
        address: patientData.address || null,
        insurance: patientData.insurance || null,
        emergencyContact: {
          name: patientData.emergencyContact.name,
          phone: patientData.emergencyContact.phone,
          relationship: patientData.emergencyContact.relationship || null,
        },
      };

      const client = createAxiosInstance();
      const response = await client.post(
        "/reception/add-patient",
        transformedData
      );

      return {
        success: true,
        data: response.data.patient,
        message: response.data.message,
      };
    } catch (err) {
      return handleApiError(err, "Failed to add patient");
    }
  },

  // Update an existing patient
  async updatePatient(patientId, patientData) {
    try {
      if (!patientId) {
        throw new Error("Patient ID is required");
      }

      // Validate required fields
      if (
        !patientData.firstName ||
        !patientData.lastName ||
        !patientData.nationalId ||
        !patientData.phoneNumber ||
        !patientData.sex ||
        !patientData.emergencyContact?.name ||
        !patientData.emergencyContact?.phone
      ) {
        throw new Error("Required fields are missing");
      }

      const client = createAxiosInstance();
      const response = await client.put(
        `/reception/update-patient/${patientId}`,
        patientData
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (err) {
      return handleApiError(err, "Failed to update patient");
    }
  },

  // Search patients by query
  async searchPatients(query) {
    try {
      const client = createAxiosInstance();
      const response = await client.get("/reception/fetch-patients", {
        params: { name: query },
      });
      return {
        success: true,
        data: response.data || [],
        message: "Patients fetched successfully",
      };
    } catch (err) {
      return handleApiError(err, "Failed to search patients");
    }
  },

  // Forward patient to healthcare provider
  async forwardPatient(forwardData) {
    try {
      if (
        !forwardData.patientId ||
        !forwardData.providerId ||
        !forwardData.department ||
        !forwardData.reason
      ) {
        throw new Error("Missing required forward details");
      }

      const client = createAxiosInstance();
      const response = await client.post(
        "/reception/forward-patient",
        forwardData
      );

      return {
        success: true,
        data: response.data,
        message: "Patient forwarded successfully",
      };
    } catch (err) {
      return handleApiError(err, "Failed to forward patient");
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get("/reception/current-user");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error.response?.data?.message || "Failed to fetch user details",
          errors: error.response?.data?.errors || [],
        },
      };
    }
  },
};

// Error handler
const handleApiError = (err, defaultMessage) => {
  if (err.response) {
    const { status, data } = err.response;
    return {
      success: false,
      error: {
        message:
          data.message ||
          (status === 400
            ? "Bad request: Invalid input data"
            : status === 401
            ? "Unauthorized: Please log in"
            : status === 403
            ? "Forbidden: Insufficient permissions"
            : defaultMessage),
        errors: data.errors || [],
      },
    };
  }
  console.error("API Error:", err.message);
  return {
    success: false,
    error: { message: defaultMessage },
  };
};

export default receptionistService;
