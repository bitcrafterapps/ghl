"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const dashboard_service_1 = require("../../services/dashboard.service");
const response_types_1 = require("../../types/api/response.types");
const logger_1 = require("../../logger");
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const logger = logger_1.LoggerFactory.getLogger('DashboardAPI');
const router = (0, express_1.Router)();
// Log middleware to debug route matching
router.use((req, res, next) => {
    logger.debug(`Dashboard request received: ${req.method} ${req.originalUrl}, params: ${JSON.stringify(req.params)}`);
    next();
});
// Get dashboard stats
router.get('/stats', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        logger.debug('Fetching dashboard stats');
        const authReq = req;
        if (!authReq.user) {
            logger.error('No authenticated user found in request');
            return res.status(401).json((0, response_types_1.createErrorResponse)('AUTH_REQUIRED', 'Authentication required'));
        }
        const isSiteAdmin = (_b = (_a = authReq.user.roles) === null || _a === void 0 ? void 0 : _a.includes('Site Admin')) !== null && _b !== void 0 ? _b : false;
        logger.debug(`User ${authReq.user.userId} is admin: ${isSiteAdmin}`);
        const stats = yield dashboard_service_1.DashboardService.getDashboardStats(authReq.user.userId, isSiteAdmin);
        logger.debug('Dashboard stats retrieved:', stats);
        return res.json((0, response_types_1.createSuccessResponse)(stats));
    }
    catch (error) {
        logger.error('Error fetching dashboard stats:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('SERVER_ERROR', 'Failed to fetch dashboard statistics'));
    }
}));
// Get generation activity by day for the last 7 days
router.get('/generation-activity', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json((0, response_types_1.createErrorResponse)('AUTH_REQUIRED', 'Authentication required'));
        }
        const userId = authReq.user.userId;
        const { generations } = yield Promise.resolve().then(() => __importStar(require('../../db/schema')));
        // Get current date and calculate 7 days ago
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        // Query generations grouped by day
        const result = yield db_1.db
            .select({
            date: (0, drizzle_orm_1.sql) `DATE(${generations.createdAt})`,
            count: (0, drizzle_orm_1.sql) `COUNT(*)::int`
        })
            .from(generations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(generations.userId, userId), (0, drizzle_orm_1.sql) `${generations.createdAt} >= ${sevenDaysAgo.toISOString()}`))
            .groupBy((0, drizzle_orm_1.sql) `DATE(${generations.createdAt})`)
            .orderBy((0, drizzle_orm_1.sql) `DATE(${generations.createdAt})`);
        // Create array for all 7 days with counts (fill in zeros for days with no activity)
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const activityData = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(sevenDaysAgo);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
            const dayName = dayNames[date.getDay()];
            // Find count for this date
            const found = result.find(r => r.date === dateStr);
            activityData.push({
                name: dayName,
                value: found ? found.count : 0
            });
        }
        logger.debug('Generation activity data:', activityData);
        return res.json((0, response_types_1.createSuccessResponse)({ activityData }));
    }
    catch (error) {
        logger.error('Error fetching generation activity:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('SERVER_ERROR', 'Failed to fetch generation activity'));
    }
}));
// Get recent changes
router.get('/recent-changes', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.debug('Fetching recent changes');
        const authReq = req;
        if (!authReq.user) {
            logger.error('No authenticated user found in request');
            return res.status(401).json((0, response_types_1.createErrorResponse)('AUTH_REQUIRED', 'Authentication required'));
        }
        // Parse and validate query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const type = req.query.type;
        const action = req.query.action;
        const search = req.query.search;
        const userId = req.query.userId ? parseInt(req.query.userId) : undefined;
        logger.debug('Query params:', { page, limit, type, action, search, userId });
        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_PAGINATION', 'Invalid pagination parameters'));
        }
        const offset = (page - 1) * limit;
        let conditions = [];
        // Always filter by userId if provided
        if (userId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.activityLog.userId, userId));
        }
        if (type) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.activityLog.type, type));
        }
        if (action) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.activityLog.action, action));
        }
        if (search) {
            conditions.push((0, drizzle_orm_1.ilike)(schema_1.activityLog.title, `%${search}%`));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        // Execute queries in parallel for better performance
        const [activities, totalCount] = yield Promise.all([
            db_1.db.select({
                id: schema_1.activityLog.id,
                type: schema_1.activityLog.type,
                action: schema_1.activityLog.action,
                title: schema_1.activityLog.title,
                timestamp: schema_1.activityLog.createdAt,
                userId: schema_1.activityLog.userId,
                isRead: schema_1.activityLog.isRead
            })
                .from(schema_1.activityLog)
                .where(whereClause)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.activityLog.createdAt))
                .limit(limit)
                .offset(offset),
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.activityLog)
                .where(whereClause)
                .then(result => Number(result[0].count))
        ]);
        logger.debug('Found activities:', activities);
        logger.debug('Total count:', totalCount);
        const responseData = {
            // Pass timestamps as-is - frontend will handle timezone formatting
            activities,
        };
        // Calculate pagination metadata
        const paginationMeta = {
            pagination: {
                page,
                limit,
                total: totalCount
            }
        };
        logger.debug('Sending response with pagination:', paginationMeta);
        return res.json((0, response_types_1.createSuccessResponse)(responseData, paginationMeta));
    }
    catch (error) {
        logger.error('Error fetching recent changes:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('SERVER_ERROR', 'Failed to fetch recent changes'));
    }
}));
// Mark a single notification as read
router.patch('/notifications/:id/read', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json((0, response_types_1.createErrorResponse)('AUTH_REQUIRED', 'Authentication required'));
        }
        const notificationId = parseInt(req.params.id);
        if (isNaN(notificationId)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_ID', 'Invalid notification ID'));
        }
        // Verify the notification belongs to the user
        const [notification] = yield db_1.db.select()
            .from(schema_1.activityLog)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.activityLog.id, notificationId), (0, drizzle_orm_1.eq)(schema_1.activityLog.userId, authReq.user.userId)));
        if (!notification) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', 'Notification not found'));
        }
        // Mark as read
        yield db_1.db.update(schema_1.activityLog)
            .set({ isRead: true })
            .where((0, drizzle_orm_1.eq)(schema_1.activityLog.id, notificationId));
        logger.debug(`Notification ${notificationId} marked as read`);
        return res.json((0, response_types_1.createSuccessResponse)({ success: true }));
    }
    catch (error) {
        logger.error('Error marking notification as read:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('SERVER_ERROR', 'Failed to mark notification as read'));
    }
}));
// Mark all notifications as read for a user
router.patch('/notifications/read-all', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json((0, response_types_1.createErrorResponse)('AUTH_REQUIRED', 'Authentication required'));
        }
        // Mark all user's notifications as read
        yield db_1.db.update(schema_1.activityLog)
            .set({ isRead: true })
            .where((0, drizzle_orm_1.eq)(schema_1.activityLog.userId, authReq.user.userId));
        logger.debug(`All notifications marked as read for user ${authReq.user.userId}`);
        return res.json((0, response_types_1.createSuccessResponse)({ success: true }));
    }
    catch (error) {
        logger.error('Error marking all notifications as read:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('SERVER_ERROR', 'Failed to mark all notifications as read'));
    }
}));
logger.info('All dashboard routes mounted successfully');
exports.default = router;
