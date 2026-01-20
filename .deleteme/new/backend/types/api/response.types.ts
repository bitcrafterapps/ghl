/**
 * Standard API response format
 */
export interface StandardResponse<T> {
  data: T;
  error?: ErrorResponse;
  meta?: MetaData;
}

/**
 * Error response format
 */
export interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Metadata for responses, including pagination
 */
export interface MetaData {
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * Helper function to create a standard success response
 * Modified to return data directly without wrapping in a data object
 * to match legacy API format
 */
export function createSuccessResponse<T>(data: T, meta?: MetaData): T {
  // If pagination metadata is provided, add it directly to the response
  if (meta?.pagination) {
    const result = {
      ...data,
      page: meta.pagination.page,
      limit: meta.pagination.limit,
      total: meta.pagination.total
    };
    return result as unknown as T;
  }
  
  // Return data directly without wrapping
  return data;
}

/**
 * Helper function to create a standard error response
 */
export function createErrorResponse<T = null>(
  code: string,
  message: string,
  details?: unknown,
  data?: T
): any {
  // Return error in legacy format
  return {
    error: message,
    code: code,
    details: details,
    success: false
  };
} 