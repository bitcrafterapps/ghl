import { Router, Request, Response } from 'express';
import { SiteContentService } from '../../services/site-content.service';
import { UserService } from '../../services/user.service';
import { authenticate } from '../../middleware/v1/auth.middleware';
import { LoggerFactory } from '../../logger';
import { createSuccessResponse, createErrorResponse } from '../../types/api/response.types';

const router = Router();
const logger = LoggerFactory.getLogger('SiteContentAPI');

// Middleware to log requests
router.use((req: Request, _res: Response, next) => {
  logger.debug(`Site content endpoint accessed: ${req.method} ${req.path}`);
  next();
});

/**
 * GET /api/v1/site-content
 * Get all content for a site with optional filtering
 * Requires siteId header
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const siteId = (req.headers['x-site-id'] as string) || (req.query.siteId as string);

    if (!siteId) {
      return res.status(400).json(
        createErrorResponse('MISSING_SITE_ID', 'Site ID is required')
      );
    }

    const params = {
      siteId,
      page: req.query.page as string | undefined,
      section: req.query.section as string | undefined
    };

    const content = await SiteContentService.getContent(params);
    return res.json(createSuccessResponse(content));
  } catch (error) {
    logger.error('Error getting site content:', error);
    return res.status(500).json(
      createErrorResponse(
        'CONTENT_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch content'
      )
    );
  }
});

/**
 * GET /api/v1/site-content/sections
 * Get available pages and sections for a site
 */
router.get('/sections', async (req: Request, res: Response) => {
  try {
    const siteId = (req.headers['x-site-id'] as string) || (req.query.siteId as string);

    if (!siteId) {
      return res.status(400).json(
        createErrorResponse('MISSING_SITE_ID', 'Site ID is required')
      );
    }

    const sections = await SiteContentService.getAvailableSections(siteId);
    return res.json(createSuccessResponse(sections));
  } catch (error) {
    logger.error('Error getting available sections:', error);
    return res.status(500).json(
      createErrorResponse(
        'SECTIONS_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch sections'
      )
    );
  }
});

/**
 * GET /api/v1/site-content/:page/:section
 * Get content for a specific section
 */
router.get('/:page/:section', async (req: Request, res: Response) => {
  try {
    const siteId = (req.headers['x-site-id'] as string) || (req.query.siteId as string);
    const { page, section } = req.params;

    if (!siteId) {
      return res.status(400).json(
        createErrorResponse('MISSING_SITE_ID', 'Site ID is required')
      );
    }

    const content = await SiteContentService.getSectionContent(siteId, page, section);
    return res.json(createSuccessResponse(content));
  } catch (error) {
    logger.error('Error getting section content:', error);
    return res.status(500).json(
      createErrorResponse(
        'SECTION_CONTENT_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch section content'
      )
    );
  }
});

/**
 * PUT /api/v1/site-content
 * Upsert content (create or update)
 * Requires admin privileges
 */
router.put('/', authenticate, async (req: Request, res: Response) => {
  try {
    // Check admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to manage content')
      );
    }

    const siteId = req.body.siteId || (req.headers['x-site-id'] as string);

    if (!siteId) {
      return res.status(400).json(
        createErrorResponse('MISSING_SITE_ID', 'Site ID is required')
      );
    }

    const { page, section, contentKey, content } = req.body;

    // Validate required fields
    if (!page || !section || !contentKey || content === undefined) {
      return res.status(400).json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Missing required fields: page, section, contentKey, and content are required'
        )
      );
    }

    const result = await SiteContentService.upsertContent({
      siteId,
      page,
      section,
      contentKey,
      content
    });

    return res.json(createSuccessResponse(result));
  } catch (error) {
    logger.error('Error upserting content:', error);
    return res.status(500).json(
      createErrorResponse(
        'CONTENT_UPSERT_FAILED',
        error instanceof Error ? error.message : 'Failed to save content'
      )
    );
  }
});

/**
 * PUT /api/v1/site-content/bulk
 * Bulk upsert content for a section
 * Requires admin privileges
 */
router.put('/bulk', authenticate, async (req: Request, res: Response) => {
  try {
    // Check admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to manage content')
      );
    }

    const siteId = req.body.siteId || (req.headers['x-site-id'] as string);

    if (!siteId) {
      return res.status(400).json(
        createErrorResponse('MISSING_SITE_ID', 'Site ID is required')
      );
    }

    const { page, section, items } = req.body;

    if (!page || !section || !Array.isArray(items)) {
      return res.status(400).json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Missing required fields: page, section, and items array are required'
        )
      );
    }

    const results = await SiteContentService.bulkUpsertContent(siteId, page, section, items);
    return res.json(createSuccessResponse(results));
  } catch (error) {
    logger.error('Error bulk upserting content:', error);
    return res.status(500).json(
      createErrorResponse(
        'CONTENT_BULK_UPSERT_FAILED',
        error instanceof Error ? error.message : 'Failed to save content'
      )
    );
  }
});

/**
 * DELETE /api/v1/site-content/:id
 * Delete content by ID
 * Requires admin privileges
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    // Check admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to delete content')
      );
    }

    const { id } = req.params;
    const deleted = await SiteContentService.deleteContent(id);

    if (!deleted) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Content with ID ${id} not found`)
      );
    }

    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting content:', error);
    return res.status(500).json(
      createErrorResponse(
        'CONTENT_DELETE_FAILED',
        error instanceof Error ? error.message : 'Failed to delete content'
      )
    );
  }
});

/**
 * DELETE /api/v1/site-content/:page/:section
 * Delete all content for a section
 * Requires admin privileges
 */
router.delete('/:page/:section', authenticate, async (req: Request, res: Response) => {
  try {
    // Check admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to delete content')
      );
    }

    const siteId = (req.headers['x-site-id'] as string) || (req.query.siteId as string);
    const { page, section } = req.params;

    if (!siteId) {
      return res.status(400).json(
        createErrorResponse('MISSING_SITE_ID', 'Site ID is required')
      );
    }

    const deletedCount = await SiteContentService.deleteSectionContent(siteId, page, section);
    return res.json(createSuccessResponse({ deletedCount }));
  } catch (error) {
    logger.error('Error deleting section content:', error);
    return res.status(500).json(
      createErrorResponse(
        'SECTION_CONTENT_DELETE_FAILED',
        error instanceof Error ? error.message : 'Failed to delete section content'
      )
    );
  }
});

logger.info('Site content routes mounted successfully');

export default router;
