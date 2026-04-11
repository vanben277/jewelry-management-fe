import axiosClient from "./axiosClient";
import { ApiResponse, Category, CategoryFilterParams } from "../types";

export const categoryApi = {
  getTree: async (): Promise<ApiResponse<Category[]>> => {
    const response =
      await axiosClient.get<ApiResponse<Category[]>>("/category/tree");
    return response.data;
  },

  // Get all categories (name list)
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response =
      await axiosClient.get<ApiResponse<Category[]>>("/category/name");
    return response.data;
  },

  // Get non-parent categories
  getNonParent: async (): Promise<ApiResponse<Category[]>> => {
    const response = await axiosClient.get<ApiResponse<Category[]>>(
      "/category/name-not-parent",
    );
    return response.data;
  },

  // Filter categories (Admin)
  filter: async (
    params: CategoryFilterParams,
  ): Promise<
    ApiResponse<{
      content: Category[];
      totalPages: number;
      totalElements: number;
    }>
  > => {
    const response = await axiosClient.get<
      ApiResponse<{
        content: Category[];
        totalPages: number;
        totalElements: number;
      }>
    >("/category/filter", {
      params,
    });
    return response.data;
  },

  // Create category
  create: async (formData: FormData): Promise<ApiResponse<Category>> => {
    const response = await axiosClient.post<ApiResponse<Category>>(
      "/category",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // Update category
  update: async (
    id: number,
    formData: FormData,
  ): Promise<ApiResponse<Category>> => {
    const response = await axiosClient.put<ApiResponse<Category>>(
      `/category/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // Soft delete categories
  softDelete: async (ids: number[]): Promise<ApiResponse<string>> => {
    const response = await axiosClient.delete<ApiResponse<string>>(
      "/category/soft-delete",
      {
        data: ids,
      },
    );
    return response.data;
  },

  // Restore deleted categories
  restore: async (ids: number[]): Promise<ApiResponse<string>> => {
    const response = await axiosClient.put<ApiResponse<string>>(
      "/category/restore-delete",
      ids,
    );
    return response.data;
  },

  // Hard delete categories
  hardDelete: async (ids: number[]): Promise<ApiResponse<string>> => {
    const response = await axiosClient.delete<ApiResponse<string>>(
      "/category/hard-delete",
      {
        data: ids,
      },
    );
    return response.data;
  },
};
