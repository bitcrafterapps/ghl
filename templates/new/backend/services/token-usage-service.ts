import { db } from '../db';
import { tokenUsage, users, projects } from '../db/schema';
import { eq, sql, desc, and, gte, lte, isNotNull, inArray } from 'drizzle-orm';
import { LoggerFactory } from '../logger';

const logger = LoggerFactory.getLogger('TokenUsageService');

export interface TokenUsageRecord {
  userId: number;
  projectId?: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  context?: string;
}

export interface UsageDetailsFilter {
  startDate?: Date;
  endDate?: Date;
  projectId?: string;
  model?: string;
  granularity?: 'day' | 'week' | 'month' | 'year';
  limit?: number;
  offset?: number;
  userIds?: number[]; // For filtering by multiple users (e.g., company members)
}

export interface UsageByDateByModelRecord {
  date: string;
  model: string;
  provider: string;
  totalTokens: number;
  estimatedCost: number;
}

export interface UsageDetailRecord {
  date: string;
  projectId: string | null;
  projectName: string | null;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  requestCount: number;
  estimatedCost: number;
}

export interface UsageByProjectRecord {
  projectId: string | null;
  projectName: string | null;
  totalInput: number;
  totalOutput: number;
  total: number;
  requestCount: number;
  estimatedCost: number;
  firstUsed: Date;
  lastUsed: Date;
}

export interface UsageByDateRecord {
  date: string;
  totalInput: number;
  totalOutput: number;
  total: number;
  requestCount: number;
  estimatedCost: number;
}

export interface DetailedUsageLog {
  id: string;
  createdAt: Date;
  projectId: string | null;
  projectName: string | null;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  context: string | null;
  estimatedCost: number;
}

