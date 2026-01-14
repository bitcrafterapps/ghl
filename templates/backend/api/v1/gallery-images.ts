import { Router, Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import { GalleryImageService } from '../../services/gallery-image.service';
import { UserService } from '../../services/user.service';
import { authenticate } from '../../middleware/v1/auth.middleware';
import { LoggerFactory } from '../../logger';
import { createSuccessResponse, createErrorResponse } from '../../types/api/response.types';
import {
  GalleryImageCreateDto,
  GalleryImageUpdateDto,
  GalleryImageQueryParams,
  GalleryImageReorderDto
} from '../../types/gallery-image.types';

const router = Router();
const logger = LoggerFactory.getLogger('GalleryImagesAPI');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.'));
    }
  }
});

// Multer error handling middleware
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof MulterError) {
    logger.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(
        createErrorResponse('FILE_TOO_LARGE', 'File size exceeds the 10MB limit')
      );
    }
    return res.status(400).json(
      createErrorResponse('UPLOAD_ERROR', err.message)
    );
  } else if (err) {
    logger.error('Upload error:', err);
    return res.status(400).json(
      createErrorResponse('UPLOAD_ERROR', err.message || 'Failed to upload file')
    );
  }
  next();
};

// Middleware to log requests
router.use((req: Request, _res: Response, next) => {
  logger.debug(`Gallery Images endpoint accessed: ${req.method} ${req.path}`);
  next();
});

/**
 * GET /api/v1/gallery-images
 * Get all gallery images with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    logger.debug('Getting gallery images');

    const params: GalleryImageQueryParams = {
      category: req.query.category as string | undefined,
      status: req.query.status as any,
      companyId: req.query.companyId ? parseInt(req.query.companyId as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    };

    const images = await GalleryImageService.getImages(params);
    logger.debug(`Retrieved ${images.length} gallery images`);

    return res.json(createSuccessResponse(images));
  } catch (error) {
    logger.error('Error getting gallery images:', error);
    return res.status(500).json(
      createErrorResponse(
        'GALLERY_IMAGES_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch gallery images'
      )
    );
  }
});

/**
 * GET /api/v1/gallery-images/categories
 * Get distinct categories
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await GalleryImageService.getCategories();
    return res.json(createSuccessResponse(categories));
  } catch (error) {
    logger.error('Error getting categories:', error);
    return res.status(500).json(
      createErrorResponse(
        'CATEGORIES_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch categories'
      )
    );
  }
});

/**
 * GET /api/v1/gallery-images/:id
 * Get a single gallery image by ID
 */
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Gallery image ID must be a number')
      );
    }

    const image = await GalleryImageService.getImageById(id);
    if (!image) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Gallery image with ID ${id} not found`)
      );
    }

    return res.json(createSuccessResponse(image));
  } catch (error) {
    logger.error('Error getting gallery image:', error);
    return res.status(500).json(
      createErrorResponse(
        'GALLERY_IMAGE_FETCH_FAILED',
        error instanceof Error ? error.message : 'Failed to fetch gallery image'
      )
    );
  }
});

/**
 * POST /api/v1/gallery-images
 * Upload a new gallery image
 */
router.post('/', authenticate, (req: Request, res: Response, next: NextFunction) => {
  // Use multer with custom error handling
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    logger.debug('Uploading new gallery image');
    logger.debug('Request body:', req.body);
    logger.debug('File received:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');

    // Check if user has admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      logger.warn(`User ${req.user?.userId} attempted to upload gallery image without admin privileges`);
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to upload gallery images')
      );
    }

    if (!req.file) {
      logger.error('No file in request');
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'No image file provided')
      );
    }

    const metadata: GalleryImageCreateDto = {
      title: req.body.title,
      description: req.body.description,
      altText: req.body.altText,
      category: req.body.category,
      tags: req.body.tags ? JSON.parse(req.body.tags) : undefined,
      sortOrder: req.body.sortOrder ? parseInt(req.body.sortOrder) : undefined,
      status: req.body.status,
      companyId: req.body.companyId ? parseInt(req.body.companyId) : undefined
    };

    logger.debug('Metadata prepared:', metadata);

    const image = await GalleryImageService.uploadImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      metadata,
      req.user!.userId
    );

    logger.debug(`Gallery image uploaded with ID: ${image.id}`);

    return res.status(201).json(createSuccessResponse(image));
  } catch (error) {
    logger.error('Error uploading gallery image:', error);
    return res.status(500).json(
      createErrorResponse(
        'GALLERY_IMAGE_UPLOAD_FAILED',
        error instanceof Error ? error.message : 'Failed to upload gallery image'
      )
    );
  }
});

/**
 * PUT /api/v1/gallery-images/:id
 * Update gallery image metadata
 */
router.put('/:id', authenticate, async (req: Request<{ id: string }, {}, GalleryImageUpdateDto>, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Gallery image ID must be a number')
      );
    }

    logger.debug(`Updating gallery image with ID: ${id}`);

    // Check if user has admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      logger.warn(`User ${req.user?.userId} attempted to update gallery image without admin privileges`);
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to update gallery images')
      );
    }

    // Check if image exists
    const existingImage = await GalleryImageService.getImageById(id);
    if (!existingImage) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Gallery image with ID ${id} not found`)
      );
    }

    const updatedImage = await GalleryImageService.updateImage(id, req.body, req.user!.userId);

    return res.json(createSuccessResponse(updatedImage));
  } catch (error) {
    logger.error('Error updating gallery image:', error);
    return res.status(500).json(
      createErrorResponse(
        'GALLERY_IMAGE_UPDATE_FAILED',
        error instanceof Error ? error.message : 'Failed to update gallery image'
      )
    );
  }
});

