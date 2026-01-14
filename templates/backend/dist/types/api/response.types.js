"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuccessResponse = createSuccessResponse;
exports.createErrorResponse = createErrorResponse;
/**
 * Helper function to create a standard success response
 * Modified to return data directly without wrapping in a data object
 * to match legacy API format
 */
function createSuccessResponse(data, meta) {
    // If pagination metadata is provided, add it directly to the response
    if (meta === null || meta === void 0 ? void 0 : meta.pagination) {
        const result = Object.assign(Object.assign({}, data), { page: meta.pagination.page, limit: meta.pagination.limit, total: meta.pagination.total });
        return result;
    }
    // Return data directly without wrapping
    return data;
}
/**
 * Helper function to create a standard error response
 */
function createErrorResponse(code, message, details, data) {
    // Return error in legacy format
    return {
        error: message,
        code: code,
        details: details,
        success: false
    };
}
