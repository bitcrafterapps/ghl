import { Router, Request, Response } from 'express';
import { JobService } from '../../services/job.service';
import { authenticate } from '../../middleware/v1/auth.middleware';
import { LoggerFactory } from '../../logger';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { getUserCompanyId } from '../../utils/company';
import { ERROR_CODES } from '../../types/private-pages.types';
import type { JobFilters, PaginationParams } from '../../types/private-pages.types';
import type { JobStatus } from '../../db/schema';
import { JobPhotoService } from '../../services/job-photo.service';
import { upload } from '../../middleware/v1/upload.middleware';
import type { CreateJobPhotoDTO } from '../../types/private-pages.types';

const router = Router();
const logger = LoggerFactory.getLogger('JobsAPI');

// Middleware to log jobs endpoint requests
router.use((req: Request, _res: Response, next) => {
  logger.debug(`Jobs endpoint accessed: ${req.method} ${req.path}`);
  next();
});

/**
 * GET /api/v1/jobs
 * List all jobs with pagination and filtering
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
    const filters: JobFilters = {
      search: req.query.search as string,
      status: req.query.status as any,
      priority: req.query.priority as any,
      contactId: req.query.contactId as string,
      assignedUserId: req.query.assignedUserId ? parseInt(req.query.assignedUserId as string) : undefined,
      serviceType: req.query.serviceType as string,
      scheduledDateStart: req.query.scheduledDateStart as string,
      scheduledDateEnd: req.query.scheduledDateEnd as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined
    };

    const pagination: PaginationParams = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc'
    };

    const result = await JobService.getJobs(companyId, filters, pagination);
    return res.json(createSuccessResponse(result));
  } catch (error) {
    logger.error('Error getting jobs:', error);
    return res.status(500).json(
      createErrorResponse(
        ERROR_CODES.JOB_CREATE_FAILED,
        error instanceof Error ? error.message : 'Failed to fetch jobs'
      )
    );
  }
});

/**
 * GET /api/v1/jobs/kanban
 * Get jobs in Kanban format (grouped by status)
 */
router.get('/kanban', authenticate, async (req: Request, res: Response) => {
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

    const result = await JobService.getJobsKanban(companyId);
    return res.json(createSuccessResponse(result));
  } catch (error) {
    logger.error('Error getting jobs kanban:', error);
    return res.status(500).json(
      createErrorResponse(
        'KANBAN_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch kanban view'
      )
    );
  }
});

/**
 * GET /api/v1/jobs/:id
 * Get a single job by ID
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

    const job = await JobService.getJobById(req.params.id, companyId);
    
    if (!job) {
      return res.status(404).json(
        createErrorResponse(ERROR_CODES.JOB_NOT_FOUND, 'Job not found')
      );
    }

    return res.json(createSuccessResponse(job));
  } catch (error) {
    logger.error('Error getting job:', error);
    return res.status(500).json(
      createErrorResponse(
        ERROR_CODES.JOB_NOT_FOUND,
        error instanceof Error ? error.message : 'Failed to fetch job'
      )
    );
  }
});

/**
 * POST /api/v1/jobs
 * Create a new job
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
    if (!req.body.title) {
      return res.status(400).json(
        createErrorResponse(ERROR_CODES.VALIDATION_ERROR, 'Title is required')
      );
    }

    const job = await JobService.createJob(companyId, req.body, userId);
    
    logger.debug('Job created:', job.id);
    return res.status(201).json(createSuccessResponse(job));
  } catch (error) {
    logger.error('Error creating job:', error);
    return res.status(500).json(
      createErrorResponse(
        ERROR_CODES.JOB_CREATE_FAILED,
        error instanceof Error ? error.message : 'Failed to create job'
      )
    );
  }
});

/**
 * PUT /api/v1/jobs/:id
 * Update an existing job
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

    const job = await JobService.updateJob(
      req.params.id,
      companyId,
      req.body,
      userId
    );
    
    if (!job) {
      return res.status(404).json(
        createErrorResponse(ERROR_CODES.JOB_NOT_FOUND, 'Job not found')
      );
    }

    logger.debug('Job updated:', job.id);
    return res.json(createSuccessResponse(job));
  } catch (error) {
    logger.error('Error updating job:', error);
    return res.status(500).json(
      createErrorResponse(
        ERROR_CODES.JOB_UPDATE_FAILED,
        error instanceof Error ? error.message : 'Failed to update job'
      )
    );
  }
});

/**
 * PATCH /api/v1/jobs/:id/status
 * Update job status only
 */
