import { Router, Request, Response } from 'express';
import { CalendarService } from '../../services/calendar.service';
import { authenticate } from '../../middleware/v1/auth.middleware';
import { LoggerFactory } from '../../logger';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { getUserCompanyId } from '../../utils/company';
import { ERROR_CODES } from '../../types/private-pages.types';
import type { CalendarEventFilters } from '../../types/private-pages.types';
import type { CalendarEventStatus } from '../../db/schema';

const router = Router();
const logger = LoggerFactory.getLogger('CalendarAPI');

// Middleware to log calendar endpoint requests
router.use((req: Request, _res: Response, next) => {
  logger.debug(`Calendar endpoint accessed: ${req.method} ${req.path}`);
  next();
});

/**
 * GET /api/v1/calendar/events
 * List all events for a date range
 */
router.get('/events', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(
        createErrorResponse('AUTH_REQUIRED', 'Authentication required')
      );
    }
    
    const companyId = await getUserCompanyId(userId);
    if (!companyId) {
      return res.status(400).json(
        createErrorResponse('COMPANY_REQUIRED', 'User is not associated with a company')
      );
    }

    // Validate required date range
    if (!req.query.startDate || !req.query.endDate) {
      return res.status(400).json(
        createErrorResponse(ERROR_CODES.INVALID_DATE_RANGE, 'Start date and end date are required')
      );
    }

    const filters: CalendarEventFilters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      eventType: req.query.eventType as any,
      status: req.query.status as any,
      contactId: req.query.contactId as string,
      jobId: req.query.jobId as string,
      assignedUserId: req.query.assignedUserId ? parseInt(req.query.assignedUserId as string) : undefined,
      expand: req.query.expand === 'true'
    };

    const events = await CalendarService.getEvents(companyId, filters);
    return res.json(createSuccessResponse(events));
  } catch (error) {
    logger.error('Error getting calendar events:', error);
    return res.status(500).json(
      createErrorResponse(
        'EVENTS_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch events'
      )
    );
  }
});

/**
 * GET /api/v1/calendar/events/upcoming
 * Get upcoming events (next 7 days)
 */
router.get('/events/upcoming', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(
        createErrorResponse('AUTH_REQUIRED', 'Authentication required')
      );
    }
    
    const companyId = await getUserCompanyId(userId);
    if (!companyId) {
      return res.status(400).json(
        createErrorResponse('COMPANY_REQUIRED', 'User is not associated with a company')
      );
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const events = await CalendarService.getUpcomingEvents(companyId, limit);
    return res.json(createSuccessResponse(events));
  } catch (error) {
    logger.error('Error getting upcoming events:', error);
    return res.status(500).json(
      createErrorResponse(
        'EVENTS_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch upcoming events'
      )
    );
  }
});

/**
 * GET /api/v1/calendar/events/:id
 * Get a single event by ID
 */
router.get('/events/:id', authenticate, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(
        createErrorResponse('AUTH_REQUIRED', 'Authentication required')
      );
    }
    
    const companyId = await getUserCompanyId(userId);
    if (!companyId) {
      return res.status(400).json(
        createErrorResponse('COMPANY_REQUIRED', 'User is not associated with a company')
      );
    }

    const event = await CalendarService.getEventById(req.params.id, companyId);
    
    if (!event) {
      return res.status(404).json(
        createErrorResponse(ERROR_CODES.EVENT_NOT_FOUND, 'Event not found')
      );
    }

    return res.json(createSuccessResponse(event));
  } catch (error) {
    logger.error('Error getting event:', error);
    return res.status(500).json(
      createErrorResponse(
        ERROR_CODES.EVENT_NOT_FOUND,
        error instanceof Error ? error.message : 'Failed to fetch event'
      )
    );
  }
});

/**
 * POST /api/v1/calendar/events
 * Create a new event
 */
