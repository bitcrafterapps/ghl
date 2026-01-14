import { Router, Request, Response } from 'express';
import { ReviewService } from '../../services/review.service';
import { UserService } from '../../services/user.service';
import { authenticate } from '../../middleware/v1/auth.middleware';
import { LoggerFactory } from '../../logger';
import { createSuccessResponse, createErrorResponse } from '../../types/api/response.types';
import {
  ReviewCreateDto,
  ReviewUpdateDto,
  ReviewQueryParams
} from '../../types/review.types';

const router = Router();
const logger = LoggerFactory.getLogger('ReviewsAPI');

// Middleware to log requests
router.use((req: Request, _res: Response, next) => {
  logger.debug(`Reviews endpoint accessed: ${req.method} ${req.path}`);
  next();
});

/**
 * GET /api/v1/reviews
 * Get all reviews with optional filtering (public endpoint for displaying on frontend)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    logger.debug('Getting reviews');

    const params: ReviewQueryParams = {
      status: req.query.status as any,
      source: req.query.source as any,
      featured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
      minRating: req.query.minRating ? parseInt(req.query.minRating as string) : undefined,
      maxRating: req.query.maxRating ? parseInt(req.query.maxRating as string) : undefined,
      companyId: req.query.companyId ? parseInt(req.query.companyId as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    };

    // For public access, only show published reviews
    if (!req.user) {
      params.status = 'published';
    }

    const reviews = await ReviewService.getReviews(params);
    logger.debug(`Retrieved ${reviews.length} reviews`);

    return res.json(createSuccessResponse(reviews));
  } catch (error) {
    logger.error('Error getting reviews:', error);
    return res.status(500).json(
      createErrorResponse(
        'REVIEWS_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch reviews'
      )
    );
  }
});

/**
 * GET /api/v1/reviews/featured
 * Get featured reviews for frontend display
 */
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;

    const reviews = await ReviewService.getFeaturedReviews(limit, companyId);
    return res.json(createSuccessResponse(reviews));
  } catch (error) {
    logger.error('Error getting featured reviews:', error);
    return res.status(500).json(
      createErrorResponse(
        'FEATURED_REVIEWS_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch featured reviews'
      )
    );
  }
});

/**
 * GET /api/v1/reviews/stats
 * Get review statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
    const stats = await ReviewService.getStats(companyId);
    return res.json(createSuccessResponse(stats));
  } catch (error) {
    logger.error('Error getting review stats:', error);
    return res.status(500).json(
      createErrorResponse(
        'REVIEW_STATS_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch review statistics'
      )
    );
  }
});

/**
 * GET /api/v1/reviews/services
 * Get distinct services that have reviews
 */
router.get('/services', async (req: Request, res: Response) => {
  try {
    const services = await ReviewService.getServices();
    return res.json(createSuccessResponse(services));
  } catch (error) {
    logger.error('Error getting services:', error);
    return res.status(500).json(
      createErrorResponse(
        'SERVICES_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch services'
      )
    );
  }
});

/**
 * GET /api/v1/reviews/:id
 * Get a single review by ID
 */
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Review ID must be a number')
      );
    }

    const review = await ReviewService.getReviewById(id);
    if (!review) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Review with ID ${id} not found`)
      );
    }

    // For public access, only show published reviews
    if (!req.user && review.status !== 'published') {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Review with ID ${id} not found`)
      );
    }

    return res.json(createSuccessResponse(review));
  } catch (error) {
    logger.error('Error getting review:', error);
    return res.status(500).json(
      createErrorResponse(
        'REVIEW_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch review'
      )
    );
  }
});

/**
 * POST /api/v1/reviews
 * Create a new review
 */
router.post('/', authenticate, async (req: Request<{}, {}, ReviewCreateDto>, res: Response) => {
  try {
    logger.debug('Creating new review');

    // Check if user has admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      logger.warn(`User ${req.user?.userId} attempted to create review without admin privileges`);
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to create reviews')
      );
    }

    // Validate required fields
    const requiredFields = ['reviewerName', 'text', 'rating'];
    const missingFields = requiredFields.filter(field => !req.body[field as keyof ReviewCreateDto]);

    if (missingFields.length > 0) {
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', `Missing required fields: ${missingFields.join(', ')}`)
      );
    }

    // Validate rating
    if (req.body.rating < 1 || req.body.rating > 5) {
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'Rating must be between 1 and 5')
      );
    }

    const review = await ReviewService.createReview(req.body, req.user!.userId);
    logger.debug(`Review created with ID: ${review.id}`);

    return res.status(201).json(createSuccessResponse(review));
  } catch (error) {
    logger.error('Error creating review:', error);
    return res.status(500).json(
      createErrorResponse(
        'REVIEW_CREATE_FAILED',
        error instanceof Error ? error.message : 'Failed to create review'
      )
    );
  }
});

