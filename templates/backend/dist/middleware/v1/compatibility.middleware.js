"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeRequest = void 0;
const logger_1 = require("../../logger");
const logger = logger_1.LoggerFactory.getLogger('CompatibilityMiddleware');
/**
 * Middleware to normalize legacy API request formats to v1 format
 * This helps maintain compatibility during the transition period
 */
const normalizeRequest = (req, res, next) => {
    try {
        // Skip for non-API requests
        if (!req.originalUrl.includes('/api/')) {
            return next();
        }
        logger.debug(`Normalizing request for: ${req.method} ${req.originalUrl}`);
        // Handle specific legacy request format mappings
        if (req.body) {
            // Example: Map legacy field names to new field names
            if (req.body.user_id !== undefined && req.body.userId === undefined) {
                logger.debug('Mapping legacy user_id to userId');
                req.body.userId = req.body.user_id;
            }
            if (req.body.company_id !== undefined && req.body.companyId === undefined) {
                logger.debug('Mapping legacy company_id to companyId');
                req.body.companyId = req.body.company_id;
            }
            // Example: Map legacy status values
            if (req.body.status === 'active_user') {
                logger.debug('Mapping legacy status value');
                req.body.status = 'active';
            }
            if (req.body.status === 'inactive_user') {
                logger.debug('Mapping legacy status value');
                req.body.status = 'inactive';
            }
        }
        // Handle legacy query parameters
        if (req.query) {
            // Example: Map sort_by to sortBy
            if (req.query.sort_by && !req.query.sortBy) {
                logger.debug('Mapping legacy sort_by query param');
                req.query.sortBy = req.query.sort_by;
            }
            // Example: Map page_size to limit
            if (req.query.page_size && !req.query.limit) {
                logger.debug('Mapping legacy page_size query param');
                req.query.limit = req.query.page_size;
            }
        }
    }
    catch (error) {
        // Log but don't block the request
        logger.error('Error in compatibility middleware:', error);
    }
    next();
};
exports.normalizeRequest = normalizeRequest;
/**
 * Note: The transformResponse middleware has been removed since
 * the createSuccessResponse function now directly returns data
 * in the legacy format without wrapping it in a data object.
 */
exports.default = { normalizeRequest: exports.normalizeRequest };
