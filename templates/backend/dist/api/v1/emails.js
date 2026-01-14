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
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const logger_1 = require("../../logger");
const auth_middleware_1 = require("../../middleware/v1/auth.middleware");
const response_1 = require("../../utils/response");
const email_service_1 = require("../../services/email.service");
const user_service_1 = require("../../services/user.service");
const logger = logger_1.LoggerFactory.getLogger('EmailsAPI');
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Admin check middleware
const requireAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    logger.info(`[AuthCheck] Checking admin access for userId: ${userId}`);
    if (!userId) {
        return res.status(401).json((0, response_1.createErrorResponse)('UNAUTHORIZED', 'Authentication required'));
    }
    // Use UserService to get consistent user object with defaults
    const user = yield user_service_1.UserService.getUserById(Number(userId));
    logger.info(`[AuthCheck] UserService fetch for userId ${userId}: ${user ? 'Found' : 'Not Found'}, Roles: ${JSON.stringify(user === null || user === void 0 ? void 0 : user.roles)}`);
    const hasRole = (_b = user === null || user === void 0 ? void 0 : user.roles) === null || _b === void 0 ? void 0 : _b.some((role) => role === 'Admin' ||
        role === 'Site Admin' ||
        role.toLowerCase() === 'admin' ||
        role.toLowerCase() === 'site admin');
    if (!user || !hasRole) {
        logger.warn(`[AuthCheck] Access Denied. User roles: ${JSON.stringify(user === null || user === void 0 ? void 0 : user.roles)}`);
        return res.status(403).json((0, response_1.createErrorResponse)('FORBIDDEN', 'Admin access required'));
    }
    next();
});
/*
 * @swagger
 * /emails/templates:
 *   get:
 *     summary: List all email templates
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 */
router.get('/templates', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        console.log(`[EmailsAPI] GET /templates - Checking access for userId: ${userId}`);
        if (!userId) {
            return res.status(401).json((0, response_1.createErrorResponse)('UNAUTHORIZED', 'Authentication required'));
        }
        const user = yield user_service_1.UserService.getUserById(Number(userId));
        console.log(`[EmailsAPI] User found: ${!!user}, Roles: ${JSON.stringify(user === null || user === void 0 ? void 0 : user.roles)}`);
        const isAdmin = (_b = user === null || user === void 0 ? void 0 : user.roles) === null || _b === void 0 ? void 0 : _b.some((role) => role === 'Admin' ||
            role === 'Site Admin' ||
            role === 'admin' ||
            role === 'site admin');
        if (!isAdmin) {
            console.warn(`[EmailsAPI] Access Denied for userId ${userId}. Roles: ${JSON.stringify(user === null || user === void 0 ? void 0 : user.roles)}`);
            return res.status(403).json((0, response_1.createErrorResponse)('FORBIDDEN', `Admin access required. Debug: UserID=${userId}, Roles=${JSON.stringify((user === null || user === void 0 ? void 0 : user.roles) || [])}`));
        }
        const templates = yield email_service_1.EmailService.getTemplates();
        return res.json((0, response_1.createSuccessResponse)({ templates }));
    }
    catch (error) {
        logger.error('Error fetching templates:', error);
        return res.status(500).json((0, response_1.createErrorResponse)('SERVER_ERROR', 'Failed to fetch templates', error));
    }
}));
/**
 * @swagger
 * /emails/templates/{key}:
 *   get:
 *     summary: Get a specific email template
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 */
router.get('/templates/:key', requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key } = req.params;
        const template = yield email_service_1.EmailService.getTemplate(key);
        if (!template) {
            return res.status(404).json((0, response_1.createErrorResponse)('NOT_FOUND', 'Template not found'));
        }
        return res.json((0, response_1.createSuccessResponse)({ template }));
    }
    catch (error) {
        logger.error('Error fetching template:', error);
        return res.status(500).json((0, response_1.createErrorResponse)('SERVER_ERROR', 'Failed to fetch template', error));
    }
}));
/**
 * @swagger
 * /emails/templates:
 *   post:
 *     summary: Create a new email template
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 */
router.post('/templates', requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, name, subject, body, enabled } = req.body;
        if (!key || !name || !subject || !body) {
            return res.status(400).json((0, response_1.createErrorResponse)('VALIDATION_ERROR', 'Key, name, subject, and body are required'));
        }
        // Check if key already exists
        const existing = yield email_service_1.EmailService.getTemplate(key);
        if (existing) {
            return res.status(409).json((0, response_1.createErrorResponse)('CONFLICT', 'Template with this key already exists'));
        }
        const template = yield email_service_1.EmailService.createTemplate({ key, name, subject, body, enabled });
        logger.info(`Email template created: ${key}`);
        return res.status(201).json((0, response_1.createSuccessResponse)({ template }));
    }
    catch (error) {
        logger.error('Error creating template:', error);
        return res.status(500).json((0, response_1.createErrorResponse)('SERVER_ERROR', 'Failed to create template', error));
    }
}));
/**
 * @swagger
 * /emails/templates/{key}:
 *   put:
 *     summary: Update an email template
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 */
router.put('/templates/:key', requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key } = req.params;
        const { name, subject, body, enabled } = req.body;
        const existing = yield email_service_1.EmailService.getTemplate(key);
        if (!existing) {
            return res.status(404).json((0, response_1.createErrorResponse)('NOT_FOUND', 'Template not found'));
        }
        const updates = {};
        if (name !== undefined)
            updates.name = name;
        if (subject !== undefined)
            updates.subject = subject;
        if (body !== undefined)
            updates.body = body;
        if (enabled !== undefined)
            updates.enabled = enabled;
        const template = yield email_service_1.EmailService.updateTemplate(key, updates);
        logger.info(`Email template updated: ${key}`);
        return res.json((0, response_1.createSuccessResponse)({ template }));
    }
    catch (error) {
        logger.error('Error updating template:', error);
        return res.status(500).json((0, response_1.createErrorResponse)('SERVER_ERROR', 'Failed to update template', error));
    }
}));
/**
 * @swagger
 * /emails/send-test:
 *   post:
 *     summary: Send a test email
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 */
router.post('/send-test', requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { templateKey, to, variables } = req.body;
        if (!templateKey || !to) {
            return res.status(400).json((0, response_1.createErrorResponse)('VALIDATION_ERROR', 'templateKey and to are required'));
        }
        const result = yield email_service_1.EmailService.sendTest(templateKey, to, variables);
        if (!result.success) {
            return res.status(400).json((0, response_1.createErrorResponse)('EMAIL_FAILED', result.error || 'Failed to send email'));
        }
        logger.info(`Test email sent: ${templateKey} to ${to}`);
        return res.json((0, response_1.createSuccessResponse)({
            message: 'Test email sent successfully',
            resendId: result.resendId
        }));
    }
    catch (error) {
        logger.error('Error sending test email:', error);
        return res.status(500).json((0, response_1.createErrorResponse)('SERVER_ERROR', 'Failed to send test email', error));
    }
}));
/**
 * @swagger
 * /emails/logs:
 *   get:
 *     summary: Get email logs
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by email
 */