export class TokenUsageService {
  // Pricing per 1 Million tokens
  private static readonly MODEL_PRICING: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 2.50, output: 10.00 },
    'claude-3-5-sonnet': { input: 3.00, output: 15.00 }, // Standard 3.5 Sonnet
    'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 }, // Fallback for the placeholder
    'gemini-2.0-flash': { input: 0.10, output: 0.40 },
    // Fallbacks
    'gpt-4': { input: 30.00, output: 60.00 },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
  };

  /**
   * Record token usage to the database
   */
  static async recordUsage(record: TokenUsageRecord): Promise<void> {
    try {
      await db.insert(tokenUsage).values({
        userId: record.userId,
        projectId: record.projectId || null,
        model: record.model,
        provider: record.provider,
        inputTokens: record.inputTokens,
        outputTokens: record.outputTokens,
        totalTokens: record.totalTokens,
        context: record.context || null,
      });
    } catch (error) {
      logger.error('Failed to record token usage:', error);
      // Don't throw - token tracking should not break LLM calls
    }
  }

  private static calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    // Normalize model name roughly (remove dates if needed, or exact match)
    // For now, exact match or simple includes
    let pricing = this.MODEL_PRICING[model];
    
    if (!pricing) {
      // Try to find partial match defaults
      if (model.includes('gpt-4o')) pricing = this.MODEL_PRICING['gpt-4o'];
      else if (model.includes('sonnet')) pricing = this.MODEL_PRICING['claude-3-5-sonnet'];
      else if (model.includes('gemini') && model.includes('flash')) pricing = this.MODEL_PRICING['gemini-2.0-flash'];
      else if (model.includes('gpt-4')) pricing = this.MODEL_PRICING['gpt-4'];
      else pricing = { input: 0, output: 0 }; // Unknown model
    }

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    return inputCost + outputCost;
  }

  /**
   * Get usage summary for a specific user
   */
  static async getUserUsage(userId: number) {
    try {
      // Aggregate by model
      const usageByModel = await db
        .select({
          model: tokenUsage.model,
          provider: tokenUsage.provider,
          totalInput: sql<number>`sum(${tokenUsage.inputTokens})::int`,
          totalOutput: sql<number>`sum(${tokenUsage.outputTokens})::int`,
          total: sql<number>`sum(${tokenUsage.totalTokens})::int`,
          requestCount: sql<number>`count(*)::int`
        })
        .from(tokenUsage)
        .where(eq(tokenUsage.userId, userId))
        .groupBy(tokenUsage.model, tokenUsage.provider);

      // Get recent logs
      const recentLogs = await db
        .select()
        .from(tokenUsage)
        .where(eq(tokenUsage.userId, userId))
        .orderBy(desc(tokenUsage.createdAt))
        .limit(20);

      // Calculate totals and cost
      let totalCost = 0;
      
      const usageWithCost = usageByModel.map(record => {
        const cost = this.calculateCost(
          record.model, 
          record.totalInput || 0, 
          record.totalOutput || 0
        );
        totalCost += cost;
        return {
          ...record,
          estimatedCost: cost
        };
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
    } catch (error) {
      logger.error(`Failed to get usage for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get global usage summary (Super Admin)
   */
  static async getGlobalUsage() {
    try {
      // Global totals per model
      const usageByModel = await db
        .select({
          model: tokenUsage.model,
          provider: tokenUsage.provider,
          totalInput: sql<number>`sum(${tokenUsage.inputTokens})::int`,
          totalOutput: sql<number>`sum(${tokenUsage.outputTokens})::int`,
          total: sql<number>`sum(${tokenUsage.totalTokens})::int`,
          requestCount: sql<number>`count(*)::int`
        })
        .from(tokenUsage)
        .groupBy(tokenUsage.model, tokenUsage.provider);

      // Calculate costs per model
      let totalGlobalCost = 0;
      const usageWithCost = usageByModel.map(record => {
        const cost = this.calculateCost(
          record.model, 
          record.totalInput || 0, 
          record.totalOutput || 0
        );
        totalGlobalCost += cost;
        return {
          ...record,
          estimatedCost: cost
        };
      });

      // Top users by usage
      const topUsers = await db
        .select({
          userId: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          totalInput: sql<number>`sum(${tokenUsage.inputTokens})::int`,
          totalOutput: sql<number>`sum(${tokenUsage.outputTokens})::int`,
          totalUsage: sql<number>`sum(${tokenUsage.totalTokens})::int`,
          requestCount: sql<number>`count(${tokenUsage.id})::int`
        })
        .from(tokenUsage)
        .leftJoin(users, eq(tokenUsage.userId, users.id))
        .groupBy(users.id, users.email, users.firstName, users.lastName)
        .orderBy(desc(sql`sum(${tokenUsage.totalTokens})`))
        .limit(10);

      const grandTotal = usageWithCost.reduce((acc, curr) => acc + (curr.total || 0), 0);

      return {
        usageByModel: usageWithCost,
        topUsers,
        grandTotal,
        totalCost: totalGlobalCost
      };
    } catch (error) {
      logger.error('Failed to get global usage:', error);
      throw error;
    }
  }

  /**
   * Get detailed usage for a specific user with filtering options
   */
  static async getUserUsageDetails(userId: number, filters: UsageDetailsFilter = {}) {
    try {
      const { startDate, endDate, projectId, model, limit = 50, offset = 0, granularity = 'day' } = filters;

      // Build conditions
      const conditions = [eq(tokenUsage.userId, userId)];
      if (startDate) conditions.push(gte(tokenUsage.createdAt, startDate));
      if (endDate) conditions.push(lte(tokenUsage.createdAt, endDate));
      if (projectId) conditions.push(eq(tokenUsage.projectId, projectId));
      if (model) conditions.push(eq(tokenUsage.model, model));

      // Usage grouped by project
      const usageByProject = await db
        .select({
          projectId: tokenUsage.projectId,
          projectName: projects.name,
          totalInput: sql<number>`sum(${tokenUsage.inputTokens})::int`,
          totalOutput: sql<number>`sum(${tokenUsage.outputTokens})::int`,
          total: sql<number>`sum(${tokenUsage.totalTokens})::int`,
          requestCount: sql<number>`count(*)::int`,
          firstUsed: sql<Date>`min(${tokenUsage.createdAt})`,
          lastUsed: sql<Date>`max(${tokenUsage.createdAt})`
        })
        .from(tokenUsage)
        .leftJoin(projects, eq(tokenUsage.projectId, projects.id))
        .where(and(...conditions))
        .groupBy(tokenUsage.projectId, projects.name)
        .orderBy(desc(sql`sum(${tokenUsage.totalTokens})`));

      // Add cost calculations
      const projectsWithCost: UsageByProjectRecord[] = usageByProject.map(record => ({
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
      const usageByDate = await db
        .select({
          date: sql<string>`date_trunc('day', ${tokenUsage.createdAt})::date::text`,
          totalInput: sql<number>`sum(${tokenUsage.inputTokens})::int`,
          totalOutput: sql<number>`sum(${tokenUsage.outputTokens})::int`,
          total: sql<number>`sum(${tokenUsage.totalTokens})::int`,
          requestCount: sql<number>`count(*)::int`
        })
        .from(tokenUsage)
        .where(and(...conditions))
        .groupBy(sql`date_trunc('day', ${tokenUsage.createdAt})`)
        .orderBy(desc(sql`date_trunc('day', ${tokenUsage.createdAt})`))
        .limit(30);

      // Usage grouped by time (granularity) AND model for graphing
      // Note: date_trunc requires a string literal, not a parameterized value
      const dateTruncExpr = granularity === 'year'
        ? sql`date_trunc('year', ${tokenUsage.createdAt})`
        : granularity === 'month'
        ? sql`date_trunc('month', ${tokenUsage.createdAt})`
        : granularity === 'week'
        ? sql`date_trunc('week', ${tokenUsage.createdAt})`
        : sql`date_trunc('day', ${tokenUsage.createdAt})`;

      const usageByTimeByModel = await db
        .select({
          date: sql<string>`${dateTruncExpr}::date::text`,
          model: tokenUsage.model,
          provider: tokenUsage.provider,
          totalInput: sql<number>`sum(${tokenUsage.inputTokens})::int`,
          totalOutput: sql<number>`sum(${tokenUsage.outputTokens})::int`,
          total: sql<number>`sum(${tokenUsage.totalTokens})::int`
        })
        .from(tokenUsage)
        .where(and(...conditions))
        .groupBy(dateTruncExpr, tokenUsage.model, tokenUsage.provider)
        .orderBy(dateTruncExpr);

      // Add cost to graph data
      const graphData: UsageByDateByModelRecord[] = usageByTimeByModel.map(record => ({
        date: record.date,
        model: record.model,
        provider: record.provider,
        totalTokens: record.total,
        estimatedCost: this.calculateCost(record.model, record.totalInput, record.totalOutput)
      }));

      // Get individual logs with project info
      const detailedLogs = await db
        .select({
          id: tokenUsage.id,
          createdAt: tokenUsage.createdAt,
          projectId: tokenUsage.projectId,
          projectName: projects.name,
          model: tokenUsage.model,
          provider: tokenUsage.provider,
          inputTokens: tokenUsage.inputTokens,
          outputTokens: tokenUsage.outputTokens,
          totalTokens: tokenUsage.totalTokens,
          context: tokenUsage.context
        })
        .from(tokenUsage)
        .leftJoin(projects, eq(tokenUsage.projectId, projects.id))
        .where(and(...conditions))
        .orderBy(desc(tokenUsage.createdAt))
        .limit(limit)
        .offset(offset);

      // Calculate costs for logs
      const logsWithCost: DetailedUsageLog[] = detailedLogs.map(log => ({
        id: log.id,
        createdAt: log.createdAt!,
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
      const projectCostQuery = await db
        .select({
          projectId: tokenUsage.projectId,
          model: tokenUsage.model,
          provider: tokenUsage.provider,
          totalInput: sql<number>`sum(${tokenUsage.inputTokens})::int`,
          totalOutput: sql<number>`sum(${tokenUsage.outputTokens})::int`
        })
        .from(tokenUsage)
        .where(and(...conditions))
        .groupBy(tokenUsage.projectId, tokenUsage.model, tokenUsage.provider);

      // Aggregate costs by project
      const projectCostMap = new Map<string | null, number>();
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
      const dateCostQuery = await db
        .select({
          date: sql<string>`date_trunc('day', ${tokenUsage.createdAt})::date::text`,
          model: tokenUsage.model,
          provider: tokenUsage.provider,
          totalInput: sql<number>`sum(${tokenUsage.inputTokens})::int`,
          totalOutput: sql<number>`sum(${tokenUsage.outputTokens})::int`
        })
        .from(tokenUsage)
        .where(and(...conditions))
        .groupBy(sql`date_trunc('day', ${tokenUsage.createdAt})`, tokenUsage.model, tokenUsage.provider);

      const dateCostMap = new Map<string, number>();
      for (const record of dateCostQuery) {
        const cost = this.calculateCost(record.model, record.totalInput || 0, record.totalOutput || 0);
        const existingCost = dateCostMap.get(record.date) || 0;
        dateCostMap.set(record.date, existingCost + cost);
      }

      const datesWithCost: UsageByDateRecord[] = usageByDate.map(record => ({
        date: record.date,
        totalInput: record.totalInput || 0,
        totalOutput: record.totalOutput || 0,
        total: record.total || 0,
        requestCount: record.requestCount || 0,
        estimatedCost: dateCostMap.get(record.date) || 0
      }));

      // Get total count for pagination
      const countResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(tokenUsage)
        .where(and(...conditions));

      const totalCount = countResult[0]?.count || 0;

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
    } catch (error) {
      logger.error(`Failed to get detailed usage for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get detailed global usage with filtering options (Admin only)
   * When userIds is provided, filters to only those users (for company-based filtering)
   */
  static async getGlobalUsageDetails(filters: UsageDetailsFilter = {}) {
    try {
      const { startDate, endDate, projectId, model, limit = 50, offset = 0, granularity = 'day', userIds } = filters;

      // Build conditions
      const conditions: ReturnType<typeof eq>[] = [];
      if (startDate) conditions.push(gte(tokenUsage.createdAt, startDate));
      if (endDate) conditions.push(lte(tokenUsage.createdAt, endDate));
      if (projectId) conditions.push(eq(tokenUsage.projectId, projectId));
      if (model) conditions.push(eq(tokenUsage.model, model));
      if (userIds && userIds.length > 0) conditions.push(inArray(tokenUsage.userId, userIds));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Usage grouped by project
      const usageByProjectQuery = db
        .select({
          projectId: tokenUsage.projectId,
          projectName: projects.name,
          totalInput: sql<number>`sum(${tokenUsage.inputTokens})::int`,
          totalOutput: sql<number>`sum(${tokenUsage.outputTokens})::int`,
          total: sql<number>`sum(${tokenUsage.totalTokens})::int`,
          requestCount: sql<number>`count(*)::int`,
          firstUsed: sql<Date>`min(${tokenUsage.createdAt})`,
          lastUsed: sql<Date>`max(${tokenUsage.createdAt})`
        })
        .from(tokenUsage)
        .leftJoin(projects, eq(tokenUsage.projectId, projects.id))
        .groupBy(tokenUsage.projectId, projects.name)
        .orderBy(desc(sql`sum(${tokenUsage.totalTokens})`));

      const usageByProject = whereClause
        ? await usageByProjectQuery.where(whereClause)
        : await usageByProjectQuery;

      // Usage grouped by date (day)
      const usageByDateQuery = db
        .select({
          date: sql<string>`date_trunc('day', ${tokenUsage.createdAt})::date::text`,
          totalInput: sql<number>`sum(${tokenUsage.inputTokens})::int`,
          totalOutput: sql<number>`sum(${tokenUsage.outputTokens})::int`,
          total: sql<number>`sum(${tokenUsage.totalTokens})::int`,
          requestCount: sql<number>`count(*)::int`
        })
        .from(tokenUsage)
        .groupBy(sql`date_trunc('day', ${tokenUsage.createdAt})`)
        .orderBy(desc(sql`date_trunc('day', ${tokenUsage.createdAt})`))
        .limit(30);

      const usageByDate = whereClause
        ? await usageByDateQuery.where(whereClause)
        : await usageByDateQuery;

      // Usage grouped by time (granularity) AND model for graphing
      // Note: date_trunc requires a string literal, not a parameterized value
      const dateTruncExpr = granularity === 'year'
        ? sql`date_trunc('year', ${tokenUsage.createdAt})`
        : granularity === 'month'
        ? sql`date_trunc('month', ${tokenUsage.createdAt})`
        : granularity === 'week'
        ? sql`date_trunc('week', ${tokenUsage.createdAt})`
        : sql`date_trunc('day', ${tokenUsage.createdAt})`;

      const usageByTimeByModelQuery = db
        .select({
          date: sql<string>`${dateTruncExpr}::date::text`,
          model: tokenUsage.model,
          provider: tokenUsage.provider,
          totalInput: sql<number>`sum(${tokenUsage.inputTokens})::int`,
          totalOutput: sql<number>`sum(${tokenUsage.outputTokens})::int`,
          total: sql<number>`sum(${tokenUsage.totalTokens})::int`
        })
        .from(tokenUsage)
        .groupBy(dateTruncExpr, tokenUsage.model, tokenUsage.provider)
        .orderBy(dateTruncExpr);

      const usageByTimeByModel = whereClause
        ? await usageByTimeByModelQuery.where(whereClause)
        : await usageByTimeByModelQuery;

      // Add cost to graph data
      const graphData: UsageByDateByModelRecord[] = usageByTimeByModel.map(record => ({
        date: record.date,
        model: record.model,
        provider: record.provider,
        totalTokens: record.total,
        estimatedCost: this.calculateCost(record.model, record.totalInput, record.totalOutput)
      }));

      // Get individual logs with project and user info
      const detailedLogsQuery = db
        .select({
          id: tokenUsage.id,
          createdAt: tokenUsage.createdAt,
          projectId: tokenUsage.projectId,
          projectName: projects.name,
          userId: tokenUsage.userId,
          userEmail: users.email,
          model: tokenUsage.model,
          provider: tokenUsage.provider,
          inputTokens: tokenUsage.inputTokens,
          outputTokens: tokenUsage.outputTokens,
          totalTokens: tokenUsage.totalTokens,
          context: tokenUsage.context
        })
        .from(tokenUsage)
        .leftJoin(projects, eq(tokenUsage.projectId, projects.id))
        .leftJoin(users, eq(tokenUsage.userId, users.id))
        .orderBy(desc(tokenUsage.createdAt))
        .limit(limit)
        .offset(offset);

      const detailedLogs = whereClause
        ? await detailedLogsQuery.where(whereClause)
        : await detailedLogsQuery;

      // Calculate costs for logs
      const logsWithCost = detailedLogs.map(log => ({
        id: log.id,
        createdAt: log.createdAt!,
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
      const projectCostQueryBase = db
        .select({
          projectId: tokenUsage.projectId,
          model: tokenUsage.model,
          totalInput: sql<number>`sum(${tokenUsage.inputTokens})::int`,
          totalOutput: sql<number>`sum(${tokenUsage.outputTokens})::int`
        })
        .from(tokenUsage)
        .groupBy(tokenUsage.projectId, tokenUsage.model);

      const projectCostQuery = whereClause
        ? await projectCostQueryBase.where(whereClause)
        : await projectCostQueryBase;

      const projectCostMap = new Map<string | null, number>();
      for (const record of projectCostQuery) {
        const cost = this.calculateCost(record.model, record.totalInput || 0, record.totalOutput || 0);
        const existingCost = projectCostMap.get(record.projectId) || 0;
        projectCostMap.set(record.projectId, existingCost + cost);
      }

      const projectsWithCost: UsageByProjectRecord[] = usageByProject.map(record => ({
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
      const dateCostQueryBase = db
        .select({
          date: sql<string>`date_trunc('day', ${tokenUsage.createdAt})::date::text`,
          model: tokenUsage.model,
          totalInput: sql<number>`sum(${tokenUsage.inputTokens})::int`,
          totalOutput: sql<number>`sum(${tokenUsage.outputTokens})::int`
        })
        .from(tokenUsage)
        .groupBy(sql`date_trunc('day', ${tokenUsage.createdAt})`, tokenUsage.model);

      const dateCostQuery = whereClause
        ? await dateCostQueryBase.where(whereClause)
        : await dateCostQueryBase;

      const dateCostMap = new Map<string, number>();
      for (const record of dateCostQuery) {
        const cost = this.calculateCost(record.model, record.totalInput || 0, record.totalOutput || 0);
        const existingCost = dateCostMap.get(record.date) || 0;
        dateCostMap.set(record.date, existingCost + cost);
      }

      const datesWithCost: UsageByDateRecord[] = usageByDate.map(record => ({
        date: record.date,
        totalInput: record.totalInput || 0,
        totalOutput: record.totalOutput || 0,
        total: record.total || 0,
        requestCount: record.requestCount || 0,
        estimatedCost: dateCostMap.get(record.date) || 0
      }));

      // Get total count for pagination
      const countQueryBase = db
        .select({ count: sql<number>`count(*)::int` })
        .from(tokenUsage);

      const countResult = whereClause
        ? await countQueryBase.where(whereClause)
        : await countQueryBase;

      const totalCount = countResult[0]?.count || 0;

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
    } catch (error) {
      logger.error('Failed to get global detailed usage:', error);
      throw error;
    }
  }

  /**
   * Get usage for a company (all users in that company)
   */
  static async getCompanyUsage(companyId: number) {
    try {
      // Import companyUsers table
      const { companyUsers } = await import('../db/schema');

      // Get all user IDs in this company
      const companyUsersList = await db
        .select({ userId: companyUsers.userId })
        .from(companyUsers)
        .where(eq(companyUsers.companyId, companyId));

      const userIds = companyUsersList.map(u => u.userId);

      if (userIds.length === 0) {
        return {
          summary: [],
          totals: { input: 0, output: 0, total: 0, requests: 0, cost: 0 },
          recentLogs: []
        };
      }

      // Aggregate by model for all company users
      const usageByModel = await db
        .select({
          model: tokenUsage.model,
          provider: tokenUsage.provider,
          totalInput: sql<number>`sum(${tokenUsage.inputTokens})::int`,
          totalOutput: sql<number>`sum(${tokenUsage.outputTokens})::int`,
          total: sql<number>`sum(${tokenUsage.totalTokens})::int`,
          requestCount: sql<number>`count(*)::int`
        })
        .from(tokenUsage)
        .where(inArray(tokenUsage.userId, userIds))
        .groupBy(tokenUsage.model, tokenUsage.provider);

      // Get recent logs
      const recentLogs = await db
        .select({
          id: tokenUsage.id,
          createdAt: tokenUsage.createdAt,
          userId: tokenUsage.userId,
          userEmail: users.email,
          projectId: tokenUsage.projectId,
          model: tokenUsage.model,
          provider: tokenUsage.provider,
          inputTokens: tokenUsage.inputTokens,
          outputTokens: tokenUsage.outputTokens,
          totalTokens: tokenUsage.totalTokens,
          context: tokenUsage.context
        })
        .from(tokenUsage)
        .leftJoin(users, eq(tokenUsage.userId, users.id))
        .where(inArray(tokenUsage.userId, userIds))
        .orderBy(desc(tokenUsage.createdAt))
        .limit(20);

      // Calculate totals and cost
      let totalCost = 0;
      const usageWithCost = usageByModel.map(record => {
        const cost = this.calculateCost(
          record.model,
          record.totalInput || 0,
          record.totalOutput || 0
        );
        totalCost += cost;
        return {
          ...record,
          estimatedCost: cost
        };
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
    } catch (error) {
      logger.error(`Failed to get usage for company ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Get user IDs for a company
   */
  static async getCompanyUserIds(companyId: number): Promise<number[]> {
    try {
      const { companyUsers } = await import('../db/schema');
      const companyUsersList = await db
        .select({ userId: companyUsers.userId })
        .from(companyUsers)
        .where(eq(companyUsers.companyId, companyId));

      return companyUsersList.map(u => u.userId);
    } catch (error) {
      logger.error(`Failed to get user IDs for company ${companyId}:`, error);
      return [];
    }
  }
}