router.post('/events', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(
        createErrorResponse('AUTH_REQUIRED', 'Authentication required')
      );
    }
    
    const companyId = await getUserCompanyId(userId);
    if (!companyId) {
      return res.status(400).json(
        createErrorResponse('COMPANY_REQUIRED', 'User is not associated with a company')
      );
    }

    // Validate required fields
    if (!req.body.title || !req.body.startTime || !req.body.endTime) {
      return res.status(400).json(
        createErrorResponse(ERROR_CODES.VALIDATION_ERROR, 'Title, start time, and end time are required')
      );
    }

    // Validate date order
    if (new Date(req.body.startTime) > new Date(req.body.endTime)) {
      return res.status(400).json(
        createErrorResponse(ERROR_CODES.INVALID_DATE_RANGE, 'Start time must be before end time')
      );
    }

    const event = await CalendarService.createEvent(companyId, req.body);
    
    logger.debug('Event created:', event.id);
    return res.status(201).json(createSuccessResponse(event));
  } catch (error) {
    logger.error('Error creating event:', error);
    return res.status(500).json(
      createErrorResponse(
        ERROR_CODES.EVENT_CREATE_FAILED,
        error instanceof Error ? error.message : 'Failed to create event'
      )
    );
  }
});

/**
 * PUT /api/v1/calendar/events/:id
 * Update an existing event
 */
router.put('/events/:id', authenticate, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(
        createErrorResponse('AUTH_REQUIRED', 'Authentication required')
      );
    }
    
    const companyId = await getUserCompanyId(userId);
    if (!companyId) {
      return res.status(400).json(
        createErrorResponse('COMPANY_REQUIRED', 'User is not associated with a company')
      );
    }

    // Validate date order if both provided
    if (req.body.startTime && req.body.endTime) {
      if (new Date(req.body.startTime) > new Date(req.body.endTime)) {
        return res.status(400).json(
          createErrorResponse(ERROR_CODES.INVALID_DATE_RANGE, 'Start time must be before end time')
        );
      }
    }

    const event = await CalendarService.updateEvent(
      req.params.id,
      companyId,
      req.body
    );
    
    if (!event) {
      return res.status(404).json(
        createErrorResponse(ERROR_CODES.EVENT_NOT_FOUND, 'Event not found')
      );
    }

    logger.debug('Event updated:', event.id);
    return res.json(createSuccessResponse(event));
  } catch (error) {
    logger.error('Error updating event:', error);
    return res.status(500).json(
      createErrorResponse(
        ERROR_CODES.EVENT_UPDATE_FAILED,
        error instanceof Error ? error.message : 'Failed to update event'
      )
    );
  }
});

/**
 * PUT /api/v1/calendar/events/:id/status
 * Update event status
 */
router.put('/events/:id/status', authenticate, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(
        createErrorResponse('AUTH_REQUIRED', 'Authentication required')
      );
    }
    
    const companyId = await getUserCompanyId(userId);
    if (!companyId) {
      return res.status(400).json(
        createErrorResponse('COMPANY_REQUIRED', 'User is not associated with a company')
      );
    }

    if (!req.body.status) {
      return res.status(400).json(
        createErrorResponse(ERROR_CODES.VALIDATION_ERROR, 'Status is required')
      );
    }

    const event = await CalendarService.updateEventStatus(
      req.params.id,
      companyId,
      req.body.status as CalendarEventStatus
    );
    
    if (!event) {
      return res.status(404).json(
        createErrorResponse(ERROR_CODES.EVENT_NOT_FOUND, 'Event not found')
      );
    }

    logger.debug('Event status updated:', event.id, req.body.status);
    return res.json(createSuccessResponse(event));
  } catch (error) {
    logger.error('Error updating event status:', error);
    return res.status(500).json(
      createErrorResponse(
        ERROR_CODES.EVENT_UPDATE_FAILED,
        error instanceof Error ? error.message : 'Failed to update event status'
      )
    );
  }
});

/**
 * DELETE /api/v1/calendar/events/:id
 * Delete an event
 */
router.delete('/events/:id', authenticate, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(
        createErrorResponse('AUTH_REQUIRED', 'Authentication required')
      );
    }
    
    const companyId = await getUserCompanyId(userId);
    if (!companyId) {
      return res.status(400).json(
        createErrorResponse('COMPANY_REQUIRED', 'User is not associated with a company')
      );
    }

    const success = await CalendarService.deleteEvent(req.params.id, companyId);
    
    if (!success) {
      return res.status(404).json(
        createErrorResponse(ERROR_CODES.EVENT_NOT_FOUND, 'Event not found')
      );
    }

    logger.debug('Event deleted:', req.params.id);
    return res.json(createSuccessResponse({ deleted: true }));
  } catch (error) {
    logger.error('Error deleting event:', error);
    return res.status(500).json(
      createErrorResponse(
        ERROR_CODES.EVENT_DELETE_FAILED,
        error instanceof Error ? error.message : 'Failed to delete event'
      )
    );
  }
});

export default router;
