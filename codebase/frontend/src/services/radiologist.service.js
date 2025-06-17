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

const radiologyService = {
  async getAllRadiologyRequests() {
    try {
      const client = createAxiosInstance();
      const response = await client.get("/radiology/all-requests");
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message || "All requests fetched successfully",
      };
    } catch (err) {
      console.error(
        "API Error:",
        err.response ? err.response.data : err.message
      );
      return handleApiError(err, "Failed to fetch all radiology requests");
    }
  },

  async getRadiologyRequestById(requestId) {
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
      const response = await client.get(`/radiology/request/${requestId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Request fetched successfully",
      };
    } catch (err) {
      return handleApiError(err, "Failed to fetch radiology request");
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
        `/radiology/start-request/${requestId}`
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Request started successfully",
      };
    } catch (err) {
      return handleApiError(err, "Failed to start radiology request");
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

      if (!reportData || !reportData.reportText) {
        throw new Error("Report text is required");
      }

      const client = createAxiosInstance();
      const formData = new FormData();
      formData.append("reportText", reportData.reportText);
      if (reportData.notes) formData.append("notes", reportData.notes);
      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await client.post(
        `/radiology/submit-report/${requestId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Report submitted successfully",
      };
    } catch (err) {
      return handleApiError(err, "Failed to submit radiology report");
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
      const response = await client.get(`/radiology/view-report/${requestId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Report fetched successfully",
      };
    } catch (err) {
      return handleApiError(err, "Failed to retrieve radiology report");
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

export default radiologyService;
