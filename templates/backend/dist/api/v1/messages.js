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
const logger = logger_1.LoggerFactory.getLogger('MessagesAPI');
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /projects/{projectId}/messages:
 *   get:
 *     summary: Get chat messages for a project
 *     tags: [Messages]
 */
router.get('/projects/:projectId/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.createErrorResponse)('UNAUTHORIZED', 'Authentication required'));
        }
        const { projectId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        // Verify project ownership
        const [project] = yield db_1.db.select()
            .from(schema_1.projects)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projects.id, projectId), (0, drizzle_orm_1.eq)(schema_1.projects.userId, Number(userId))));
        if (!project) {
            return res.status(404).json((0, response_1.createErrorResponse)('NOT_FOUND', 'Project not found'));
        }
        const messages = yield db_1.db.select()
            .from(schema_1.chatMessages)
            .where((0, drizzle_orm_1.eq)(schema_1.chatMessages.projectId, projectId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.chatMessages.createdAt))
            .limit(limit);
        // Return in chronological order
        return res.json((0, response_1.createSuccessResponse)({ messages: messages.reverse() }));
    }
    catch (error) {
        logger.error('Error getting messages:', error);
        return res.status(500).json((0, response_1.createErrorResponse)('SERVER_ERROR', 'Failed to get messages', error));
    }
}));
/**
 * @swagger
 * /projects/{projectId}/messages:
 *   post:
 *     summary: Create a chat message
 *     tags: [Messages]
 */
router.post('/projects/:projectId/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.createErrorResponse)('UNAUTHORIZED', 'Authentication required'));
        }
        const { projectId } = req.params;
        const { role, content, metadata } = req.body;
        if (!content || !role) {
            return res.status(400).json((0, response_1.createErrorResponse)('VALIDATION_ERROR', 'Role and content are required'));
        }
        // Verify project ownership
        const [project] = yield db_1.db.select()
            .from(schema_1.projects)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projects.id, projectId), (0, drizzle_orm_1.eq)(schema_1.projects.userId, Number(userId))));
        if (!project) {
            return res.status(404).json((0, response_1.createErrorResponse)('NOT_FOUND', 'Project not found'));
        }
        const [message] = yield db_1.db.insert(schema_1.chatMessages).values({
            projectId,
            role: role.toLowerCase(),
            content,
            metadata: metadata || null
        }).returning();
        logger.info(`Message created in project ${projectId}`);
        return res.status(201).json((0, response_1.createSuccessResponse)({ message }));
    }
    catch (error) {
        logger.error('Error creating message:', error);
        return res.status(500).json((0, response_1.createErrorResponse)('SERVER_ERROR', 'Failed to create message', error));
    }
}));
logger.info('All message routes mounted successfully');
exports.default = router;
