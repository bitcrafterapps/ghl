"use strict";
/**
 * API Response Utilities
 * Standardized response format for all API endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuccessResponse = createSuccessResponse;
exports.createErrorResponse = createErrorResponse;
/**
 * Create a standardized success response
 */
function createSuccessResponse(data) {
    return {
        success: true,
        data
    };
}
/**
 * Create a standardized error response
 */
function createErrorResponse(code, message, details) {
    return {
        success: false,
        error: Object.assign({ code,
            message }, (details && { details }))
    };
}
