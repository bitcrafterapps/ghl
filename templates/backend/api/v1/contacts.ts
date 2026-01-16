import { Router, Request, Response } from 'express';
import { ContactService } from '../../services/contact.service';
import { authenticate } from '../../middleware/v1/auth.middleware';
import { LoggerFactory } from '../../logger';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { getUserCompanyId } from '../../utils/company';
import { ERROR_CODES } from '../../types/private-pages.types';
import type { ContactFilters, PaginationParams } from '../../types/private-pages.types';

const router = Router();
const logger = LoggerFactory.getLogger('ContactsAPI');

// Middleware to log contacts endpoint requests
router.use((req: Request, _res: Response, next) => {
  logger.debug(`Contacts endpoint accessed: ${req.method} ${req.path}`);
  next();
});

/**
 * GET /api/v1/contacts
 * List all contacts with pagination and filtering
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
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

    // Parse query parameters
    const filters: ContactFilters = {
      search: req.query.search as string,
      status: req.query.status as any,
      source: req.query.source as any,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined
    };

    const pagination: PaginationParams = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc'
    };

    const result = await ContactService.getContacts(companyId, filters, pagination);
    return res.json(createSuccessResponse(result));
  } catch (error) {
    logger.error('Error getting contacts:', error);
    return res.status(500).json(
      createErrorResponse(
        ERROR_CODES.CONTACT_CREATE_FAILED,
        error instanceof Error ? error.message : 'Failed to fetch contacts'
      )
    );
  }
});

/**
 * GET /api/v1/contacts/:id
 * Get a single contact by ID
 */
router.get('/:id', authenticate, async (req: Request<{ id: string }>, res: Response) => {
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

    const contact = await ContactService.getContactById(req.params.id, companyId);
    
    if (!contact) {
      return res.status(404).json(
        createErrorResponse(ERROR_CODES.CONTACT_NOT_FOUND, 'Contact not found')
      );
    }

    return res.json(createSuccessResponse(contact));
  } catch (error) {
    logger.error('Error getting contact:', error);
    return res.status(500).json(
      createErrorResponse(
        ERROR_CODES.CONTACT_NOT_FOUND,
        error instanceof Error ? error.message : 'Failed to fetch contact'
      )
    );
  }
});

/**
 * POST /api/v1/contacts
 * Create a new contact
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
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
    if (!req.body.firstName) {
      return res.status(400).json(
        createErrorResponse(ERROR_CODES.VALIDATION_ERROR, 'First name is required')
      );
    }

    const contact = await ContactService.createContact(companyId, req.body, userId);
    
    logger.debug('Contact created:', contact.id);
    return res.status(201).json(createSuccessResponse(contact));
  } catch (error) {
    logger.error('Error creating contact:', error);
    return res.status(500).json(
      createErrorResponse(
        ERROR_CODES.CONTACT_CREATE_FAILED,
        error instanceof Error ? error.message : 'Failed to create contact'
      )
    );
  }
});

/**
 * PUT /api/v1/contacts/:id
 * Update an existing contact
 */
router.put('/:id', authenticate, async (req: Request<{ id: string }>, res: Response) => {
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

    const contact = await ContactService.updateContact(
      req.params.id,
      companyId,
      req.body,
      userId
    );
    
    if (!contact) {
      return res.status(404).json(
        createErrorResponse(ERROR_CODES.CONTACT_NOT_FOUND, 'Contact not found')
      );
    }

    logger.debug('Contact updated:', contact.id);
    return res.json(createSuccessResponse(contact));
  } catch (error) {
    logger.error('Error updating contact:', error);
    return res.status(500).json(
      createErrorResponse(
        ERROR_CODES.CONTACT_UPDATE_FAILED,
        error instanceof Error ? error.message : 'Failed to update contact'
      )
    );
  }
});

/**
 * DELETE /api/v1/contacts/:id
 * Delete a contact
 */
router.delete('/:id', authenticate, async (req: Request<{ id: string }>, res: Response) => {
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

    const success = await ContactService.deleteContact(req.params.id, companyId);
    
    if (!success) {
      return res.status(404).json(
        createErrorResponse(ERROR_CODES.CONTACT_NOT_FOUND, 'Contact not found')
      );
    }

    logger.debug('Contact deleted:', req.params.id);
    return res.json(createSuccessResponse({ deleted: true }));
  } catch (error) {
    logger.error('Error deleting contact:', error);
    return res.status(500).json(
      createErrorResponse(
        ERROR_CODES.CONTACT_DELETE_FAILED,
        error instanceof Error ? error.message : 'Failed to delete contact'
      )
    );
  }
});

/**
 * GET /api/v1/contacts/:id/activities
 * Get contact activity history
 */
router.get('/:id/activities', authenticate, async (req: Request<{ id: string }>, res: Response) => {
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

    // First verify the contact exists and belongs to company
    const contact = await ContactService.getContactById(req.params.id, companyId);
    if (!contact) {
      return res.status(404).json(
        createErrorResponse(ERROR_CODES.CONTACT_NOT_FOUND, 'Contact not found')
      );
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const activities = await ContactService.getContactActivities(req.params.id, limit);
    
    return res.json(createSuccessResponse(activities));
  } catch (error) {
    logger.error('Error getting contact activities:', error);
    return res.status(500).json(
      createErrorResponse(
        'ACTIVITIES_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch activities'
      )
    );
  }
});

/**
 * POST /api/v1/contacts/:id/activities
 * Add an activity to a contact
 */
router.post('/:id/activities', authenticate, async (req: Request<{ id: string }>, res: Response) => {
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

    // Verify contact exists
    const contact = await ContactService.getContactById(req.params.id, companyId);
    if (!contact) {
      return res.status(404).json(
        createErrorResponse(ERROR_CODES.CONTACT_NOT_FOUND, 'Contact not found')
      );
    }

    // Validate required fields
    if (!req.body.type || !req.body.title) {
      return res.status(400).json(
        createErrorResponse(ERROR_CODES.VALIDATION_ERROR, 'Type and title are required')
      );
    }

    const activity = await ContactService.addContactActivity(req.params.id, userId, req.body);
    
    return res.status(201).json(createSuccessResponse(activity));
  } catch (error) {
    logger.error('Error adding contact activity:', error);
    return res.status(500).json(
      createErrorResponse(
        'ACTIVITY_CREATE_FAILED',
        error instanceof Error ? error.message : 'Failed to add activity'
      )
    );
  }
});

/**
 * GET /api/v1/contacts/:id/jobs
 * Get jobs linked to a contact
 */
router.get('/:id/jobs', authenticate, async (req: Request<{ id: string }>, res: Response) => {
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

    // Verify contact exists
    const contact = await ContactService.getContactById(req.params.id, companyId);
    if (!contact) {
      return res.status(404).json(
        createErrorResponse(ERROR_CODES.CONTACT_NOT_FOUND, 'Contact not found')
      );
    }

    const jobs = await ContactService.getContactJobs(req.params.id, companyId);
    
    return res.json(createSuccessResponse(jobs));
  } catch (error) {
    logger.error('Error getting contact jobs:', error);
    return res.status(500).json(
      createErrorResponse(
        'JOBS_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch jobs'
      )
    );
  }
});

export default router;
