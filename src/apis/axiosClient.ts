import axios, { AxiosInstance, AxiosResponse } from "axios";
import navigationEmitter from "../lib/navigationEmitter";
import { STORAGE_KEYS } from '../constants';

const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Flag để tránh race condition khi nhiều requests fail cùng lúc
let isRefreshing = false;

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error.response?.status;

    // Xử lý 401 Unauthorized - chỉ chạy 1 lần duy nhất
    if (status === 401 && !isRefreshing) {
      isRefreshing = true;
      
      // Clear authentication data
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      
      // Navigate to login
      navigationEmitter.emit("/login");
      
      // Reset flag sau 1 giây để cho phép retry nếu cần
      setTimeout(() => {
        isRefreshing = false;
      }, 1000);
    }

    // Xử lý 403 Forbidden
    if (status === 403) {
      localStorage.clear();
      navigationEmitter.emit("/exception?code=403");
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
