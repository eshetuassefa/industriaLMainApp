import axios from "axios";
import FormData from "form-data"; // Ensure this is installed

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
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

const labTechnicianService = {
  async getAllTestRequests() {
    try {
      const client = createAxiosInstance();
      const response = await client.get("/lab-results/get-all-requests");
      return {
        success: true,
        data: response.data.data || [],
        message:
          response.data.message || "All test requests fetched successfully",
      };
    } catch (err) {
      console.error(
        "API Error:",
        err.response ? err.response.data : err.message
      );
      return handleApiError(err, "Failed to fetch all test requests");
    }
  },

  async getTestRequestById(requestId) {
    try {
      if (!requestId) {
        throw new Error("Request ID is required");
      }

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(requestId)) {
        throw new Error("Invalid request ID format");
      }

      const client = createAxiosInstance();
      const response = await client.get(
        `/lab-results/get-request/${requestId}`
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Test request fetched successfully",
      };
    } catch (err) {
      return handleApiError(err, "Failed to fetch test request");
    }
  },

  async startRequest(requestId) {
    try {
      if (!requestId) {
        throw new Error("Request ID is required");
      }

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(requestId)) {
        throw new Error("Invalid request ID format");
      }

      const client = createAxiosInstance();
      const response = await client.post(
        `/lab-results/start-request/${requestId}`
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Test request started successfully",
      };
    } catch (err) {
      return handleApiError(err, "Failed to start test request");
    }
  },

  async submitReport(requestId, reportData, images = []) {
    try {
      if (!requestId) {
        throw new Error("Request ID is required");
      }

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(requestId)) {
        throw new Error("Invalid request ID format");
      }

      if (!reportData || !reportData.values) {
        throw new Error("Test result values are required");
      }

      const client = createAxiosInstance();
      const response = await client.post(
        `/lab-results/submit-result/${requestId}`,
        reportData,
        {
          headers: { "Content-Type": "application/json" }, // Changed to JSON since no images
        }
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Test result submitted successfully",
      };
    } catch (err) {
      return handleApiError(err, "Failed to submit test result");
    }
  },

  async getReport(requestId) {
    try {
      if (!requestId) {
        throw new Error("Request ID is required");
      }

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(requestId)) {
        throw new Error("Invalid request ID format");
      }

      const client = createAxiosInstance();
      const response = await client.get(`/lab-results/get-result/${requestId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Test result fetched successfully",
      };
    } catch (err) {
      return handleApiError(err, "Failed to retrieve test result");
    }
  },
};

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

export default labTechnicianService;
