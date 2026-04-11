import axiosClient from "./axiosClient";
import { ApiResponse, Account } from "../types";

export const accountApi = {
  getById: async (userId: number): Promise<ApiResponse<Account>> => {
    const response = await axiosClient.get<ApiResponse<Account>>(
      `/account/${userId}`,
    );
    return response.data;
  },

  update: async (
    userId: number,
    formData: FormData,
  ): Promise<ApiResponse<Account>> => {
    const response = await axiosClient.put<ApiResponse<Account>>(
      `/account/${userId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  filter: async (params: any): Promise<ApiResponse<any>> => {
    const response = await axiosClient.get("/account/filter", { params });
    return response.data;
  },

  // --- THÊM MỚI CÁC HÀM DƯỚI ĐÂY ---
  getRoles: async (): Promise<ApiResponse<string[]>> => {
    const response = await axiosClient.get("/account/role");
    return response.data;
  },

  getGenders: async (): Promise<ApiResponse<string[]>> => {
    const response = await axiosClient.get("/account/gender");
    return response.data;
  },

  getStatuses: async (): Promise<ApiResponse<string[]>> => {
    const response = await axiosClient.get("/account/status");
    return response.data;
  },

  updateRole: async (id: number, role: string): Promise<ApiResponse<any>> => {
    const response = await axiosClient.put(`/account/role/${id}`, { role });
    return response.data;
  },

  updateStatus: async (
    id: number,
    status: string,
  ): Promise<ApiResponse<any>> => {
    const response = await axiosClient.put(`/account/status/${id}`, { status });
    return response.data;
  },

  register: async (formData: FormData): Promise<ApiResponse<any>> => {
    const response = await axiosClient.post("/register", formData);
    return response.data;
  },
};
