import { Router, Request, Response } from 'express';
import { db } from '../../db';
import { emailTemplates, emailLogs, users } from '../../db/schema';
import { eq, desc, sql, and, like, count } from 'drizzle-orm';
import { LoggerFactory } from '../../logger';
import { authenticate } from '../../middleware/v1/auth.middleware';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { EmailService } from '../../services/email.service';
import { UserService } from '../../services/user.service';

const logger = LoggerFactory.getLogger('EmailsAPI');
const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin check middleware
const requireAdmin = async (req: Request, res: Response, next: Function) => {
  const userId = req.user?.userId;
  logger.info(`[AuthCheck] Checking admin access for userId: ${userId}`);

  if (!userId) {
    return res.status(401).json(createErrorResponse('UNAUTHORIZED', 'Authentication required'));
  }

  // Use UserService to get consistent user object with defaults
  const user = await UserService.getUserById(Number(userId));
  logger.info(`[AuthCheck] UserService fetch for userId ${userId}: ${user ? 'Found' : 'Not Found'}, Roles: ${JSON.stringify(user?.roles)}`);

  const hasRole = user?.roles?.some((role: string) => 
    role === 'Admin' || 
    role === 'Site Admin' || 
    role.toLowerCase() === 'admin' || 
    role.toLowerCase() === 'site admin'
  );

  if (!user || !hasRole) {
    logger.warn(`[AuthCheck] Access Denied. User roles: ${JSON.stringify(user?.roles)}`);
    return res.status(403).json(createErrorResponse('FORBIDDEN', 'Admin access required'));
  }

  next();
};

/*
 * @swagger
 * /emails/templates:
 *   get:
 *     summary: List all email templates
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    console.log(`[EmailsAPI] GET /templates - Checking access for userId: ${userId}`);

    if (!userId) {
      return res.status(401).json(createErrorResponse('UNAUTHORIZED', 'Authentication required'));
    }

    const user = await UserService.getUserById(Number(userId));
    console.log(`[EmailsAPI] User found: ${!!user}, Roles: ${JSON.stringify(user?.roles)}`);

    const isAdmin = user?.roles?.some((role: string) => 
      role === 'Admin' || 
      role === 'Site Admin' ||
      role === 'admin' ||
      role === 'site admin'
    );

    if (!isAdmin) {
      console.warn(`[EmailsAPI] Access Denied for userId ${userId}. Roles: ${JSON.stringify(user?.roles)}`);
      return res.status(403).json(createErrorResponse(
        'FORBIDDEN', 
        `Admin access required. Debug: UserID=${userId}, Roles=${JSON.stringify(user?.roles || [])}`
      ));
    }

    const templates = await EmailService.getTemplates();
    return res.json(createSuccessResponse({ templates }));
  } catch (error) {
    logger.error('Error fetching templates:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to fetch templates', error));
  }
});

/**
 * @swagger
 * /emails/templates/{key}:
 *   get:
 *     summary: Get a specific email template
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 */
router.get('/templates/:key', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const template = await EmailService.getTemplate(key);

    if (!template) {
      return res.status(404).json(createErrorResponse('NOT_FOUND', 'Template not found'));
    }

    return res.json(createSuccessResponse({ template }));
  } catch (error) {
    logger.error('Error fetching template:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to fetch template', error));
  }
});

/**
 * @swagger
 * /emails/templates:
 *   post:
 *     summary: Create a new email template
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 */
router.post('/templates', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { key, name, subject, body, enabled } = req.body;

    if (!key || !name || !subject || !body) {
      return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Key, name, subject, and body are required'));
    }

    // Check if key already exists
    const existing = await EmailService.getTemplate(key);
    if (existing) {
      return res.status(409).json(createErrorResponse('CONFLICT', 'Template with this key already exists'));
    }

    const template = await EmailService.createTemplate({ key, name, subject, body, enabled });
    logger.info(`Email template created: ${key}`);

    return res.status(201).json(createSuccessResponse({ template }));
  } catch (error) {
    logger.error('Error creating template:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to create template', error));
  }
});

/**
 * @swagger
 * /emails/templates/{key}:
 *   put:
 *     summary: Update an email template
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 */
router.put('/templates/:key', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { name, subject, body, enabled } = req.body;

    const existing = await EmailService.getTemplate(key);
    if (!existing) {
      return res.status(404).json(createErrorResponse('NOT_FOUND', 'Template not found'));
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (subject !== undefined) updates.subject = subject;
    if (body !== undefined) updates.body = body;
    if (enabled !== undefined) updates.enabled = enabled;

    const template = await EmailService.updateTemplate(key, updates);
    logger.info(`Email template updated: ${key}`);

    return res.json(createSuccessResponse({ template }));
  } catch (error) {
    logger.error('Error updating template:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to update template', error));
  }
});

/**
 * @swagger
 * /emails/send-test:
 *   post:
 *     summary: Send a test email
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 */
router.post('/send-test', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { templateKey, to, variables } = req.body;

    if (!templateKey || !to) {
      return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'templateKey and to are required'));
    }

    const result = await EmailService.sendTest(templateKey, to, variables);

    if (!result.success) {
      return res.status(400).json(createErrorResponse('EMAIL_FAILED', result.error || 'Failed to send email'));
    }

    logger.info(`Test email sent: ${templateKey} to ${to}`);
    return res.json(createSuccessResponse({ 
      message: 'Test email sent successfully',
      resendId: result.resendId 
    }));
  } catch (error) {
    logger.error('Error sending test email:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to send test email', error));
  }
});

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
router.get('/logs', requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const status = req.query.status as string;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(emailLogs.status, status));
    }
    if (search) {
      conditions.push(like(emailLogs.recipientEmail, `%${search}%`));
    }

    // Get logs
    let query = db.select()
      .from(emailLogs)
      .orderBy(desc(emailLogs.createdAt))
      .limit(limit)
      .offset(offset);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const logs = await query;

    // Get total count
    let countQuery = db.select({ count: count() }).from(emailLogs);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as any;
    }
    const [{ count: total }] = await countQuery;

    return res.json(createSuccessResponse({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }));
  } catch (error) {
    logger.error('Error fetching email logs:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to fetch email logs', error));
  }
});

/**
 * @swagger
 * /emails/stats:
 *   get:
 *     summary: Get email statistics
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    const [sentCount] = await db.select({ count: count() })
      .from(emailLogs)
      .where(eq(emailLogs.status, 'sent'));

    const [failedCount] = await db.select({ count: count() })
      .from(emailLogs)
      .where(eq(emailLogs.status, 'failed'));

    const [totalCount] = await db.select({ count: count() })
      .from(emailLogs);

    const [templateCount] = await db.select({ count: count() })
      .from(emailTemplates);

    return res.json(createSuccessResponse({
      stats: {
        sent: sentCount.count,
        failed: failedCount.count,
        total: totalCount.count,
        templates: templateCount.count
      }
    }));
  } catch (error) {
    logger.error('Error fetching email stats:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to fetch stats', error));
  }
});

logger.info('All email routes mounted successfully');
export default router;
