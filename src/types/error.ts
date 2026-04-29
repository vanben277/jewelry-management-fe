/**
 * API Error Response Structure
 */
export interface ApiErrorResponse {
  errorCode?: string;
  errorMessage?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * API Error Type
 */
export interface ApiError {
  response?: {
    status?: number;
    statusText?: string;
    data?: ApiErrorResponse;
  };
  message?: string;
  code?: string;
}

/**
 * Type guard to check if error is ApiError
 */
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('response' in error || 'message' in error)
  );
};

/**
 * Extract error message from API error
 */
export const getErrorMessage = (error: unknown): string => {
  if (!isApiError(error)) {
    return 'Đã xảy ra lỗi không xác định';
  }

  // Try to get message from response data
  const responseMessage =
    error.response?.data?.errorMessage ||
    error.response?.data?.message;

  if (responseMessage) {
    return responseMessage;
  }

  // Fallback to error message
  if (error.message) {
    return error.message;
  }

  // Fallback to status text
  if (error.response?.statusText) {
    return error.response.statusText;
  }

  return 'Đã xảy ra lỗi không xác định';
};
