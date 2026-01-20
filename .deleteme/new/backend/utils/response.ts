/**
 * API Response Utilities
 * Standardized response format for all API endpoints
 */

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(code: string, message: string, details?: any): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  };
}
