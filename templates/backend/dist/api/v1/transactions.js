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
const auth_1 = require("../../middleware/auth");
const admin_1 = require("../../middleware/admin");
const logger_1 = require("../../logger");
const response_types_1 = require("../../types/api/response.types");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
const logger = logger_1.LoggerFactory.getLogger('TransactionsAPI');
/**
 * GET /api/v1/transactions
 * Get all transactions with filtering and search (Admin only)
 */
router.get('/', auth_1.authenticate, admin_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = '1', limit = '20', search, status, provider, planId, dateFrom, dateTo, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
        const offset = (pageNum - 1) * limitNum;
        // Build where conditions
        const conditions = [];
        // Search by email, billing name, or transaction ID
        if (search) {
            const searchTerm = `%${search}%`;
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.transactions.userEmail, searchTerm), (0, drizzle_orm_1.ilike)(schema_1.transactions.billingName, searchTerm), (0, drizzle_orm_1.ilike)(schema_1.transactions.providerTransactionId, searchTerm)));
        }
        // Filter by status
        if (status && status !== 'all') {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.transactions.status, status));
        }
        // Filter by provider
        if (provider && provider !== 'all') {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.transactions.provider, provider));
        }
        // Filter by plan
        if (planId && planId !== 'all') {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.transactions.planId, planId));
        }
        // Date range filters
        if (dateFrom) {
            conditions.push((0, drizzle_orm_1.gte)(schema_1.transactions.createdAt, new Date(dateFrom)));
        }
        if (dateTo) {
            const endDate = new Date(dateTo);
            endDate.setHours(23, 59, 59, 999);
            conditions.push((0, drizzle_orm_1.lte)(schema_1.transactions.createdAt, endDate));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        // Get total count
        const [{ total }] = yield db_1.db
            .select({ total: (0, drizzle_orm_1.count)() })
            .from(schema_1.transactions)
            .where(whereClause);
        // Get transactions with user info
        const result = yield db_1.db
            .select({
            id: schema_1.transactions.id,
            userId: schema_1.transactions.userId,
            userEmail: schema_1.transactions.userEmail,
            type: schema_1.transactions.type,
            status: schema_1.transactions.status,
            provider: schema_1.transactions.provider,
            providerTransactionId: schema_1.transactions.providerTransactionId,
            amount: schema_1.transactions.amount,
            currency: schema_1.transactions.currency,
            planId: schema_1.transactions.planId,
            planName: schema_1.transactions.planName,
            description: schema_1.transactions.description,
            cardLast4: schema_1.transactions.cardLast4,
            cardBrand: schema_1.transactions.cardBrand,
            billingName: schema_1.transactions.billingName,
            billingEmail: schema_1.transactions.billingEmail,
            errorCode: schema_1.transactions.errorCode,
            errorMessage: schema_1.transactions.errorMessage,
            authorizedAt: schema_1.transactions.authorizedAt,
            capturedAt: schema_1.transactions.capturedAt,
            refundedAt: schema_1.transactions.refundedAt,
            createdAt: schema_1.transactions.createdAt,
            updatedAt: schema_1.transactions.updatedAt,
            // Join user info
            userName: (0, drizzle_orm_1.sql) `CONCAT(${schema_1.users.firstName}, ' ', ${schema_1.users.lastName})`.as('userName')
        })
            .from(schema_1.transactions)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.transactions.userId, schema_1.users.id))
            .where(whereClause)
            .orderBy(sortOrder === 'asc' ? schema_1.transactions.createdAt : (0, drizzle_orm_1.desc)(schema_1.transactions.createdAt))
            .limit(limitNum)
            .offset(offset);
        res.json((0, response_types_1.createSuccessResponse)({
            transactions: result,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: Number(total),
                totalPages: Math.ceil(Number(total) / limitNum)
            }
        }));
    }
    catch (error) {
        logger.error('Error fetching transactions:', error);
        res.status(500).json((0, response_types_1.createErrorResponse)('SERVER_ERROR', 'Failed to fetch transactions'));
    }
}));
/**
 * GET /api/v1/transactions/stats
 * Get transaction statistics (Admin only)
 */