/**
 * PUT /api/v1/reviews/:id
 * Update a review
 */
router.put('/:id', authenticate, async (req: Request<{ id: string }, {}, ReviewUpdateDto>, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Review ID must be a number')
      );
    }

    logger.debug(`Updating review with ID: ${id}`);

    // Check if user has admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      logger.warn(`User ${req.user?.userId} attempted to update review without admin privileges`);
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to update reviews')
      );
    }

    // Check if review exists
    const existingReview = await ReviewService.getReviewById(id);
    if (!existingReview) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Review with ID ${id} not found`)
      );
    }

    // Validate rating if provided
    if (req.body.rating !== undefined && (req.body.rating < 1 || req.body.rating > 5)) {
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'Rating must be between 1 and 5')
      );
    }

    const updatedReview = await ReviewService.updateReview(id, req.body, req.user!.userId);

    return res.json(createSuccessResponse(updatedReview));
  } catch (error) {
    logger.error('Error updating review:', error);
    return res.status(500).json(
      createErrorResponse(
        'REVIEW_UPDATE_FAILED',
        error instanceof Error ? error.message : 'Failed to update review'
      )
    );
  }
});

/**
 * DELETE /api/v1/reviews/:id
 * Delete a review
 */
router.delete('/:id', authenticate, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Review ID must be a number')
      );
    }

    logger.debug(`Deleting review with ID: ${id}`);

    // Check if user has admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      logger.warn(`User ${req.user?.userId} attempted to delete review without admin privileges`);
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to delete reviews')
      );
    }

    const deleted = await ReviewService.deleteReview(id, req.user!.userId);
    if (!deleted) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Review with ID ${id} not found`)
      );
    }

    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting review:', error);
    return res.status(500).json(
      createErrorResponse(
        'REVIEW_DELETE_FAILED',
        error instanceof Error ? error.message : 'Failed to delete review'
      )
    );
  }
});

/**
 * POST /api/v1/reviews/:id/google-business
 * Post review to Google Business Profile
 */
router.post('/:id/google-business', authenticate, async (req: Request<{ id: string }, {}, { accountId?: string; locationId?: string; accessToken?: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Review ID must be a number')
      );
    }

    logger.debug(`Posting review ${id} to Google Business`);

    // Check if user has admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to post to Google Business')
      );
    }

    // Validate required fields
    const { accountId, locationId, accessToken } = req.body;

    if (!accountId || !locationId || !accessToken) {
      return res.status(400).json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Google Business accountId, locationId, and accessToken are required'
        )
      );
    }

    const result = await ReviewService.postToGoogleBusiness(
      id,
      accountId,
      locationId,
      accessToken
    );

    if (!result.success) {
      return res.status(400).json(
        createErrorResponse('GOOGLE_BUSINESS_POST_FAILED', result.error || 'Failed to post to Google Business')
      );
    }

    return res.json(createSuccessResponse(result));
  } catch (error) {
    logger.error('Error posting to Google Business:', error);
    return res.status(500).json(
      createErrorResponse(
        'GOOGLE_BUSINESS_POST_FAILED',
        error instanceof Error ? error.message : 'Failed to post to Google Business'
      )
    );
  }
});

/**
 * PATCH /api/v1/reviews/:id/featured
 * Toggle featured status of a review
 */
router.patch('/:id/featured', authenticate, async (req: Request<{ id: string }, {}, { featured: boolean }>, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Review ID must be a number')
      );
    }

    // Check if user has admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to feature reviews')
      );
    }

    const updatedReview = await ReviewService.updateReview(
      id,
      { featured: req.body.featured },
      req.user!.userId
    );

    if (!updatedReview) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Review with ID ${id} not found`)
      );
    }

    return res.json(createSuccessResponse(updatedReview));
  } catch (error) {
    logger.error('Error toggling review featured status:', error);
    return res.status(500).json(
      createErrorResponse(
        'REVIEW_FEATURE_TOGGLE_FAILED',
        error instanceof Error ? error.message : 'Failed to toggle review featured status'
      )
    );
  }
});

logger.info('All review routes mounted successfully');

export default router;
