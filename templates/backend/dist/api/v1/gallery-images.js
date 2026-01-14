"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const gallery_image_service_1 = require("../../services/gallery-image.service");
const user_service_1 = require("../../services/user.service");
const auth_middleware_1 = require("../../middleware/v1/auth.middleware");
const logger_1 = require("../../logger");
const response_types_1 = require("../../types/api/response.types");
const router = (0, express_1.Router)();
const logger = logger_1.LoggerFactory.getLogger('GalleryImagesAPI');
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.'));
        }
    }
});
// Middleware to log requests
router.use((req, _res, next) => {
    logger.debug(`Gallery Images endpoint accessed: ${req.method} ${req.path}`);
    next();
});
/**
 * GET /api/v1/gallery-images
 * Get all gallery images with optional filtering
 */
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.debug('Getting gallery images');
        const params = {
            category: req.query.category,
            status: req.query.status,
            companyId: req.query.companyId ? parseInt(req.query.companyId) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset) : undefined
        };
        const images = yield gallery_image_service_1.GalleryImageService.getImages(params);
        logger.debug(`Retrieved ${images.length} gallery images`);
        return res.json((0, response_types_1.createSuccessResponse)(images));
    }
    catch (error) {
        logger.error('Error getting gallery images:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('GALLERY_IMAGES_FETCH_FAILED', error instanceof Error ? error.message : 'Failed to fetch gallery images'));
    }
}));
/**
 * GET /api/v1/gallery-images/categories
 * Get distinct categories
 */
router.get('/categories', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield gallery_image_service_1.GalleryImageService.getCategories();
        return res.json((0, response_types_1.createSuccessResponse)(categories));
    }
    catch (error) {
        logger.error('Error getting categories:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('CATEGORIES_FETCH_FAILED', error instanceof Error ? error.message : 'Failed to fetch categories'));
    }
}));
/**
 * GET /api/v1/gallery-images/:id
 * Get a single gallery image by ID
 */
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_ID', 'Gallery image ID must be a number'));
        }
        const image = yield gallery_image_service_1.GalleryImageService.getImageById(id);
        if (!image) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', `Gallery image with ID ${id} not found`));
        }
        return res.json((0, response_types_1.createSuccessResponse)(image));
    }
    catch (error) {
        logger.error('Error getting gallery image:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('GALLERY_IMAGE_FETCH_FAILED', error instanceof Error ? error.message : 'Failed to fetch gallery image'));
    }
}));
/**
 * POST /api/v1/gallery-images
 * Upload a new gallery image
 */
router.post('/', auth_middleware_1.authenticate, upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        logger.debug('Uploading new gallery image');
        // Check if user has admin privileges
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
            logger.warn(`User ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.userId} attempted to upload gallery image without admin privileges`);
            return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to upload gallery images'));
        }
        if (!req.file) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'No image file provided'));
        }
        const metadata = {
            title: req.body.title,
            description: req.body.description,
            altText: req.body.altText,
            category: req.body.category,
            tags: req.body.tags ? JSON.parse(req.body.tags) : undefined,
            sortOrder: req.body.sortOrder ? parseInt(req.body.sortOrder) : undefined,
            status: req.body.status,
            companyId: req.body.companyId ? parseInt(req.body.companyId) : undefined
        };
        const image = yield gallery_image_service_1.GalleryImageService.uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype, metadata, req.user.userId);
        logger.debug(`Gallery image uploaded with ID: ${image.id}`);
        return res.status(201).json((0, response_types_1.createSuccessResponse)(image));
    }
    catch (error) {
        logger.error('Error uploading gallery image:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('GALLERY_IMAGE_UPLOAD_FAILED', error instanceof Error ? error.message : 'Failed to upload gallery image'));
    }
}));
/**
 * PUT /api/v1/gallery-images/:id
 * Update gallery image metadata
 */
router.put('/:id', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_ID', 'Gallery image ID must be a number'));
        }
        logger.debug(`Updating gallery image with ID: ${id}`);
        // Check if user has admin privileges
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
            logger.warn(`User ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.userId} attempted to update gallery image without admin privileges`);
            return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to update gallery images'));
        }
        // Check if image exists
        const existingImage = yield gallery_image_service_1.GalleryImageService.getImageById(id);
        if (!existingImage) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', `Gallery image with ID ${id} not found`));
        }
        const updatedImage = yield gallery_image_service_1.GalleryImageService.updateImage(id, req.body, req.user.userId);
        return res.json((0, response_types_1.createSuccessResponse)(updatedImage));
    }
    catch (error) {
        logger.error('Error updating gallery image:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('GALLERY_IMAGE_UPDATE_FAILED', error instanceof Error ? error.message : 'Failed to update gallery image'));
    }
}));
/**
 * DELETE /api/v1/gallery-images/:id
 * Delete a gallery image
 */
router.delete('/:id', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_ID', 'Gallery image ID must be a number'));
        }
        logger.debug(`Deleting gallery image with ID: ${id}`);
        // Check if user has admin privileges
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
            logger.warn(`User ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.userId} attempted to delete gallery image without admin privileges`);
            return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to delete gallery images'));
        }
        const deleted = yield gallery_image_service_1.GalleryImageService.deleteImage(id, req.user.userId);
        if (!deleted) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', `Gallery image with ID ${id} not found`));
        }
        return res.status(204).send();
    }
    catch (error) {
        logger.error('Error deleting gallery image:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('GALLERY_IMAGE_DELETE_FAILED', error instanceof Error ? error.message : 'Failed to delete gallery image'));
    }
}));
/**
 * POST /api/v1/gallery-images/reorder
 * Reorder gallery images
 */
router.post('/reorder', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.debug('Reordering gallery images');
        // Check if user has admin privileges
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
            return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to reorder gallery images'));
        }
        if (!req.body.images || !Array.isArray(req.body.images)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Images array is required'));
        }
        yield gallery_image_service_1.GalleryImageService.reorderImages(req.body, req.user.userId);
        return res.json((0, response_types_1.createSuccessResponse)({ message: 'Images reordered successfully' }));
    }
    catch (error) {
        logger.error('Error reordering gallery images:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('GALLERY_IMAGES_REORDER_FAILED', error instanceof Error ? error.message : 'Failed to reorder gallery images'));
    }
}));
/**
 * DELETE /api/v1/gallery-images/bulk
 * Bulk delete gallery images
 */
router.delete('/bulk', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.debug('Bulk deleting gallery images');
        // Check if user has Site Admin privileges
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.some(role => ['Site Admin'].includes(role))) {
            return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to bulk delete gallery images'));
        }
        if (!req.body.ids || !Array.isArray(req.body.ids)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'IDs array is required'));
        }
        const deletedCount = yield gallery_image_service_1.GalleryImageService.bulkDelete(req.body.ids, req.user.userId);
        return res.json((0, response_types_1.createSuccessResponse)({ deletedCount }));
    }
    catch (error) {
        logger.error('Error bulk deleting gallery images:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('GALLERY_IMAGES_BULK_DELETE_FAILED', error instanceof Error ? error.message : 'Failed to bulk delete gallery images'));
    }
}));
logger.info('All gallery image routes mounted successfully');
exports.default = router;
