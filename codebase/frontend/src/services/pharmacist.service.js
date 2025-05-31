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

const pharmacyService = {
  // Add a new drug
  async addDrug(drugData) {
    try {
      const client = createAxiosInstance();
      const response = await client.post("/pharmacy/add-drug", drugData);
      return {
        success: true,
        data: response.data.drug,
        message: response.data.message,
      };
    } catch (err) {
      return handleApiError(err, "Failed to add drug");
    }
  },

  // Update an existing drug
  async updateDrug(drugId, updateData) {
    try {
      const client = createAxiosInstance();
      const response = await client.put(`/pharmacy/drugs/${drugId}`, {
        ...updateData,
        id: drugId,
      });
      return {
        success: true,
        data: response.data.drug,
        message: response.data.message,
      };
    } catch (err) {
      return handleApiError(err, "Failed to update drug");
    }
  },

  // Add inventory
  async addInventory(inventoryData) {
    try {
      const client = createAxiosInstance();
      const response = await client.post("/pharmacy/inventory", inventoryData);
      return {
        success: true,
        data: response.data.inventory,
        message: response.data.message,
      };
    } catch (err) {
      return handleApiError(err, "Failed to add inventory");
    }
  },

  // Fetch all drugs
  async fetchDrugs(searchParams = {}) {
    try {
      const client = createAxiosInstance();
      const response = await client.get("/pharmacy/drugs", {
        params: searchParams,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      return handleApiError(err, "Failed to fetch drugs");
    }
  },

  // Delete a drug
  async deleteDrug(drugId) {
    try {
      const client = createAxiosInstance();
      const response = await client.delete(`/pharmacy/drugs/${drugId}`);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (err) {
      return handleApiError(err, "Failed to delete drug");
    }
  },

  // Create prescription
  async createPrescription(prescriptionData) {
    try {
      const client = createAxiosInstance();
      const response = await client.post("/pharmacy/prescriptions", prescriptionData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (err) {
      return handleApiError(err, "Failed to create prescription");
    }
  },

  // Confirm drug delivery
  async confirmDrugDelivery(prescriptionId) {
    try {
      if (!prescriptionId) {
        throw new Error("Prescription ID is required");
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(prescriptionId)) {
        throw new Error("Invalid prescription ID format");
      }

      const client = createAxiosInstance();
      console.log("Sending delivery confirmation request for prescription:", prescriptionId); // Debug log
      
      const response = await client.post(`/pharmacy/prescriptions/${prescriptionId}/deliver`);
      console.log("Delivery confirmation response:", response); // Debug log
      
      if (!response.data) {
        throw new Error("No response data received");
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Delivery confirmed successfully"
      };
    } catch (err) {
      console.error("Delivery confirmation error:", err);
      return {
        success: false,
        error: {
          message: err.response?.data?.message || err.message || "Failed to confirm drug delivery"
        }
      };
    }
  },

  // Get prescription details
  async getPrescription(prescriptionId) {
    try {
      if (!prescriptionId) {
        throw new Error("Prescription ID is required");
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(prescriptionId)) {
        throw new Error("Invalid prescription ID format");
      }

      const client = createAxiosInstance();
      const response = await client.get(`/pharmacy/prescriptions/${prescriptionId}`);
      
      if (!response.data) {
        throw new Error("No response data received");
      }

      // Check if the response has the expected structure
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to retrieve prescription");
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (err) {
      console.error("Error in getPrescription:", err);
      return {
        success: false,
        error: {
          message: err.response?.data?.message || err.message || "Failed to retrieve prescription"
        }
      };
    }
  },

  // Fetch all prescriptions
  async getPrescriptions() {
    try {
      const client = createAxiosInstance();
      const response = await client.get("/pharmacy/prescriptions");
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (err) {
      return handleApiError(err, "Failed to fetch prescriptions");
    }
  },

  // Fetch all patients
  async getPatients() {
    try {
      const client = createAxiosInstance();
      const response = await client.get("/pharmacy/patients");
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (err) {
      return handleApiError(err, "Failed to fetch patients");
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

export default pharmacyService;
