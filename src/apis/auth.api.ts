import axiosClient from "./axiosClient";
import { ApiResponse, LoginResponse, Account } from "../types";

export const authApi = {
  // Login
  login: async (
    userName: string,
    password: string,
  ): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosClient.post<ApiResponse<LoginResponse>>(
      "/login",
      {
        userName,
        password,
      },
    );
    return response.data;
  },

  // Register
  register: async (formData: FormData): Promise<ApiResponse<Account>> => {
    const response = await axiosClient.post<ApiResponse<Account>>(
      "/register",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (email: string): Promise<ApiResponse<string>> => {
    const response = await axiosClient.post<ApiResponse<string>>(
      "/forgot-password",
      { email },
    );
    return response.data;
  },

  // Change Password
  changePassword: async (
    oldPassword: string,
    newPassword: string,
  ): Promise<ApiResponse<string>> => {
    const response = await axiosClient.put<ApiResponse<string>>(
      "/account/change-password",
      {
        oldPassword,
        newPassword,
      },
    );
    return response.data;
  },

  // Reset Password
  resetPassword: async (data: {
    otpSku: string;
    newPassword: string;
  }): Promise<any> => {
    const response = await axiosClient.put("/reset-password", data);
    return response.data;
  },
};