/**
 * DELETE /api/v1/gallery-images/:id
 * Delete a gallery image
 */
router.delete('/:id', authenticate, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Gallery image ID must be a number')
      );
    }

    logger.debug(`Deleting gallery image with ID: ${id}`);

    // Check if user has admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      logger.warn(`User ${req.user?.userId} attempted to delete gallery image without admin privileges`);
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to delete gallery images')
      );
    }

    const deleted = await GalleryImageService.deleteImage(id, req.user!.userId);
    if (!deleted) {
      return res.status(404).json(
        createErrorResponse('NOT_FOUND', `Gallery image with ID ${id} not found`)
      );
    }

    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting gallery image:', error);
    return res.status(500).json(
      createErrorResponse(
        'GALLERY_IMAGE_DELETE_FAILED',
        error instanceof Error ? error.message : 'Failed to delete gallery image'
      )
    );
  }
});

/**
 * POST /api/v1/gallery-images/reorder
 * Reorder gallery images
 */
router.post('/reorder', authenticate, async (req: Request<{}, {}, GalleryImageReorderDto>, res: Response) => {
  try {
    logger.debug('Reordering gallery images');

    // Check if user has admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to reorder gallery images')
      );
    }

    if (!req.body.images || !Array.isArray(req.body.images)) {
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'Images array is required')
      );
    }

    await GalleryImageService.reorderImages(req.body, req.user!.userId);

    return res.json(createSuccessResponse({ message: 'Images reordered successfully' }));
  } catch (error) {
    logger.error('Error reordering gallery images:', error);
    return res.status(500).json(
      createErrorResponse(
        'GALLERY_IMAGES_REORDER_FAILED',
        error instanceof Error ? error.message : 'Failed to reorder gallery images'
      )
    );
  }
});

/**
 * DELETE /api/v1/gallery-images/bulk
 * Bulk delete gallery images
 */
router.delete('/bulk', authenticate, async (req: Request<{}, {}, { ids: number[] }>, res: Response) => {
  try {
    logger.debug('Bulk deleting gallery images');

    // Check if user has Site Admin privileges
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.some(role => ['Site Admin'].includes(role))) {
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to bulk delete gallery images')
      );
    }

    if (!req.body.ids || !Array.isArray(req.body.ids)) {
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'IDs array is required')
      );
    }

    const deletedCount = await GalleryImageService.bulkDelete(req.body.ids, req.user!.userId);

    return res.json(createSuccessResponse({ deletedCount }));
  } catch (error) {
    logger.error('Error bulk deleting gallery images:', error);
    return res.status(500).json(
      createErrorResponse(
        'GALLERY_IMAGES_BULK_DELETE_FAILED',
        error instanceof Error ? error.message : 'Failed to bulk delete gallery images'
      )
    );
  }
});

logger.info('All gallery image routes mounted successfully');

export default router;