router.get('/logs', requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const status = req.query.status;
        const search = req.query.search;
        const offset = (page - 1) * limit;
        // Build conditions
        const conditions = [];
        if (status) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.emailLogs.status, status));
        }
        if (search) {
            conditions.push((0, drizzle_orm_1.like)(schema_1.emailLogs.recipientEmail, `%${search}%`));
        }
        // Get logs
        let query = db_1.db.select()
            .from(schema_1.emailLogs)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.emailLogs.createdAt))
            .limit(limit)
            .offset(offset);
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        const logs = yield query;
        // Get total count
        let countQuery = db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.emailLogs);
        if (conditions.length > 0) {
            countQuery = countQuery.where((0, drizzle_orm_1.and)(...conditions));
        }
        const [{ count: total }] = yield countQuery;
        return res.json((0, response_1.createSuccessResponse)({
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }));
    }
    catch (error) {
        logger.error('Error fetching email logs:', error);
        return res.status(500).json((0, response_1.createErrorResponse)('SERVER_ERROR', 'Failed to fetch email logs', error));
    }
}));
/**
 * @swagger
 * /emails/stats:
 *   get:
 *     summary: Get email statistics
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [sentCount] = yield db_1.db.select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.emailLogs)
            .where((0, drizzle_orm_1.eq)(schema_1.emailLogs.status, 'sent'));
        const [failedCount] = yield db_1.db.select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.emailLogs)
            .where((0, drizzle_orm_1.eq)(schema_1.emailLogs.status, 'failed'));
        const [totalCount] = yield db_1.db.select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.emailLogs);
        const [templateCount] = yield db_1.db.select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.emailTemplates);
        return res.json((0, response_1.createSuccessResponse)({
            stats: {
                sent: sentCount.count,
                failed: failedCount.count,
                total: totalCount.count,
                templates: templateCount.count
            }
        }));
    }
    catch (error) {
        logger.error('Error fetching email stats:', error);
        return res.status(500).json((0, response_1.createErrorResponse)('SERVER_ERROR', 'Failed to fetch stats', error));
    }
}));
logger.info('All email routes mounted successfully');
exports.default = router;
