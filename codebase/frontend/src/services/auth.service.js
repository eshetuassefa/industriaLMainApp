import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

class AuthService {
  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      console.log("Login response:", response.data);
      if (response.data.accessToken) {
        // Store tokens
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);

        // Store user info
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        // Store role-specific IDs
        if (response.data.user.role === "HEALTHCARE_PROVIDER") {
          localStorage.setItem("doctorId", response.data.user.id);
        }
      }

      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "An error occurred during login" }
      );
    }
  }

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("doctorId");
  }

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    return null;
  }

  getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  }

  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      const response = await axios.post(`${API_URL}/auth/refresh-token`, {
        refreshToken,
      });

      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
      }

      return response.data;
    } catch (error) {
      this.logout();
      throw error.response?.data || { message: "Failed to refresh token" };
    }
  }

  // Add axios interceptor for token refresh
  setupAxiosInterceptors() {
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            // Retry the original request with new token
            originalRequest.headers["Authorization"] =
              "Bearer " + this.getAccessToken();
            return axios(originalRequest);
          } catch (refreshError) {
            this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

export default new AuthService();
