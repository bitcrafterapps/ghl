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
exports.TokenUsageService = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const logger_1 = require("../logger");
const logger = logger_1.LoggerFactory.getLogger('TokenUsageService');
class TokenUsageService {
    /**
     * Record token usage to the database
     */
    static recordUsage(record) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield db_1.db.insert(schema_1.tokenUsage).values({
                    userId: record.userId,
                    projectId: record.projectId || null,
                    model: record.model,
                    provider: record.provider,
                    inputTokens: record.inputTokens,
                    outputTokens: record.outputTokens,
                    totalTokens: record.totalTokens,
                    context: record.context || null,
                });
            }
            catch (error) {
                logger.error('Failed to record token usage:', error);
                // Don't throw - token tracking should not break LLM calls
            }
        });
    }
    static calculateCost(model, inputTokens, outputTokens) {
        // Normalize model name roughly (remove dates if needed, or exact match)
        // For now, exact match or simple includes
        let pricing = this.MODEL_PRICING[model];
        if (!pricing) {
            // Try to find partial match defaults
            if (model.includes('gpt-4o'))
                pricing = this.MODEL_PRICING['gpt-4o'];
            else if (model.includes('sonnet'))
                pricing = this.MODEL_PRICING['claude-3-5-sonnet'];
            else if (model.includes('gemini') && model.includes('flash'))
                pricing = this.MODEL_PRICING['gemini-2.0-flash'];
            else if (model.includes('gpt-4'))
                pricing = this.MODEL_PRICING['gpt-4'];
            else
                pricing = { input: 0, output: 0 }; // Unknown model
        }
        const inputCost = (inputTokens / 1000000) * pricing.input;
        const outputCost = (outputTokens / 1000000) * pricing.output;
        return inputCost + outputCost;
    }
    /**
     * Get usage summary for a specific user
     */
    static getUserUsage(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Aggregate by model
                const usageByModel = yield db_1.db
                    .select({
                    model: schema_1.tokenUsage.model,
                    provider: schema_1.tokenUsage.provider,
                    totalInput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.inputTokens})::int`,
                    totalOutput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.outputTokens})::int`,
                    total: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.totalTokens})::int`,
                    requestCount: (0, drizzle_orm_1.sql) `count(*)::int`
                })
                    .from(schema_1.tokenUsage)
                    .where((0, drizzle_orm_1.eq)(schema_1.tokenUsage.userId, userId))
                    .groupBy(schema_1.tokenUsage.model, schema_1.tokenUsage.provider);
                // Get recent logs
                const recentLogs = yield db_1.db
                    .select()
                    .from(schema_1.tokenUsage)
                    .where((0, drizzle_orm_1.eq)(schema_1.tokenUsage.userId, userId))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.tokenUsage.createdAt))
                    .limit(20);
                // Calculate totals and cost
                let totalCost = 0;
                const usageWithCost = usageByModel.map(record => {
                    const cost = this.calculateCost(record.model, record.totalInput || 0, record.totalOutput || 0);
                    totalCost += cost;
                    return Object.assign(Object.assign({}, record), { estimatedCost: cost });
                });
                const totals = usageWithCost.reduce((acc, curr) => ({
                    input: acc.input + (curr.totalInput || 0),
                    output: acc.output + (curr.totalOutput || 0),
                    total: acc.total + (curr.total || 0),
                    requests: acc.requests + (curr.requestCount || 0),
                    cost: acc.cost + (curr.estimatedCost || 0)
                }), { input: 0, output: 0, total: 0, requests: 0, cost: 0 });
                return {
                    summary: usageWithCost,
                    totals,
                    recentLogs
                };
            }
            catch (error) {
                logger.error(`Failed to get usage for user ${userId}:`, error);
                throw error;
            }
        });
    }
    /**
     * Get global usage summary (Super Admin)
     */
    static getGlobalUsage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Global totals per model
                const usageByModel = yield db_1.db
                    .select({
                    model: schema_1.tokenUsage.model,
                    provider: schema_1.tokenUsage.provider,
                    totalInput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.inputTokens})::int`,
                    totalOutput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.outputTokens})::int`,
                    total: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.totalTokens})::int`,
                    requestCount: (0, drizzle_orm_1.sql) `count(*)::int`
                })
                    .from(schema_1.tokenUsage)
                    .groupBy(schema_1.tokenUsage.model, schema_1.tokenUsage.provider);
                // Calculate costs per model
                let totalGlobalCost = 0;
                const usageWithCost = usageByModel.map(record => {
                    const cost = this.calculateCost(record.model, record.totalInput || 0, record.totalOutput || 0);
                    totalGlobalCost += cost;
                    return Object.assign(Object.assign({}, record), { estimatedCost: cost });
                });
                // Top users by usage
                const topUsers = yield db_1.db
                    .select({
                    userId: schema_1.users.id,
                    email: schema_1.users.email,
                    firstName: schema_1.users.firstName,
                    lastName: schema_1.users.lastName,
                    totalInput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.inputTokens})::int`,
                    totalOutput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.outputTokens})::int`,
                    totalUsage: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.totalTokens})::int`,
                    requestCount: (0, drizzle_orm_1.sql) `count(${schema_1.tokenUsage.id})::int`
                })
                    .from(schema_1.tokenUsage)
                    .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.tokenUsage.userId, schema_1.users.id))
                    .groupBy(schema_1.users.id, schema_1.users.email, schema_1.users.firstName, schema_1.users.lastName)
                    .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.totalTokens})`))
                    .limit(10);
                const grandTotal = usageWithCost.reduce((acc, curr) => acc + (curr.total || 0), 0);
                return {
                    usageByModel: usageWithCost,
                    topUsers,
                    grandTotal,
                    totalCost: totalGlobalCost
                };
            }
            catch (error) {
                logger.error('Failed to get global usage:', error);
                throw error;
            }
        });
    }
    /**
     * Get detailed usage for a specific user with filtering options
     */
    static getUserUsageDetails(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, filters = {}) {
            var _a;
            try {
                const { startDate, endDate, projectId, model, limit = 50, offset = 0, granularity = 'day' } = filters;
                // Build conditions
                const conditions = [(0, drizzle_orm_1.eq)(schema_1.tokenUsage.userId, userId)];
                if (startDate)
                    conditions.push((0, drizzle_orm_1.gte)(schema_1.tokenUsage.createdAt, startDate));
                if (endDate)
                    conditions.push((0, drizzle_orm_1.lte)(schema_1.tokenUsage.createdAt, endDate));
                if (projectId)
                    conditions.push((0, drizzle_orm_1.eq)(schema_1.tokenUsage.projectId, projectId));
                if (model)
                    conditions.push((0, drizzle_orm_1.eq)(schema_1.tokenUsage.model, model));
                // Usage grouped by project
                const usageByProject = yield db_1.db
                    .select({
                    projectId: schema_1.tokenUsage.projectId,
                    projectName: schema_1.projects.name,
                    totalInput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.inputTokens})::int`,
                    totalOutput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.outputTokens})::int`,
                    total: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.totalTokens})::int`,
                    requestCount: (0, drizzle_orm_1.sql) `count(*)::int`,
                    firstUsed: (0, drizzle_orm_1.sql) `min(${schema_1.tokenUsage.createdAt})`,
                    lastUsed: (0, drizzle_orm_1.sql) `max(${schema_1.tokenUsage.createdAt})`
                })
                    .from(schema_1.tokenUsage)
                    .leftJoin(schema_1.projects, (0, drizzle_orm_1.eq)(schema_1.tokenUsage.projectId, schema_1.projects.id))
                    .where((0, drizzle_orm_1.and)(...conditions))
                    .groupBy(schema_1.tokenUsage.projectId, schema_1.projects.name)
                    .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.totalTokens})`));
                // Add cost calculations
                const projectsWithCost = usageByProject.map(record => ({
                    projectId: record.projectId,
                    projectName: record.projectName,
                    totalInput: record.totalInput || 0,
                    totalOutput: record.totalOutput || 0,
                    total: record.total || 0,
                    requestCount: record.requestCount || 0,
                    estimatedCost: 0, // Will calculate below
                    firstUsed: record.firstUsed,
                    lastUsed: record.lastUsed
                }));
                // Usage grouped by date (day)
                const usageByDate = yield db_1.db
                    .select({
                    date: (0, drizzle_orm_1.sql) `date_trunc('day', ${schema_1.tokenUsage.createdAt})::date::text`,
                    totalInput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.inputTokens})::int`,
                    totalOutput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.outputTokens})::int`,
                    total: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.totalTokens})::int`,
                    requestCount: (0, drizzle_orm_1.sql) `count(*)::int`
                })
                    .from(schema_1.tokenUsage)
                    .where((0, drizzle_orm_1.and)(...conditions))
                    .groupBy((0, drizzle_orm_1.sql) `date_trunc('day', ${schema_1.tokenUsage.createdAt})`)
                    .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `date_trunc('day', ${schema_1.tokenUsage.createdAt})`))
                    .limit(30);
                // Usage grouped by time (granularity) AND model for graphing
                // Note: date_trunc requires a string literal, not a parameterized value
                const dateTruncExpr = granularity === 'year'
                    ? (0, drizzle_orm_1.sql) `date_trunc('year', ${schema_1.tokenUsage.createdAt})`
                    : granularity === 'month'
                        ? (0, drizzle_orm_1.sql) `date_trunc('month', ${schema_1.tokenUsage.createdAt})`
                        : granularity === 'week'
                            ? (0, drizzle_orm_1.sql) `date_trunc('week', ${schema_1.tokenUsage.createdAt})`
                            : (0, drizzle_orm_1.sql) `date_trunc('day', ${schema_1.tokenUsage.createdAt})`;
                const usageByTimeByModel = yield db_1.db
                    .select({
                    date: (0, drizzle_orm_1.sql) `${dateTruncExpr}::date::text`,
                    model: schema_1.tokenUsage.model,
                    provider: schema_1.tokenUsage.provider,
                    totalInput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.inputTokens})::int`,
                    totalOutput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.outputTokens})::int`,
                    total: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.totalTokens})::int`
                })
                    .from(schema_1.tokenUsage)
                    .where((0, drizzle_orm_1.and)(...conditions))
                    .groupBy(dateTruncExpr, schema_1.tokenUsage.model, schema_1.tokenUsage.provider)
                    .orderBy(dateTruncExpr);
                // Add cost to graph data
                const graphData = usageByTimeByModel.map(record => ({
                    date: record.date,
                    model: record.model,
                    provider: record.provider,
                    totalTokens: record.total,
                    estimatedCost: this.calculateCost(record.model, record.totalInput, record.totalOutput)
                }));
                // Get individual logs with project info
                const detailedLogs = yield db_1.db
                    .select({
                    id: schema_1.tokenUsage.id,
                    createdAt: schema_1.tokenUsage.createdAt,
                    projectId: schema_1.tokenUsage.projectId,
                    projectName: schema_1.projects.name,
                    model: schema_1.tokenUsage.model,
                    provider: schema_1.tokenUsage.provider,
                    inputTokens: schema_1.tokenUsage.inputTokens,
                    outputTokens: schema_1.tokenUsage.outputTokens,
                    totalTokens: schema_1.tokenUsage.totalTokens,
                    context: schema_1.tokenUsage.context
                })
                    .from(schema_1.tokenUsage)
                    .leftJoin(schema_1.projects, (0, drizzle_orm_1.eq)(schema_1.tokenUsage.projectId, schema_1.projects.id))
                    .where((0, drizzle_orm_1.and)(...conditions))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.tokenUsage.createdAt))
                    .limit(limit)
                    .offset(offset);
                // Calculate costs for logs
                const logsWithCost = detailedLogs.map(log => ({
                    id: log.id,
                    createdAt: log.createdAt,
                    projectId: log.projectId,
                    projectName: log.projectName,
                    model: log.model,
                    provider: log.provider,
                    inputTokens: log.inputTokens || 0,
                    outputTokens: log.outputTokens || 0,
                    totalTokens: log.totalTokens || 0,
                    context: log.context,
                    estimatedCost: this.calculateCost(log.model, log.inputTokens || 0, log.outputTokens || 0)
                }));
                // Calculate total cost for projects (need to query by model for accurate cost)
                const projectCostQuery = yield db_1.db
                    .select({
                    projectId: schema_1.tokenUsage.projectId,
                    model: schema_1.tokenUsage.model,
                    provider: schema_1.tokenUsage.provider,
                    totalInput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.inputTokens})::int`,
                    totalOutput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.outputTokens})::int`
                })
                    .from(schema_1.tokenUsage)
                    .where((0, drizzle_orm_1.and)(...conditions))
                    .groupBy(schema_1.tokenUsage.projectId, schema_1.tokenUsage.model, schema_1.tokenUsage.provider);
                // Aggregate costs by project
                const projectCostMap = new Map();
                for (const record of projectCostQuery) {
                    const cost = this.calculateCost(record.model, record.totalInput || 0, record.totalOutput || 0);
                    const existingCost = projectCostMap.get(record.projectId) || 0;
                    projectCostMap.set(record.projectId, existingCost + cost);
                }
                // Apply costs to projects
                for (const project of projectsWithCost) {
                    project.estimatedCost = projectCostMap.get(project.projectId) || 0;
                }
                // Calculate costs for date records (similar approach)
                const dateCostQuery = yield db_1.db
                    .select({
                    date: (0, drizzle_orm_1.sql) `date_trunc('day', ${schema_1.tokenUsage.createdAt})::date::text`,
                    model: schema_1.tokenUsage.model,
                    provider: schema_1.tokenUsage.provider,
                    totalInput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.inputTokens})::int`,
                    totalOutput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.outputTokens})::int`
                })
                    .from(schema_1.tokenUsage)
                    .where((0, drizzle_orm_1.and)(...conditions))
                    .groupBy((0, drizzle_orm_1.sql) `date_trunc('day', ${schema_1.tokenUsage.createdAt})`, schema_1.tokenUsage.model, schema_1.tokenUsage.provider);
                const dateCostMap = new Map();
                for (const record of dateCostQuery) {
                    const cost = this.calculateCost(record.model, record.totalInput || 0, record.totalOutput || 0);
                    const existingCost = dateCostMap.get(record.date) || 0;
                    dateCostMap.set(record.date, existingCost + cost);
                }
                const datesWithCost = usageByDate.map(record => ({
                    date: record.date,
                    totalInput: record.totalInput || 0,
                    totalOutput: record.totalOutput || 0,
                    total: record.total || 0,
                    requestCount: record.requestCount || 0,
                    estimatedCost: dateCostMap.get(record.date) || 0
                }));
                // Get total count for pagination
                const countResult = yield db_1.db
                    .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                    .from(schema_1.tokenUsage)
                    .where((0, drizzle_orm_1.and)(...conditions));
                const totalCount = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
                return {
                    usageByProject: projectsWithCost,
                    usageByDate: datesWithCost,
                    usageByTimeByModel: graphData,
                    logs: logsWithCost,
                    pagination: {
                        total: totalCount,
                        limit,
                        offset,
                        hasMore: offset + limit < totalCount
                    }
                };
            }
            catch (error) {
                logger.error(`Failed to get detailed usage for user ${userId}:`, error);
                throw error;
            }
        });
    }
    /**
     * Get detailed global usage with filtering options (Admin only)
     * When userIds is provided, filters to only those users (for company-based filtering)
     */
    static getGlobalUsageDetails() {
        return __awaiter(this, arguments, void 0, function* (filters = {}) {
            var _a;
            try {
                const { startDate, endDate, projectId, model, limit = 50, offset = 0, granularity = 'day', userIds } = filters;
                // Build conditions
                const conditions = [];
                if (startDate)
                    conditions.push((0, drizzle_orm_1.gte)(schema_1.tokenUsage.createdAt, startDate));
                if (endDate)
                    conditions.push((0, drizzle_orm_1.lte)(schema_1.tokenUsage.createdAt, endDate));
                if (projectId)
                    conditions.push((0, drizzle_orm_1.eq)(schema_1.tokenUsage.projectId, projectId));
                if (model)
                    conditions.push((0, drizzle_orm_1.eq)(schema_1.tokenUsage.model, model));
                if (userIds && userIds.length > 0)
                    conditions.push((0, drizzle_orm_1.inArray)(schema_1.tokenUsage.userId, userIds));
                const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
                // Usage grouped by project
                const usageByProjectQuery = db_1.db
                    .select({
                    projectId: schema_1.tokenUsage.projectId,
                    projectName: schema_1.projects.name,
                    totalInput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.inputTokens})::int`,
                    totalOutput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.outputTokens})::int`,
                    total: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.totalTokens})::int`,
                    requestCount: (0, drizzle_orm_1.sql) `count(*)::int`,
                    firstUsed: (0, drizzle_orm_1.sql) `min(${schema_1.tokenUsage.createdAt})`,
                    lastUsed: (0, drizzle_orm_1.sql) `max(${schema_1.tokenUsage.createdAt})`
                })
                    .from(schema_1.tokenUsage)
                    .leftJoin(schema_1.projects, (0, drizzle_orm_1.eq)(schema_1.tokenUsage.projectId, schema_1.projects.id))
                    .groupBy(schema_1.tokenUsage.projectId, schema_1.projects.name)
                    .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.totalTokens})`));
                const usageByProject = whereClause
                    ? yield usageByProjectQuery.where(whereClause)
                    : yield usageByProjectQuery;
                // Usage grouped by date (day)
                const usageByDateQuery = db_1.db
                    .select({
                    date: (0, drizzle_orm_1.sql) `date_trunc('day', ${schema_1.tokenUsage.createdAt})::date::text`,
                    totalInput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.inputTokens})::int`,
                    totalOutput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.outputTokens})::int`,
                    total: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.totalTokens})::int`,
                    requestCount: (0, drizzle_orm_1.sql) `count(*)::int`
                })
                    .from(schema_1.tokenUsage)
                    .groupBy((0, drizzle_orm_1.sql) `date_trunc('day', ${schema_1.tokenUsage.createdAt})`)
                    .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `date_trunc('day', ${schema_1.tokenUsage.createdAt})`))
                    .limit(30);
                const usageByDate = whereClause
                    ? yield usageByDateQuery.where(whereClause)
                    : yield usageByDateQuery;
                // Usage grouped by time (granularity) AND model for graphing
                // Note: date_trunc requires a string literal, not a parameterized value
                const dateTruncExpr = granularity === 'year'
                    ? (0, drizzle_orm_1.sql) `date_trunc('year', ${schema_1.tokenUsage.createdAt})`
                    : granularity === 'month'
                        ? (0, drizzle_orm_1.sql) `date_trunc('month', ${schema_1.tokenUsage.createdAt})`
                        : granularity === 'week'
                            ? (0, drizzle_orm_1.sql) `date_trunc('week', ${schema_1.tokenUsage.createdAt})`
                            : (0, drizzle_orm_1.sql) `date_trunc('day', ${schema_1.tokenUsage.createdAt})`;
                const usageByTimeByModelQuery = db_1.db
                    .select({
                    date: (0, drizzle_orm_1.sql) `${dateTruncExpr}::date::text`,
                    model: schema_1.tokenUsage.model,
                    provider: schema_1.tokenUsage.provider,
                    totalInput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.inputTokens})::int`,
                    totalOutput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.outputTokens})::int`,
                    total: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.totalTokens})::int`
                })
                    .from(schema_1.tokenUsage)
                    .groupBy(dateTruncExpr, schema_1.tokenUsage.model, schema_1.tokenUsage.provider)
                    .orderBy(dateTruncExpr);
                const usageByTimeByModel = whereClause
                    ? yield usageByTimeByModelQuery.where(whereClause)
                    : yield usageByTimeByModelQuery;
                // Add cost to graph data
                const graphData = usageByTimeByModel.map(record => ({
                    date: record.date,
                    model: record.model,
                    provider: record.provider,
                    totalTokens: record.total,
                    estimatedCost: this.calculateCost(record.model, record.totalInput, record.totalOutput)
                }));
                // Get individual logs with project and user info
                const detailedLogsQuery = db_1.db
                    .select({
                    id: schema_1.tokenUsage.id,
                    createdAt: schema_1.tokenUsage.createdAt,
                    projectId: schema_1.tokenUsage.projectId,
                    projectName: schema_1.projects.name,
                    userId: schema_1.tokenUsage.userId,
                    userEmail: schema_1.users.email,
                    model: schema_1.tokenUsage.model,
                    provider: schema_1.tokenUsage.provider,
                    inputTokens: schema_1.tokenUsage.inputTokens,
                    outputTokens: schema_1.tokenUsage.outputTokens,
                    totalTokens: schema_1.tokenUsage.totalTokens,
                    context: schema_1.tokenUsage.context
                })
                    .from(schema_1.tokenUsage)
                    .leftJoin(schema_1.projects, (0, drizzle_orm_1.eq)(schema_1.tokenUsage.projectId, schema_1.projects.id))
                    .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.tokenUsage.userId, schema_1.users.id))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.tokenUsage.createdAt))
                    .limit(limit)
                    .offset(offset);
                const detailedLogs = whereClause
                    ? yield detailedLogsQuery.where(whereClause)
                    : yield detailedLogsQuery;
                // Calculate costs for logs
                const logsWithCost = detailedLogs.map(log => ({
                    id: log.id,
                    createdAt: log.createdAt,
                    projectId: log.projectId,
                    projectName: log.projectName,
                    userId: log.userId,
                    userEmail: log.userEmail,
                    model: log.model,
                    provider: log.provider,
                    inputTokens: log.inputTokens || 0,
                    outputTokens: log.outputTokens || 0,
                    totalTokens: log.totalTokens || 0,
                    context: log.context,
                    estimatedCost: this.calculateCost(log.model, log.inputTokens || 0, log.outputTokens || 0)
                }));
                // Calculate costs by project
                const projectCostQueryBase = db_1.db
                    .select({
                    projectId: schema_1.tokenUsage.projectId,
                    model: schema_1.tokenUsage.model,
                    totalInput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.inputTokens})::int`,
                    totalOutput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.outputTokens})::int`
                })
                    .from(schema_1.tokenUsage)
                    .groupBy(schema_1.tokenUsage.projectId, schema_1.tokenUsage.model);
                const projectCostQuery = whereClause
                    ? yield projectCostQueryBase.where(whereClause)
                    : yield projectCostQueryBase;
                const projectCostMap = new Map();
                for (const record of projectCostQuery) {
                    const cost = this.calculateCost(record.model, record.totalInput || 0, record.totalOutput || 0);
                    const existingCost = projectCostMap.get(record.projectId) || 0;
                    projectCostMap.set(record.projectId, existingCost + cost);
                }
                const projectsWithCost = usageByProject.map(record => ({
                    projectId: record.projectId,
                    projectName: record.projectName,
                    totalInput: record.totalInput || 0,
                    totalOutput: record.totalOutput || 0,
                    total: record.total || 0,
                    requestCount: record.requestCount || 0,
                    estimatedCost: projectCostMap.get(record.projectId) || 0,
                    firstUsed: record.firstUsed,
                    lastUsed: record.lastUsed
                }));
                // Calculate costs by date
                const dateCostQueryBase = db_1.db
                    .select({
                    date: (0, drizzle_orm_1.sql) `date_trunc('day', ${schema_1.tokenUsage.createdAt})::date::text`,
                    model: schema_1.tokenUsage.model,
                    totalInput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.inputTokens})::int`,
                    totalOutput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.outputTokens})::int`
                })
                    .from(schema_1.tokenUsage)
                    .groupBy((0, drizzle_orm_1.sql) `date_trunc('day', ${schema_1.tokenUsage.createdAt})`, schema_1.tokenUsage.model);
                const dateCostQuery = whereClause
                    ? yield dateCostQueryBase.where(whereClause)
                    : yield dateCostQueryBase;
                const dateCostMap = new Map();
                for (const record of dateCostQuery) {
                    const cost = this.calculateCost(record.model, record.totalInput || 0, record.totalOutput || 0);
                    const existingCost = dateCostMap.get(record.date) || 0;
                    dateCostMap.set(record.date, existingCost + cost);
                }
                const datesWithCost = usageByDate.map(record => ({
                    date: record.date,
                    totalInput: record.totalInput || 0,
                    totalOutput: record.totalOutput || 0,
                    total: record.total || 0,
                    requestCount: record.requestCount || 0,
                    estimatedCost: dateCostMap.get(record.date) || 0
                }));
                // Get total count for pagination
                const countQueryBase = db_1.db
                    .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                    .from(schema_1.tokenUsage);
                const countResult = whereClause
                    ? yield countQueryBase.where(whereClause)
                    : yield countQueryBase;
                const totalCount = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
                return {
                    usageByProject: projectsWithCost,
                    usageByDate: datesWithCost,
                    usageByTimeByModel: graphData,
                    logs: logsWithCost,
                    pagination: {
                        total: totalCount,
                        limit,
                        offset,
                        hasMore: offset + limit < totalCount
                    }
                };
            }
            catch (error) {
                logger.error('Failed to get global detailed usage:', error);
                throw error;
            }
        });
    }
    /**
     * Get usage for a company (all users in that company)
     */
    static getCompanyUsage(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Import companyUsers table
                const { companyUsers } = yield Promise.resolve().then(() => __importStar(require('../db/schema')));
                // Get all user IDs in this company
                const companyUsersList = yield db_1.db
                    .select({ userId: companyUsers.userId })
                    .from(companyUsers)
                    .where((0, drizzle_orm_1.eq)(companyUsers.companyId, companyId));
                const userIds = companyUsersList.map(u => u.userId);
                if (userIds.length === 0) {
                    return {
                        summary: [],
                        totals: { input: 0, output: 0, total: 0, requests: 0, cost: 0 },
                        recentLogs: []
                    };
                }
                // Aggregate by model for all company users
                const usageByModel = yield db_1.db
                    .select({
                    model: schema_1.tokenUsage.model,
                    provider: schema_1.tokenUsage.provider,
                    totalInput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.inputTokens})::int`,
                    totalOutput: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.outputTokens})::int`,
                    total: (0, drizzle_orm_1.sql) `sum(${schema_1.tokenUsage.totalTokens})::int`,
                    requestCount: (0, drizzle_orm_1.sql) `count(*)::int`
                })
                    .from(schema_1.tokenUsage)
                    .where((0, drizzle_orm_1.inArray)(schema_1.tokenUsage.userId, userIds))
                    .groupBy(schema_1.tokenUsage.model, schema_1.tokenUsage.provider);
                // Get recent logs
                const recentLogs = yield db_1.db
                    .select({
                    id: schema_1.tokenUsage.id,
                    createdAt: schema_1.tokenUsage.createdAt,
                    userId: schema_1.tokenUsage.userId,
                    userEmail: schema_1.users.email,
                    projectId: schema_1.tokenUsage.projectId,
                    model: schema_1.tokenUsage.model,
                    provider: schema_1.tokenUsage.provider,
                    inputTokens: schema_1.tokenUsage.inputTokens,
                    outputTokens: schema_1.tokenUsage.outputTokens,
                    totalTokens: schema_1.tokenUsage.totalTokens,
                    context: schema_1.tokenUsage.context
                })
                    .from(schema_1.tokenUsage)
                    .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.tokenUsage.userId, schema_1.users.id))
                    .where((0, drizzle_orm_1.inArray)(schema_1.tokenUsage.userId, userIds))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.tokenUsage.createdAt))
                    .limit(20);
                // Calculate totals and cost
                let totalCost = 0;
                const usageWithCost = usageByModel.map(record => {
                    const cost = this.calculateCost(record.model, record.totalInput || 0, record.totalOutput || 0);
                    totalCost += cost;
                    return Object.assign(Object.assign({}, record), { estimatedCost: cost });
                });
                const totals = usageWithCost.reduce((acc, curr) => ({
                    input: acc.input + (curr.totalInput || 0),
                    output: acc.output + (curr.totalOutput || 0),
                    total: acc.total + (curr.total || 0),
                    requests: acc.requests + (curr.requestCount || 0),
                    cost: acc.cost + (curr.estimatedCost || 0)
                }), { input: 0, output: 0, total: 0, requests: 0, cost: 0 });
                return {
                    summary: usageWithCost,
                    totals,
                    recentLogs
                };
            }
            catch (error) {
                logger.error(`Failed to get usage for company ${companyId}:`, error);
                throw error;
            }
        });
    }
    /**
     * Get user IDs for a company
     */
    static getCompanyUserIds(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyUsers } = yield Promise.resolve().then(() => __importStar(require('../db/schema')));
                const companyUsersList = yield db_1.db
                    .select({ userId: companyUsers.userId })
                    .from(companyUsers)
                    .where((0, drizzle_orm_1.eq)(companyUsers.companyId, companyId));
                return companyUsersList.map(u => u.userId);
            }
            catch (error) {
                logger.error(`Failed to get user IDs for company ${companyId}:`, error);
                return [];
            }
        });
    }
}
exports.TokenUsageService = TokenUsageService;
// Pricing per 1 Million tokens
TokenUsageService.MODEL_PRICING = {
    'gpt-4o': { input: 2.50, output: 10.00 },
    'claude-3-5-sonnet': { input: 3.00, output: 15.00 }, // Standard 3.5 Sonnet
    'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 }, // Fallback for the placeholder
    'gemini-2.0-flash': { input: 0.10, output: 0.40 },
    // Fallbacks
    'gpt-4': { input: 30.00, output: 60.00 },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
};
