import axios, { AxiosInstance, AxiosResponse } from "axios";
import navigationEmitter from "../lib/navigationEmitter";

const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userId");
      localStorage.removeItem("auth");
      navigationEmitter.emit("/login");
    }

    if (status === 403) {
      localStorage.clear();
      navigationEmitter.emit("/exception?code=403");
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
