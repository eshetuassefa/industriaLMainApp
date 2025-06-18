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

const superadminService = {
  // Create a new hospital
  async createHospital(hospitalData) {
    try {
      const client = createAxiosInstance();
      const response = await client.post("/superadmin/hospitals", hospitalData);
      return {
        success: true,
        data: response.data.hospital,
        message: response.data.message,
      };
    } catch (err) {
      return handleApiError(err, "Failed to create hospital");
    }
  },

  // Get all hospitals
  async getAllHospitals() {
    try {
      const client = createAxiosInstance();
      const response = await client.get("/superadmin/hospitals");
      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      return handleApiError(err, "Failed to fetch hospitals");
    }
  },

  // Get all regions
  async getAllRegions() {
    try {
      const client = createAxiosInstance();
      const response = await client.get("/superadmin/regions");
      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      return handleApiError(err, "Failed to fetch regions");
    }
  },

  // Create a hospital admin
  async createHospitalAdmin(adminData) {
    try {
      const client = createAxiosInstance();
      const response = await client.post("/superadmin/hospital-admins", adminData);
      return {
        success: true,
        data: response.data.admin,
        message: response.data.message,
      };
    } catch (err) {
      return handleApiError(err, "Failed to create hospital admin");
    }
  },

  // Get all hospital admins
  async getAllHospitalAdmins() {
    try {
      const client = createAxiosInstance();
      const response = await client.get("/superadmin/system-admins");
      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      return handleApiError(err, "Failed to fetch hospital admins");
    }
  },

  // Update a hospital admin
  async updateHospitalAdmin(adminId, updateData) {
    try {
      const client = createAxiosInstance();
      const response = await client.put(`/superadmin/admins/${adminId}`, updateData);
      return {
        success: true,
        data: response.data.admin,
        message: response.data.message,
      };
    } catch (err) {
      return handleApiError(err, "Failed to update hospital admin");
    }
  },

  // Delete a hospital admin
  async deleteHospitalAdmin(adminId) {
    try {
      const client = createAxiosInstance();
      const response = await client.delete(`/superadmin/admins/${adminId}`);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (err) {
      return handleApiError(err, "Failed to delete hospital admin");
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

export default superadminService; 