router.patch('/:id/status', authenticate, async (req: Request<{ id: string }>, res: Response) => {
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

    const job = await JobService.updateJobStatus(
      req.params.id,
      companyId,
      req.body.status as JobStatus,
      userId
    );
    
    if (!job) {
      return res.status(404).json(
        createErrorResponse(ERROR_CODES.JOB_NOT_FOUND, 'Job not found')
      );
    }

    logger.debug('Job status updated:', job.id, req.body.status);
    return res.json(createSuccessResponse(job));
  } catch (error) {
    logger.error('Error updating job status:', error);
    return res.status(500).json(
      createErrorResponse(
        ERROR_CODES.JOB_UPDATE_FAILED,
        error instanceof Error ? error.message : 'Failed to update job status'
      )
    );
  }
});

/**
 * DELETE /api/v1/jobs/:id
 * Delete a job
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

    const success = await JobService.deleteJob(req.params.id, companyId);
    
    if (!success) {
      return res.status(404).json(
        createErrorResponse(ERROR_CODES.JOB_NOT_FOUND, 'Job not found')
      );
    }

    logger.debug('Job deleted:', req.params.id);
    return res.json(createSuccessResponse({ deleted: true }));
  } catch (error) {
    logger.error('Error deleting job:', error);
    return res.status(500).json(
      createErrorResponse(
        ERROR_CODES.JOB_DELETE_FAILED,
        error instanceof Error ? error.message : 'Failed to delete job'
      )
    );
  }
});

/**
 * GET /api/v1/jobs/:id/activities
 * Get job activity history
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

    // Verify job exists
    const job = await JobService.getJobById(req.params.id, companyId);
    if (!job) {
      return res.status(404).json(
        createErrorResponse(ERROR_CODES.JOB_NOT_FOUND, 'Job not found')
      );
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const activities = await JobService.getJobActivities(req.params.id, limit);
    
    return res.json(createSuccessResponse(activities));
  } catch (error) {
    logger.error('Error getting job activities:', error);
    return res.status(500).json(
      createErrorResponse(
        'ACTIVITIES_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch activities'
      )
    );
  }
});

/**
 * POST /api/v1/jobs/:id/activities
 * Add an activity to a job
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

    // Verify job exists
    const job = await JobService.getJobById(req.params.id, companyId);
    if (!job) {
      return res.status(404).json(
        createErrorResponse(ERROR_CODES.JOB_NOT_FOUND, 'Job not found')
      );
    }

    // Validate required fields
    if (!req.body.type || !req.body.title) {
      return res.status(400).json(
        createErrorResponse(ERROR_CODES.VALIDATION_ERROR, 'Type and title are required')
      );
    }

    const activity = await JobService.addJobActivity(req.params.id, userId, req.body);
    
    return res.status(201).json(createSuccessResponse(activity));
  } catch (error) {
    logger.error('Error adding job activity:', error);
    return res.status(500).json(
      createErrorResponse(
        'ACTIVITY_CREATE_FAILED',
        error instanceof Error ? error.message : 'Failed to add activity'
      )
    );
  }
});

/**
 * GET /api/v1/jobs/:id/photos
 * Get all photos for a job
 */
router.get('/:id/photos', authenticate, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(createErrorResponse('AUTH_REQUIRED', 'Authentication required'));
    }
    
    const companyId = await getUserCompanyId(userId);
    if (!companyId) {
      return res.status(400).json(createErrorResponse('COMPANY_REQUIRED', 'User is not associated with a company'));
    }

    const photos = await JobPhotoService.getJobPhotos(req.params.id, companyId);
    return res.json(createSuccessResponse(photos));
  } catch (error) {
    logger.error('Error getting job photos:', error);
    return res.status(500).json(createErrorResponse('PHOTOS_FETCH_FAILED', 'Failed to fetch photos'));
  }
});

