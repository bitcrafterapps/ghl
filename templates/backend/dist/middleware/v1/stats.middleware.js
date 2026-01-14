"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackApiErrors = exports.trackApiUsage = void 0;
const logger_1 = require("../../logger");
const health_1 = require("../../api/v1/health");
const logger = new logger_1.Logger('StatsMiddleware');
/**
 * Middleware to track API usage statistics
 * Measures response times and records request/error counts
 */
const trackApiUsage = (req, res, next) => {
    const startTime = Date.now();
    const path = req.originalUrl.split('?')[0]; // Remove query parameters
    // Determine if this is a v1 API request or legacy
    const isV1 = path.includes('/api/v1/');
    const version = isV1 ? 'v1' : 'legacy';
    // Store original end method to intercept it
    const originalEnd = res.end;
    // Override end method to capture response metrics
    // @ts-ignore - Correctly handle res.end override
    res.end = function (chunk, encoding, cb) {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;
        const isError = statusCode >= 400;
        // Log response time
        logger.debug(`${req.method} ${path} ${statusCode} ${responseTime}ms`);
        // Update stats
        try {
            (0, health_1.updateApiStats)(version, path, responseTime, isError);
        }
        catch (error) {
            logger.error('Failed to update API stats:', error);
        }
        // Call original end method
        return originalEnd.call(this, chunk, encoding, cb);
    };
    next();
};
exports.trackApiUsage = trackApiUsage;
/**
 * Middleware to track API errors
 * Captures detailed error information
 */
const trackApiErrors = (err, req, res, next) => {
    logger.error(`API Error: ${req.method} ${req.originalUrl}`, err);
    // Continue to next error handler
    next(err);
};
exports.trackApiErrors = trackApiErrors;
exports.default = { trackApiUsage: exports.trackApiUsage, trackApiErrors: exports.trackApiErrors };
