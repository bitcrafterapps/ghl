"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/v1/auth.middleware");
const activity_service_1 = require("../../services/activity.service");
const response_types_1 = require("../../types/api/response.types");
const logger_1 = require("../../logger");
const logger = logger_1.LoggerFactory.getLogger('ActivityAPI');
const router = (0, express_1.Router)();
// Log middleware to debug route matching
router.use((req, res, next) => {
    logger.debug(`Activity request received: ${req.method} ${req.originalUrl}, params: ${JSON.stringify(req.params)}`);
    next();
});
// Log activity
router.post('/log', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.debug('Received activity log request:', req.body);
        const authReq = req;
        if (!authReq.user) {
            logger.error('No authenticated user found in request');
            return res.status(401).json((0, response_types_1.createErrorResponse)('AUTH_REQUIRED', 'Authentication required'));
        }
        const { type, action, title, entityId } = req.body;
        const userId = authReq.user.userId;
        logger.debug('Authenticated user ID:', userId);
        // Validate required fields
        if (!type || !action || !title || !entityId) {
            logger.error('Missing required fields:', { type, action, title, entityId });
            return res.status(400).json((0, response_types_1.createErrorResponse)('MISSING_FIELDS', 'Missing required fields'));
        }
        // Validate field values
        const validTypes = ['proposal', 'template', 'company', 'user'];
        const validActions = ['created', 'updated', 'deleted'];
        if (!validTypes.includes(type)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_TYPE', `Invalid type. Must be one of: ${validTypes.join(', ')}`));
        }
        if (!validActions.includes(action)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_ACTION', `Invalid action. Must be one of: ${validActions.join(', ')}`));
        }
        // Insert activity log using the service
        const activity = yield activity_service_1.ActivityService.logActivity({
            type,
            action,
            title,
            entityId,
            userId
        });
        logger.debug('Activity logged successfully:', activity);
        return res.status(201).json((0, response_types_1.createSuccessResponse)({
            message: 'Activity logged successfully',
            activity
        }));
    }
    catch (error) {
        logger.error('Error logging activity:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('SERVER_ERROR', 'Failed to log activity'));
    }
}));
logger.info('All activity routes mounted successfully');
exports.default = router;
