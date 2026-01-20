import { Router, Response, Request } from 'express';
import { authenticate } from '../../middleware/v1/auth.middleware';
import { ActivityService } from '../../services/activity.service';
import { createSuccessResponse, createErrorResponse } from '../../types/api/response.types';
import { LoggerFactory } from '../../logger';

const logger = LoggerFactory.getLogger('ActivityAPI');
const router = Router();

// Log middleware to debug route matching
router.use((req, res, next) => {
  logger.debug(`Activity request received: ${req.method} ${req.originalUrl}, params: ${JSON.stringify(req.params)}`);
  next();
});

// Log activity
router.post('/log', authenticate, async (req: Request, res: Response) => {
  try {
    logger.debug('Received activity log request:', req.body);
    
    const authReq = req as any;
    if (!authReq.user) {
      logger.error('No authenticated user found in request');
      return res.status(401).json(createErrorResponse(
        'AUTH_REQUIRED',
        'Authentication required'
      ));
    }
    
    const { type, action, title, entityId } = req.body;
    const userId = authReq.user.userId;

    logger.debug('Authenticated user ID:', userId);

    // Validate required fields
    if (!type || !action || !title || !entityId) {
      logger.error('Missing required fields:', { type, action, title, entityId });
      return res.status(400).json(createErrorResponse(
        'MISSING_FIELDS',
        'Missing required fields'
      ));
    }

    // Validate field values
    const validTypes = ['proposal', 'template', 'company', 'user'];
    const validActions = ['created', 'updated', 'deleted'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json(createErrorResponse(
        'INVALID_TYPE',
        `Invalid type. Must be one of: ${validTypes.join(', ')}`
      ));
    }
    
    if (!validActions.includes(action)) {
      return res.status(400).json(createErrorResponse(
        'INVALID_ACTION',
        `Invalid action. Must be one of: ${validActions.join(', ')}`
      ));
    }

    // Insert activity log using the service
    const activity = await ActivityService.logActivity({
      type,
      action,
      title,
      entityId,
      userId
    });

    logger.debug('Activity logged successfully:', activity);
    return res.status(201).json(createSuccessResponse({
      message: 'Activity logged successfully',
      activity
    }));
  } catch (error) {
    logger.error('Error logging activity:', error);
    return res.status(500).json(createErrorResponse(
      'SERVER_ERROR',
      'Failed to log activity'
    ));
  }
});

logger.info('All activity routes mounted successfully');

export default router; 