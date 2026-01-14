import { Router, Request, Response } from 'express';
import { db } from '../../db';
import { chatMessages, projects } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { LoggerFactory } from '../../logger';
import { authenticate } from '../../middleware/v1/auth.middleware';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';

const logger = LoggerFactory.getLogger('MessagesAPI');
const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /projects/{projectId}/messages:
 *   get:
 *     summary: Get chat messages for a project
 *     tags: [Messages]
 */
router.get('/projects/:projectId/messages', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(createErrorResponse('UNAUTHORIZED', 'Authentication required'));
    }

    const { projectId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    // Verify project ownership
    const [project] = await db.select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, Number(userId))));

    if (!project) {
      return res.status(404).json(createErrorResponse('NOT_FOUND', 'Project not found'));
    }

    const messages = await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.projectId, projectId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);

    // Return in chronological order
    return res.json(createSuccessResponse({ messages: messages.reverse() }));
  } catch (error) {
    logger.error('Error getting messages:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to get messages', error));
  }
});

/**
 * @swagger
 * /projects/{projectId}/messages:
 *   post:
 *     summary: Create a chat message
 *     tags: [Messages]
 */
router.post('/projects/:projectId/messages', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(createErrorResponse('UNAUTHORIZED', 'Authentication required'));
    }

    const { projectId } = req.params;
    const { role, content, metadata } = req.body;

    if (!content || !role) {
      return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Role and content are required'));
    }

    // Verify project ownership
    const [project] = await db.select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, Number(userId))));

    if (!project) {
      return res.status(404).json(createErrorResponse('NOT_FOUND', 'Project not found'));
    }

    const [message] = await db.insert(chatMessages).values({
      projectId,
      role: role.toLowerCase() as 'user' | 'assistant',
      content,
      metadata: metadata || null
    }).returning();

    logger.info(`Message created in project ${projectId}`);
    return res.status(201).json(createSuccessResponse({ message }));
  } catch (error) {
    logger.error('Error creating message:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to create message', error));
  }
});

logger.info('All message routes mounted successfully');
export default router;
