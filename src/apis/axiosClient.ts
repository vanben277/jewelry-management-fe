import axios, { AxiosInstance, AxiosResponse } from "axios";

// Create axios instance with base configuration
const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT token to all requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Handle global errors
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      // Clear all auth data
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userId");
      localStorage.removeItem("auth"); // Remove old Basic Auth token

      // Redirect to login page
      window.location.href = "/login";
    }

    // Handle 403 Forbidden - Account banned/inactive
    if (error.response?.status === 403) {
      localStorage.clear();
      window.location.href = "/exception?code=403";
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
