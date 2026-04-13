import axiosClient from "./axiosClient";
import { ApiResponse, ChatHistory, ChatSession } from "../types";

export const aiApi = {
  // Get chat sessions (Admin)
  getSessions: async (): Promise<ApiResponse<ChatSession[]>> => {
    const response = await axiosClient.get<ApiResponse<ChatSession[]>>(
      "/ai/admin/history/sessions",
    );
    return response.data;
  },

  // Get chat history
  getHistory: async (
    sessionId: string,
  ): Promise<ApiResponse<ChatHistory[]>> => {
    const response = await axiosClient.get<ApiResponse<ChatHistory[]>>(
      "/ai/history",
      {
        params: { sessionId },
      },
    );
    return response.data;
  },

  // AI Analytics (Admin)
  analytics: async (
    query: string,
    sessionId: string,
  ): Promise<ApiResponse<string>> => {
    const response = await axiosClient.post<ApiResponse<string>>(
      "/ai/admin/analytics",
      null,
      {
        params: { query, sessionId },
      },
    );
    return response.data;
  },

  // Chat with text
  chat: async (message: string, sessionId: string) => {
    const response = await axiosClient.post<ApiResponse<string>>(
      "/ai/chat",
      null,
      {
        params: { message, sessionId },
      },
    );
    return response.data;
  },
};
