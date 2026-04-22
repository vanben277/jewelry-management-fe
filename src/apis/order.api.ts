import axiosClient from "./axiosClient";
import { ApiResponse, Order, CreateOrderRequest, OrderFilterParams } from "../types";

export const orderApi = {
  // Get user orders
  getMyOrders: async (
    accountId: number,
    status?: string,
    pageNumber: number = 0,
    pageSize: number = 20
  ): Promise<ApiResponse<any>> => {
    const params: any = { pageNumber, pageSize };
    if (status && status !== "all") params.status = status.toUpperCase();
    
    const response = await axiosClient.get(`/order/me/${accountId}`, { params });
    return response.data;
  },

  // Get order by ID
  getById: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await axiosClient.get<ApiResponse<Order>>(`/order/${id}`);
    return response.data;
  },

  // Get order statuses (Admin)
  getStatuses: async (): Promise<ApiResponse<string[]>> => {
    const response = await axiosClient.get<ApiResponse<string[]>>("/order/status");
    return response.data;
  },

  // Filter orders (Admin)
  filter: async (params: OrderFilterParams): Promise<ApiResponse<{ content: Order[]; totalPages: number; totalElements: number }>> => {
    const response = await axiosClient.get<ApiResponse<{ content: Order[]; totalPages: number; totalElements: number }>>("/order/filter", {
      params,
    });
    return response.data;
  },

  // Get monthly revenue (Admin)
  getMonthlyRevenue: async (): Promise<ApiResponse<any>> => {
    const response = await axiosClient.get<ApiResponse<any>>("/order/monthly-revenue");
    return response.data;
  },

  // Get monthly data (Admin)
  getMonthlyData: async (year: number, millions: boolean = true): Promise<ApiResponse<any>> => {
    const response = await axiosClient.get<ApiResponse<any>>("/order/monthly", {
      params: { year, millions },
    });
    return response.data;
  },

  // Create order
  create: async (orderData: CreateOrderRequest): Promise<ApiResponse<Order>> => {
    const response = await axiosClient.post<ApiResponse<Order>>("/order", orderData);
    return response.data;
  },

  // Update order status (Admin)
  updateStatus: async (orderId: number, status: string): Promise<ApiResponse<Order>> => {
    const response = await axiosClient.put<ApiResponse<Order>>(`/order/status/${orderId}`, { status });
    return response.data;
  },
};
