import axios from "axios";

// Use Vite environment variable with fallback URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Create an Axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10-second timeout
  headers: {
    "Content-Type": "application/json",
    // Add Authorization header if needed: "Authorization": `Bearer ${token}`
  },
});

// Utility function to handle errors
const handleError = (error) => {
  let errorDetails = {
    message: "An error occurred",
    status: null,
    data: null,
  };

  if (error.response) {
    // Server responded with a status code outside 2xx
    errorDetails = {
      status: error.response.status,
      message: error.response.data.message || "Server error",
      data: error.response.data,
    };
  } else if (error.request) {
    // Request was made but no response received
    errorDetails.message =
      "No response from server. Check if the server is running.";
  } else {
    // Error setting up the request
    errorDetails.message = error.message || "Request setup error";
  }

  console.error("API Error:", errorDetails); // Log for debugging
  return errorDetails;
};

const adminService = {
  // Register new staff member
  async registerStaff(staffData) {
    try {
      const response = await axiosInstance.post(
        "/admin/staffs/register",
        staffData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  // Get all staff members
  async getAllStaff() {
    try {
      const response = await axiosInstance.get("/admin/staffs/getall");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  // Get staff by ID
  async getStaffById(id) {
    try {
      const response = await axiosInstance.get(`/admin/staff/getsingle/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  // Update staff member
  async updateStaff(id, updateData) {
    try {
      const response = await axiosInstance.put(
        `/admin/staff/update/${id}`,
        updateData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  // Delete staff member
  async deleteStaff(id) {
    try {
      const response = await axiosInstance.delete(`/admin/staff/delete/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  // Get all departments
  async getAllDepartments() {
    try {
      const response = await axiosInstance.get("/admin/departments/getall");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },
};

export default adminService;
