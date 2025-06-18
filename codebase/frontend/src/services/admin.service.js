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

const adminService = {
  // Get all staff members
  getAllStaff: async () => {
    try {
      console.log("Fetching all staff members...");
      const client = createAxiosInstance();
      const response = await client.get("/admin/staffs/getall");
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching staff:", error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || "Failed to fetch staff",
          status: error.response?.status,
          data: error.response?.data,
        },
      };
    }
  },

  // Register new staff member
  registerStaff: async (staffData) => {
    try {
      const client = createAxiosInstance();
      const response = await client.post("/admin/staffs/register", staffData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error registering staff:", error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || "Failed to register staff",
          status: error.response?.status,
          data: error.response?.data,
        },
      };
    }
  },

  // Update staff member
  updateStaff: async (id, staffData) => {
    try {
      const client = createAxiosInstance();
      const response = await client.put(`/admin/staff/update/${id}`, staffData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error updating staff:", error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || "Failed to update staff",
          status: error.response?.status,
          data: error.response?.data,
        },
      };
    }
  },

  // Delete staff member
  deleteStaff: async (id) => {
    try {
      const client = createAxiosInstance();
      const response = await client.delete(`/admin/staff/delete/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting staff:", error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || "Failed to delete staff",
          status: error.response?.status,
          data: error.response?.data,
        },
      };
    }
  },

  // Get all departments
  getAllDepartments: async () => {
    try {
      const client = createAxiosInstance();
      const response = await client.get("/admin/departments/getall");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching departments:", error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || "Failed to fetch departments",
          status: error.response?.status,
          data: error.response?.data,
        },
      };
    }
  },

  // Create new department
  createDepartment: async (departmentData) => {
    try {
      const client = createAxiosInstance();
      const response = await client.post("/admin/departments/create", departmentData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error creating department:", error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || "Failed to create department",
          status: error.response?.status,
          data: error.response?.data,
        },
      };
    }
  },

  // Associate departments with hospital
  associateDepartments: async () => {
    try {
      const client = createAxiosInstance();
      const response = await client.post("/admin/departments/associate");
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error associating departments:", error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || "Failed to associate departments",
          status: error.response?.status,
          data: error.response?.data,
        },
      };
    }
  },
};

export default adminService;
