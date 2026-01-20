import { Router, Request, Response } from 'express';
import { db } from '../../db';
import { transactions, users, TransactionStatus } from '../../db/schema';
import { authenticate as authenticateToken } from '../../middleware/auth';
import { isAdmin } from '../../middleware/admin';
import { LoggerFactory } from '../../logger';
import { createSuccessResponse, createErrorResponse } from '../../types/api/response.types';
import { eq, desc, and, or, ilike, gte, lte, sql, count, sum } from 'drizzle-orm';

const router = Router();
const logger = LoggerFactory.getLogger('TransactionsAPI');

/**
 * GET /api/v1/transactions
 * Get all transactions with filtering and search (Admin only)
 */
router.get('/', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      status,
      provider,
      planId,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const conditions = [];

    // Search by email, billing name, or transaction ID
    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          ilike(transactions.userEmail, searchTerm),
          ilike(transactions.billingName, searchTerm),
          ilike(transactions.providerTransactionId, searchTerm)
        )
      );
    }

    // Filter by status
    if (status && status !== 'all') {
      conditions.push(eq(transactions.status, status as TransactionStatus));
    }

    // Filter by provider
    if (provider && provider !== 'all') {
      conditions.push(eq(transactions.provider, provider as string));
    }

    // Filter by plan
    if (planId && planId !== 'all') {
      conditions.push(eq(transactions.planId, planId as string));
    }

    // Date range filters
    if (dateFrom) {
      conditions.push(gte(transactions.createdAt, new Date(dateFrom as string)));
    }
    if (dateTo) {
      const endDate = new Date(dateTo as string);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(transactions.createdAt, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(transactions)
      .where(whereClause);

    // Get transactions with user info
    const result = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        userEmail: transactions.userEmail,
        type: transactions.type,
        status: transactions.status,
        provider: transactions.provider,
        providerTransactionId: transactions.providerTransactionId,
        amount: transactions.amount,
        currency: transactions.currency,
        planId: transactions.planId,
        planName: transactions.planName,
        description: transactions.description,
        cardLast4: transactions.cardLast4,
        cardBrand: transactions.cardBrand,
        billingName: transactions.billingName,
        billingEmail: transactions.billingEmail,
        errorCode: transactions.errorCode,
        errorMessage: transactions.errorMessage,
        authorizedAt: transactions.authorizedAt,
        capturedAt: transactions.capturedAt,
        refundedAt: transactions.refundedAt,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        // Join user info
        userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as('userName')
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(whereClause)
      .orderBy(sortOrder === 'asc' ? transactions.createdAt : desc(transactions.createdAt))
      .limit(limitNum)
      .offset(offset);

    res.json(createSuccessResponse({
      transactions: result,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limitNum)
      }
    }));
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to fetch transactions'));
  }
});

/**
 * GET /api/v1/transactions/stats
 * Get transaction statistics (Admin only)
 */
router.get('/stats', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const conditions = [];
    if (dateFrom) {
      conditions.push(gte(transactions.createdAt, new Date(dateFrom as string)));
    }
    if (dateTo) {
      const endDate = new Date(dateTo as string);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(transactions.createdAt, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Total revenue (captured transactions only)
    const [revenueResult] = await db
      .select({
        totalRevenue: sum(transactions.amount),
        transactionCount: count()
      })
      .from(transactions)
      .where(whereClause ? and(whereClause, eq(transactions.status, 'captured')) : eq(transactions.status, 'captured'));

    // Transaction counts by status
    const statusCounts = await db
      .select({
        status: transactions.status,
        count: count()
      })
      .from(transactions)
      .where(whereClause)
      .groupBy(transactions.status);

    // Revenue by plan
    const revenueByPlan = await db
      .select({
        planId: transactions.planId,
        planName: transactions.planName,
        revenue: sum(transactions.amount),
        count: count()
      })
      .from(transactions)
      .where(whereClause ? and(whereClause, eq(transactions.status, 'captured')) : eq(transactions.status, 'captured'))
      .groupBy(transactions.planId, transactions.planName);

    // Revenue by provider
    const revenueByProvider = await db
      .select({
        provider: transactions.provider,
        revenue: sum(transactions.amount),
        count: count()
      })
      .from(transactions)
      .where(whereClause ? and(whereClause, eq(transactions.status, 'captured')) : eq(transactions.status, 'captured'))
      .groupBy(transactions.provider);

    // Recent transactions (last 7 days by default)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await db
      .select({
        date: sql<string>`DATE(${transactions.createdAt})`.as('date'),
        revenue: sum(transactions.amount),
        count: count()
      })
      .from(transactions)
      .where(and(
        gte(transactions.createdAt, sevenDaysAgo),
        eq(transactions.status, 'captured')
      ))
      .groupBy(sql`DATE(${transactions.createdAt})`)
      .orderBy(sql`DATE(${transactions.createdAt})`);

    res.json(createSuccessResponse({
      totalRevenue: Number(revenueResult?.totalRevenue || 0),
      totalTransactions: Number(revenueResult?.transactionCount || 0),
      statusBreakdown: statusCounts.reduce((acc, { status, count }) => {
        acc[status] = Number(count);
        return acc;
      }, {} as Record<string, number>),
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
  } catch (error) {
    logger.error('Error fetching transaction stats:', error);
    res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to fetch transaction statistics'));
  }
});

/**
 * GET /api/v1/transactions/:id
 * Get a single transaction by ID (Admin only)
 */
router.get('/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [transaction] = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        userEmail: transactions.userEmail,
        type: transactions.type,
        status: transactions.status,
        provider: transactions.provider,
        providerTransactionId: transactions.providerTransactionId,
        providerCustomerId: transactions.providerCustomerId,
        amount: transactions.amount,
        currency: transactions.currency,
        planId: transactions.planId,
        planName: transactions.planName,
        description: transactions.description,
        cardLast4: transactions.cardLast4,
        cardBrand: transactions.cardBrand,
        billingName: transactions.billingName,
        billingEmail: transactions.billingEmail,
        metadata: transactions.metadata,
        errorCode: transactions.errorCode,
        errorMessage: transactions.errorMessage,
        authorizedAt: transactions.authorizedAt,
        capturedAt: transactions.capturedAt,
        refundedAt: transactions.refundedAt,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        // Join user info
        userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as('userName'),
        userStatus: users.status
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(eq(transactions.id, id));

    if (!transaction) {
      return res.status(404).json(createErrorResponse('NOT_FOUND', 'Transaction not found'));
    }

    res.json(createSuccessResponse(transaction));
  } catch (error) {
    logger.error('Error fetching transaction:', error);
    res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to fetch transaction'));
  }
});

export default router;
