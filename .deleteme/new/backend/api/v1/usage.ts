import { Router, Request, Response } from 'express';
import { TokenUsageService, UsageDetailsFilter } from '../../services/token-usage-service';
import { CompanyService } from '../../services/company.service';
import { LoggerFactory } from '../../logger';
import { requireRole, authenticate } from '../../middleware/v1/auth.middleware';

const router = Router();
const logger = LoggerFactory.getLogger('UsageApi');

// Helper to check if user is Site Admin
function isSiteAdmin(user: any): boolean {
  return user?.roles?.includes('Site Admin');
}

// Helper to check if user is Admin (company admin)
function isAdmin(user: any): boolean {
  return user?.roles?.includes('Admin');
}

// Helper to parse filter query params
function parseFilters(query: any): UsageDetailsFilter {
  const filters: UsageDetailsFilter = {};

  if (query.startDate) {
    const date = new Date(query.startDate);
    if (!isNaN(date.getTime())) filters.startDate = date;
  }

  if (query.granularity && ['day', 'week', 'month', 'year'].includes(query.granularity)) {
    filters.granularity = query.granularity;
  }

  if (query.endDate) {
    const date = new Date(query.endDate);
    if (!isNaN(date.getTime())) filters.endDate = date;
  }

  if (query.projectId && typeof query.projectId === 'string') {
    filters.projectId = query.projectId;
  }

  if (query.model && typeof query.model === 'string') {
    filters.model = query.model;
  }

  if (query.limit) {
    const limit = parseInt(query.limit, 10);
    if (!isNaN(limit) && limit > 0 && limit <= 100) filters.limit = limit;
  }

  if (query.offset) {
    const offset = parseInt(query.offset, 10);
    if (!isNaN(offset) && offset >= 0) filters.offset = offset;
  }

  return filters;
}

// Get current user's usage (summary)
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const usage = await TokenUsageService.getUserUsage(userId);
    res.json(usage);
  } catch (error) {
    logger.error('Failed to get user usage:', error);
    res.status(500).json({ error: 'Failed to retrieve usage data' });
  }
});

// Get current user's detailed usage with filtering
router.get('/me/details', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const filters = parseFilters(req.query);
    const usage = await TokenUsageService.getUserUsageDetails(userId, filters);
    res.json(usage);
  } catch (error) {
    logger.error('Failed to get user detailed usage:', error);
    res.status(500).json({ error: 'Failed to retrieve detailed usage data' });
  }
});

// Get global usage summary (Admin/Site Admin)
// Site Admin sees all usage, Admin sees only their company's usage
router.get('/global', authenticate, requireRole(['Admin', 'Site Admin']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Site Admin sees all global usage
    if (isSiteAdmin(user)) {
      const usage = await TokenUsageService.getGlobalUsage();
      return res.json(usage);
    }

    // Admin sees only their company's usage
    if (isAdmin(user)) {
      const companyId = await CompanyService.getUserCompanyId(user.userId);
      if (!companyId) {
        return res.json({
          summary: [],
          totals: { input: 0, output: 0, total: 0, requests: 0, cost: 0 },
          recentLogs: []
        });
      }
      const usage = await TokenUsageService.getCompanyUsage(companyId);
      return res.json(usage);
    }

    return res.status(403).json({ error: 'Insufficient permissions' });
  } catch (error) {
    logger.error('Failed to get global usage:', error);
    res.status(500).json({ error: 'Failed to retrieve global usage data' });
  }
});

// Get global detailed usage with filtering (Admin/Site Admin)
// Site Admin sees all usage, Admin sees only their company's usage
router.get('/global/details', authenticate, requireRole(['Admin', 'Site Admin']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const filters = parseFilters(req.query);

    // Site Admin sees all global usage
    if (isSiteAdmin(user)) {
      const usage = await TokenUsageService.getGlobalUsageDetails(filters);
      return res.json(usage);
    }

    // Admin sees only their company's usage
    if (isAdmin(user)) {
      const companyId = await CompanyService.getUserCompanyId(user.userId);
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
      const userIds = await TokenUsageService.getCompanyUserIds(companyId);
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
      const usage = await TokenUsageService.getGlobalUsageDetails(filters);
      return res.json(usage);
    }

    return res.status(403).json({ error: 'Insufficient permissions' });
  } catch (error) {
    logger.error('Failed to get global detailed usage:', error);
    res.status(500).json({ error: 'Failed to retrieve global detailed usage data' });
  }
});

export default router;