router.get('/stats', auth_1.authenticate, admin_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dateFrom, dateTo } = req.query;
        const conditions = [];
        if (dateFrom) {
            conditions.push((0, drizzle_orm_1.gte)(schema_1.transactions.createdAt, new Date(dateFrom)));
        }
        if (dateTo) {
            const endDate = new Date(dateTo);
            endDate.setHours(23, 59, 59, 999);
            conditions.push((0, drizzle_orm_1.lte)(schema_1.transactions.createdAt, endDate));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        // Total revenue (captured transactions only)
        const [revenueResult] = yield db_1.db
            .select({
            totalRevenue: (0, drizzle_orm_1.sum)(schema_1.transactions.amount),
            transactionCount: (0, drizzle_orm_1.count)()
        })
            .from(schema_1.transactions)
            .where(whereClause ? (0, drizzle_orm_1.and)(whereClause, (0, drizzle_orm_1.eq)(schema_1.transactions.status, 'captured')) : (0, drizzle_orm_1.eq)(schema_1.transactions.status, 'captured'));
        // Transaction counts by status
        const statusCounts = yield db_1.db
            .select({
            status: schema_1.transactions.status,
            count: (0, drizzle_orm_1.count)()
        })
            .from(schema_1.transactions)
            .where(whereClause)
            .groupBy(schema_1.transactions.status);
        // Revenue by plan
        const revenueByPlan = yield db_1.db
            .select({
            planId: schema_1.transactions.planId,
            planName: schema_1.transactions.planName,
            revenue: (0, drizzle_orm_1.sum)(schema_1.transactions.amount),
            count: (0, drizzle_orm_1.count)()
        })
            .from(schema_1.transactions)
            .where(whereClause ? (0, drizzle_orm_1.and)(whereClause, (0, drizzle_orm_1.eq)(schema_1.transactions.status, 'captured')) : (0, drizzle_orm_1.eq)(schema_1.transactions.status, 'captured'))
            .groupBy(schema_1.transactions.planId, schema_1.transactions.planName);
        // Revenue by provider
        const revenueByProvider = yield db_1.db
            .select({
            provider: schema_1.transactions.provider,
            revenue: (0, drizzle_orm_1.sum)(schema_1.transactions.amount),
            count: (0, drizzle_orm_1.count)()
        })
            .from(schema_1.transactions)
            .where(whereClause ? (0, drizzle_orm_1.and)(whereClause, (0, drizzle_orm_1.eq)(schema_1.transactions.status, 'captured')) : (0, drizzle_orm_1.eq)(schema_1.transactions.status, 'captured'))
            .groupBy(schema_1.transactions.provider);
        // Recent transactions (last 7 days by default)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dailyRevenue = yield db_1.db
            .select({
            date: (0, drizzle_orm_1.sql) `DATE(${schema_1.transactions.createdAt})`.as('date'),
            revenue: (0, drizzle_orm_1.sum)(schema_1.transactions.amount),
            count: (0, drizzle_orm_1.count)()
        })
            .from(schema_1.transactions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.transactions.createdAt, sevenDaysAgo), (0, drizzle_orm_1.eq)(schema_1.transactions.status, 'captured')))
            .groupBy((0, drizzle_orm_1.sql) `DATE(${schema_1.transactions.createdAt})`)
            .orderBy((0, drizzle_orm_1.sql) `DATE(${schema_1.transactions.createdAt})`);
        res.json((0, response_types_1.createSuccessResponse)({
            totalRevenue: Number((revenueResult === null || revenueResult === void 0 ? void 0 : revenueResult.totalRevenue) || 0),
            totalTransactions: Number((revenueResult === null || revenueResult === void 0 ? void 0 : revenueResult.transactionCount) || 0),
            statusBreakdown: statusCounts.reduce((acc, { status, count }) => {
                acc[status] = Number(count);
                return acc;
            }, {}),
            revenueByPlan: revenueByPlan.map(r => ({
                planId: r.planId,
                planName: r.planName,
                revenue: Number(r.revenue || 0),
                count: Number(r.count)
            })),
            revenueByProvider: revenueByProvider.map(r => ({
                provider: r.provider,
                revenue: Number(r.revenue || 0),
                count: Number(r.count)
            })),
            dailyRevenue: dailyRevenue.map(r => ({
                date: r.date,
                revenue: Number(r.revenue || 0),
                count: Number(r.count)
            }))
        }));
    }
    catch (error) {
        logger.error('Error fetching transaction stats:', error);
        res.status(500).json((0, response_types_1.createErrorResponse)('SERVER_ERROR', 'Failed to fetch transaction statistics'));
    }
}));
/**
 * GET /api/v1/transactions/:id
 * Get a single transaction by ID (Admin only)
 */
router.get('/:id', auth_1.authenticate, admin_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const [transaction] = yield db_1.db
            .select({
            id: schema_1.transactions.id,
            userId: schema_1.transactions.userId,
            userEmail: schema_1.transactions.userEmail,
            type: schema_1.transactions.type,
            status: schema_1.transactions.status,
            provider: schema_1.transactions.provider,
            providerTransactionId: schema_1.transactions.providerTransactionId,
            providerCustomerId: schema_1.transactions.providerCustomerId,
            amount: schema_1.transactions.amount,
            currency: schema_1.transactions.currency,
            planId: schema_1.transactions.planId,
            planName: schema_1.transactions.planName,
            description: schema_1.transactions.description,
            cardLast4: schema_1.transactions.cardLast4,
            cardBrand: schema_1.transactions.cardBrand,
            billingName: schema_1.transactions.billingName,
            billingEmail: schema_1.transactions.billingEmail,
            metadata: schema_1.transactions.metadata,
            errorCode: schema_1.transactions.errorCode,
            errorMessage: schema_1.transactions.errorMessage,
            authorizedAt: schema_1.transactions.authorizedAt,
            capturedAt: schema_1.transactions.capturedAt,
            refundedAt: schema_1.transactions.refundedAt,
            createdAt: schema_1.transactions.createdAt,
            updatedAt: schema_1.transactions.updatedAt,
            // Join user info
            userName: (0, drizzle_orm_1.sql) `CONCAT(${schema_1.users.firstName}, ' ', ${schema_1.users.lastName})`.as('userName'),
            userStatus: schema_1.users.status
        })
            .from(schema_1.transactions)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.transactions.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.transactions.id, id));
        if (!transaction) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', 'Transaction not found'));
        }
        res.json((0, response_types_1.createSuccessResponse)(transaction));
    }
    catch (error) {
        logger.error('Error fetching transaction:', error);
        res.status(500).json((0, response_types_1.createErrorResponse)('SERVER_ERROR', 'Failed to fetch transaction'));
    }
}));
exports.default = router;
