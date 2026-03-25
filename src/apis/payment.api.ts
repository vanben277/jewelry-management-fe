import axiosClient from "./axiosClient";
import { ApiResponse, PaymentRequest, PaymentResponse } from "../types";

export const paymentApi = {
  // Create ZaloPay payment
  createZaloPay: async (paymentData: PaymentRequest): Promise<ApiResponse<PaymentResponse>> => {
    const response = await axiosClient.post<ApiResponse<PaymentResponse>>("/payment/zalopay/create", paymentData);
    return response.data;
  },
};
