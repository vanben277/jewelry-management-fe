import axiosClient from "./axiosClient";
import {
  ApiResponse,
  PageResponse,
  Product,
  ProductFilterParams,
} from "../types";

export const productApi = {
  // Get latest products
  getLatest: async (): Promise<ApiResponse<Product[]>> => {
    const response =
      await axiosClient.get<ApiResponse<Product[]>>("/product/latest");
    return response.data;
  },

  // Get top selling products
  getTopSelling: async (topN: number = 4): Promise<ApiResponse<Product[]>> => {
    const response = await axiosClient.get<ApiResponse<Product[]>>(
      "/product/top-selling",
      {
        params: { topN },
      },
    );
    return response.data;
  },

  // Get product by ID
  getById: async (id: number): Promise<ApiResponse<Product>> => {
    const response = await axiosClient.get<ApiResponse<Product>>(
      `/product/${id}`,
    );
    return response.data;
  },

  // Get products by category
  getByCategory: async (id: number, params: any): Promise<ApiResponse<any>> => {
    const response = await axiosClient.get(`/product/category/${id}`, {
      params,
    });
    return response.data;
  },

  // Search products
  search: async (
    name: string,
    pageNumber: number = 0,
    pageSize: number = 10,
  ): Promise<ApiResponse<{ content: Product[]; totalPages: number }>> => {
    const response = await axiosClient.get<
      ApiResponse<{ content: Product[]; totalPages: number }>
    >("/product/search", {
      params: { name, pageNumber, pageSize },
    });
    return response.data;
  },

  // Filter products (Admin)
  filter: async (
    params: ProductFilterParams,
  ): Promise<ApiResponse<PageResponse<Product>>> => {
    const response = await axiosClient.get<ApiResponse<PageResponse<Product>>>(
      "/product/filter",
      {
        params,
      },
    );
    return response.data;
  },

  // Get gold types
  getGoldTypes: async (): Promise<ApiResponse<string[]>> => {
    const response =
      await axiosClient.get<ApiResponse<string[]>>("/product/gold-type");
    return response.data;
  },

  // Get product statuses
  getStatuses: async (): Promise<ApiResponse<string[]>> => {
    const response =
      await axiosClient.get<ApiResponse<string[]>>("/product/status");
    return response.data;
  },

  // Create product
  create: async (formData: FormData): Promise<ApiResponse<Product>> => {
    const response = await axiosClient.post<ApiResponse<Product>>(
      "/product",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // Update product
  update: async (
    id: number,
    formData: FormData,
  ): Promise<ApiResponse<Product>> => {
    const response = await axiosClient.put<ApiResponse<Product>>(
      `/product/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // Update product status
  updateStatus: async (
    id: number,
    status: string,
  ): Promise<ApiResponse<Product>> => {
    const response = await axiosClient.put<ApiResponse<Product>>(
      `/product/status/${id}`,
      { status },
    );
    return response.data;
  },

  // Soft delete products
  softDelete: async (ids: number[]): Promise<ApiResponse<string>> => {
    const response = await axiosClient.delete("/product/soft-deleted", {
      data: ids,
    });
    return response.data;
  },

  // Restore deleted products
  restore: async (ids: number[]): Promise<ApiResponse<string>> => {
    const response = await axiosClient.put("/product/restore-deleted", ids);
    return response.data;
  },

  // Hard delete products
  hardDelete: async (ids: number[]): Promise<ApiResponse<string>> => {
    const response = await axiosClient.delete("/product/hard-delete", {
      data: ids,
    });
    return response.data;
  },
};
