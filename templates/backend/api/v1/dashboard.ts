import { Router, Response, Request } from 'express';
import { authenticate } from '../../middleware/v1/auth.middleware';
import { DashboardService } from '../../services/dashboard.service';
import { createSuccessResponse, createErrorResponse } from '../../types/api/response.types';
import { LoggerFactory } from '../../logger';
import { db } from '../../db';
import { activityLog } from '../../db/schema';
import { desc, sql, and, eq, ilike } from 'drizzle-orm';

const logger = LoggerFactory.getLogger('DashboardAPI');
const router = Router();

// Log middleware to debug route matching
router.use((req, res, next) => {
  logger.debug(`Dashboard request received: ${req.method} ${req.originalUrl}, params: ${JSON.stringify(req.params)}`);
  next();
});

// Get dashboard stats
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    logger.debug('Fetching dashboard stats');
    const authReq = req as any;
    
    if (!authReq.user) {
      logger.error('No authenticated user found in request');
      return res.status(401).json(createErrorResponse(
        'AUTH_REQUIRED',
        'Authentication required'
      ));
    }
    
    const isSiteAdmin = authReq.user.roles?.includes('Site Admin') ?? false;
    console.log(`[DashboardAPI] GET /stats - User ID: ${authReq.user.userId}, Roles: ${JSON.stringify(authReq.user.roles)}, isSiteAdmin: ${isSiteAdmin}`);
    logger.debug(`User ${authReq.user.userId} is admin: ${isSiteAdmin}`);
    
    const stats = await DashboardService.getDashboardStats(
      authReq.user.userId,
      isSiteAdmin
    );
    
    logger.debug('Dashboard stats retrieved:', stats);
    return res.json(createSuccessResponse(stats));
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    return res.status(500).json(createErrorResponse(
      'SERVER_ERROR',
      'Failed to fetch dashboard statistics'
    ));
  }
});

// Get generation activity by day for the last 7 days
router.get('/generation-activity', authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    if (!authReq.user) {
      return res.status(401).json(createErrorResponse('AUTH_REQUIRED', 'Authentication required'));
    }

    const userId = authReq.user.userId;
    const { generations } = await import('../../db/schema');
    
    // Get current date and calculate 7 days ago
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Query generations grouped by day
    const result = await db
      .select({
        date: sql<string>`DATE(${generations.createdAt})`,
        count: sql<number>`COUNT(*)::int`
      })
      .from(generations)
      .where(
        and(
          eq(generations.userId, userId),
          sql`${generations.createdAt} >= ${sevenDaysAgo.toISOString()}`
        )
      )
      .groupBy(sql`DATE(${generations.createdAt})`)
      .orderBy(sql`DATE(${generations.createdAt})`);

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
    return res.json(createSuccessResponse({ activityData }));
  } catch (error) {
    logger.error('Error fetching generation activity:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to fetch generation activity'));
  }
});

// Get recent changes
router.get('/recent-changes', authenticate, async (req: Request, res: Response) => {
  try {
    logger.debug('Fetching recent changes');
    
    const authReq = req as any;
    if (!authReq.user) {
      logger.error('No authenticated user found in request');
      return res.status(401).json(createErrorResponse(
        'AUTH_REQUIRED',
        'Authentication required'
      ));
    }
    
    // Parse and validate query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string;
    const action = req.query.action as string;
    const search = req.query.search as string;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;

    logger.debug('Query params:', { page, limit, type, action, search, userId });

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json(createErrorResponse(
        'INVALID_PAGINATION',
        'Invalid pagination parameters'
      ));
    }

    const offset = (page - 1) * limit;
    let conditions = [];

    // Always filter by userId if provided
    if (userId) {
      conditions.push(eq(activityLog.userId, userId));
    }
    
    if (type) {
      conditions.push(eq(activityLog.type, type));
    }
    
    if (action) {
      conditions.push(eq(activityLog.action, action));
    }
    
    if (search) {
      conditions.push(ilike(activityLog.title, `%${search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Execute queries in parallel for better performance
    const [activities, totalCount] = await Promise.all([
      db.select({
        id: activityLog.id,
        type: activityLog.type,
        action: activityLog.action,
        title: activityLog.title,
        timestamp: activityLog.createdAt,
        userId: activityLog.userId,
        isRead: activityLog.isRead
      })
      .from(activityLog)
      .where(whereClause)
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)
      .offset(offset),

      db.select({ count: sql<number>`count(*)` })
      .from(activityLog)
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
    return res.json(createSuccessResponse(responseData, paginationMeta));
  } catch (error) {
    logger.error('Error fetching recent changes:', error);
    return res.status(500).json(createErrorResponse(
      'SERVER_ERROR',
      'Failed to fetch recent changes'
    ));
  }
});

// Mark a single notification as read
router.patch('/notifications/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    if (!authReq.user) {
      return res.status(401).json(createErrorResponse('AUTH_REQUIRED', 'Authentication required'));
    }

    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      return res.status(400).json(createErrorResponse('INVALID_ID', 'Invalid notification ID'));
    }

    // Verify the notification belongs to the user
    const [notification] = await db.select()
      .from(activityLog)
      .where(and(
        eq(activityLog.id, notificationId),
        eq(activityLog.userId, authReq.user.userId)
      ));

    if (!notification) {
      return res.status(404).json(createErrorResponse('NOT_FOUND', 'Notification not found'));
    }

    // Mark as read
    await db.update(activityLog)
      .set({ isRead: true })
      .where(eq(activityLog.id, notificationId));

    logger.debug(`Notification ${notificationId} marked as read`);
    return res.json(createSuccessResponse({ success: true }));
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to mark notification as read'));
  }
});

// Mark all notifications as read for a user
router.patch('/notifications/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    if (!authReq.user) {
      return res.status(401).json(createErrorResponse('AUTH_REQUIRED', 'Authentication required'));
    }

    // Mark all user's notifications as read
    await db.update(activityLog)
      .set({ isRead: true })
      .where(eq(activityLog.userId, authReq.user.userId));

    logger.debug(`All notifications marked as read for user ${authReq.user.userId}`);
    return res.json(createSuccessResponse({ success: true }));
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to mark all notifications as read'));
  }
});

logger.info('All dashboard routes mounted successfully');

export default router; 