export interface ApiErrorBody {
  errorCode?: string;
  errorMessage?: string;
  message?: string;
  status?: number;
}

export interface ApiError {
  response?: {
    data?: ApiErrorBody;
    status?: number;
  };
  message?: string;
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "response" in error;
}

export function extractApiErrorBody(error: unknown): ApiErrorBody | null {
  if (isApiError(error) && error.response?.data) {
    return error.response.data;
  }
  return null;
}

export interface ChartTooltipContext {
  parsed: {
    y: number;
    x?: number;
  };
  label?: string;
  dataset?: {
    label?: string;
  };
}

export type ChartTickValue = number | string;

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
}
