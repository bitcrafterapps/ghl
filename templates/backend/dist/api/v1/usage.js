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
const token_usage_service_1 = require("../../services/token-usage-service");
const company_service_1 = require("../../services/company.service");
const logger_1 = require("../../logger");
const auth_middleware_1 = require("../../middleware/v1/auth.middleware");
const router = (0, express_1.Router)();
const logger = logger_1.LoggerFactory.getLogger('UsageApi');
// Helper to check if user is Site Admin
function isSiteAdmin(user) {
    var _a;
    return (_a = user === null || user === void 0 ? void 0 : user.roles) === null || _a === void 0 ? void 0 : _a.includes('Site Admin');
}
// Helper to check if user is Admin (company admin)
function isAdmin(user) {
    var _a;
    return (_a = user === null || user === void 0 ? void 0 : user.roles) === null || _a === void 0 ? void 0 : _a.includes('Admin');
}
// Helper to parse filter query params
function parseFilters(query) {
    const filters = {};
    if (query.startDate) {
        const date = new Date(query.startDate);
        if (!isNaN(date.getTime()))
            filters.startDate = date;
    }
    if (query.granularity && ['day', 'week', 'month', 'year'].includes(query.granularity)) {
        filters.granularity = query.granularity;
    }
    if (query.endDate) {
        const date = new Date(query.endDate);
        if (!isNaN(date.getTime()))
            filters.endDate = date;
    }
    if (query.projectId && typeof query.projectId === 'string') {
        filters.projectId = query.projectId;
    }
    if (query.model && typeof query.model === 'string') {
        filters.model = query.model;
    }
    if (query.limit) {
        const limit = parseInt(query.limit, 10);
        if (!isNaN(limit) && limit > 0 && limit <= 100)
            filters.limit = limit;
    }
    if (query.offset) {
        const offset = parseInt(query.offset, 10);
        if (!isNaN(offset) && offset >= 0)
            filters.offset = offset;
    }
    return filters;
}
// Get current user's usage (summary)
router.get('/me', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const usage = yield token_usage_service_1.TokenUsageService.getUserUsage(userId);
        res.json(usage);
    }
    catch (error) {
        logger.error('Failed to get user usage:', error);
        res.status(500).json({ error: 'Failed to retrieve usage data' });
    }
}));
// Get current user's detailed usage with filtering
router.get('/me/details', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const filters = parseFilters(req.query);
        const usage = yield token_usage_service_1.TokenUsageService.getUserUsageDetails(userId, filters);
        res.json(usage);
    }
    catch (error) {
        logger.error('Failed to get user detailed usage:', error);
        res.status(500).json({ error: 'Failed to retrieve detailed usage data' });
    }
}));
// Get global usage summary (Admin/Site Admin)
// Site Admin sees all usage, Admin sees only their company's usage
router.get('/global', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['Admin', 'Site Admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        // Site Admin sees all global usage
        if (isSiteAdmin(user)) {
            const usage = yield token_usage_service_1.TokenUsageService.getGlobalUsage();
            return res.json(usage);
        }
        // Admin sees only their company's usage
        if (isAdmin(user)) {
            const companyId = yield company_service_1.CompanyService.getUserCompanyId(user.userId);
            if (!companyId) {
                return res.json({
                    summary: [],
                    totals: { input: 0, output: 0, total: 0, requests: 0, cost: 0 },
                    recentLogs: []
                });
            }
            const usage = yield token_usage_service_1.TokenUsageService.getCompanyUsage(companyId);
            return res.json(usage);
        }
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    catch (error) {
        logger.error('Failed to get global usage:', error);
        res.status(500).json({ error: 'Failed to retrieve global usage data' });
    }
}));
// Get global detailed usage with filtering (Admin/Site Admin)
// Site Admin sees all usage, Admin sees only their company's usage
router.get('/global/details', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['Admin', 'Site Admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const filters = parseFilters(req.query);
        // Site Admin sees all global usage
        if (isSiteAdmin(user)) {
            const usage = yield token_usage_service_1.TokenUsageService.getGlobalUsageDetails(filters);
            return res.json(usage);
        }
        // Admin sees only their company's usage
        if (isAdmin(user)) {
            const companyId = yield company_service_1.CompanyService.getUserCompanyId(user.userId);
            if (!companyId) {
                return res.json({
                    usageByProject: [],
                    usageByDate: [],
                    usageByTimeByModel: [],
                    logs: [],
                    pagination: { total: 0, limit: filters.limit || 50, offset: filters.offset || 0, hasMore: false }
                });
            }
            // Get company user IDs and filter by them
            const userIds = yield token_usage_service_1.TokenUsageService.getCompanyUserIds(companyId);
            if (userIds.length === 0) {
                return res.json({
                    usageByProject: [],
                    usageByDate: [],
                    usageByTimeByModel: [],
                    logs: [],
                    pagination: { total: 0, limit: filters.limit || 50, offset: filters.offset || 0, hasMore: false }
                });
            }
            filters.userIds = userIds;
            const usage = yield token_usage_service_1.TokenUsageService.getGlobalUsageDetails(filters);
            return res.json(usage);
        }
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    catch (error) {
        logger.error('Failed to get global detailed usage:', error);
        res.status(500).json({ error: 'Failed to retrieve global detailed usage data' });
    }
}));
exports.default = router;