/**
 * POST /api/v1/jobs/:id/photos
 * Upload a photo to a job
 */
router.post('/:id/photos', authenticate, upload.single('photo'), async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(createErrorResponse('AUTH_REQUIRED', 'Authentication required'));
    }
    
    const companyId = await getUserCompanyId(userId);
    if (!companyId) {
      return res.status(400).json(createErrorResponse('COMPANY_REQUIRED', 'User is not associated with a company'));
    }

    if (!req.file) {
      return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'No photo file provided'));
    }

    // In a real app, upload to blob storage here. For now, simulate with base64 data URI
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const mime = req.file.mimetype;
    const blobUrl = `data:${mime};base64,${b64}`;

    const dto: CreateJobPhotoDTO = {
      blobUrl,
      blobPathname: req.file.originalname,
      thumbnailUrl: blobUrl, // Using same for thumbnail for now
      title: req.body.title,
      description: req.body.description,
      photoType: req.body.photoType,
      fileSize: req.file.size,
      mimeType: mime,
      takenAt: new Date().toISOString()
    };

    const photo = await JobPhotoService.createJobPhoto(
      req.params.id,
      companyId,
      parseInt(String(userId)), // Ensure userId is number
      dto
    );
    
    return res.status(201).json(createSuccessResponse(photo));
  } catch (error) {
    logger.error('Error uploading job photo:', error);
    return res.status(500).json(createErrorResponse('PHOTO_UPLOAD_FAILED', 'Failed to upload photo'));
  }
});

/**
 * POST /api/v1/jobs/:id/photos/reorder
 * Reorder photos for a job
 */
router.post('/:id/photos/reorder', authenticate, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(createErrorResponse('AUTH_REQUIRED', 'Authentication required'));
    }
    
    const companyId = await getUserCompanyId(userId);
    if (!companyId) {
      return res.status(400).json(createErrorResponse('COMPANY_REQUIRED', 'User is not associated with a company'));
    }

    if (!req.body.photoIds || !Array.isArray(req.body.photoIds)) {
      return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'photoIds array is required'));
    }

    await JobPhotoService.reorderPhotos(
      req.params.id,
      companyId,
      req.body.photoIds
    );
    
    return res.json(createSuccessResponse({ success: true }));
  } catch (error) {
    logger.error('Error reordering photos:', error);
    return res.status(500).json(createErrorResponse('REORDER_FAILED', 'Failed to reorder photos'));
  }
});

/**
 * GET /api/v1/jobs/:id/photos/pairs
 * Get before/after pairs
 */
router.get('/:id/photos/pairs', authenticate, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(createErrorResponse('AUTH_REQUIRED', 'Authentication required'));
    }
    
    const companyId = await getUserCompanyId(userId);
    if (!companyId) {
      return res.status(400).json(createErrorResponse('COMPANY_REQUIRED', 'User is not associated with a company'));
    }

    const pairs = await JobPhotoService.getBeforeAfterPairs(req.params.id, companyId);
    return res.json(createSuccessResponse(pairs));
  } catch (error) {
    logger.error('Error getting photo pairs:', error);
    return res.status(500).json(createErrorResponse('PAIRS_FETCH_FAILED', 'Failed to fetch photo pairs'));
  }
});

/**
 * POST /api/v1/jobs/:id/photos/pairs
 * Create a before/after pair
 */
router.post('/:id/photos/pairs', authenticate, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(createErrorResponse('AUTH_REQUIRED', 'Authentication required'));
    }
    
    const companyId = await getUserCompanyId(userId);
    if (!companyId) {
      return res.status(400).json(createErrorResponse('COMPANY_REQUIRED', 'User is not associated with a company'));
    }

    const pair = await JobPhotoService.createBeforeAfterPair(
      req.params.id,
      companyId,
      req.body
    );
    
    return res.status(201).json(createSuccessResponse(pair));
  } catch (error) {
    logger.error('Error creating photo pair:', error);
    return res.status(500).json(createErrorResponse('PAIR_CREATE_FAILED', 'Failed to create photo pair'));
  }
});

export default router;
