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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_service_1 = require("../../services/review.service");
const user_service_1 = require("../../services/user.service");
const auth_middleware_1 = require("../../middleware/v1/auth.middleware");
const logger_1 = require("../../logger");
const response_types_1 = require("../../types/api/response.types");
const router = (0, express_1.Router)();
const logger = logger_1.LoggerFactory.getLogger('ReviewsAPI');
// Middleware to log requests
router.use((req, _res, next) => {
    logger.debug(`Reviews endpoint accessed: ${req.method} ${req.path}`);
    next();
});
/**
 * GET /api/v1/reviews
 * Get all reviews with optional filtering (public endpoint for displaying on frontend)
 * Requires siteId header for multi-tenant filtering
 */
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.debug('Getting reviews');
        const siteId = req.headers['x-site-id'] || req.query.siteId;
        const params = {
            siteId, // Required for multi-tenant filtering
            status: req.query.status,
            source: req.query.source,
            featured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
            minRating: req.query.minRating ? parseInt(req.query.minRating) : undefined,
            maxRating: req.query.maxRating ? parseInt(req.query.maxRating) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset) : undefined
        };
        // For public access, only show published reviews
        if (!req.user) {
            params.status = 'published';
        }
        const reviews = yield review_service_1.ReviewService.getReviews(params);
        logger.debug(`Retrieved ${reviews.length} reviews`);
        return res.json((0, response_types_1.createSuccessResponse)(reviews));
    }
    catch (error) {
        logger.error('Error getting reviews:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('REVIEWS_FETCH_FAILED', error instanceof Error ? error.message : 'Failed to fetch reviews'));
    }
}));
/**
 * GET /api/v1/reviews/featured
 * Get featured reviews for frontend display
 * Requires siteId header for multi-tenant filtering
 */
router.get('/featured', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 6;
        const siteId = req.headers['x-site-id'] || req.query.siteId;
        // Pass siteId for multi-tenant filtering - only reviews with matching siteId will show
        const reviews = yield review_service_1.ReviewService.getFeaturedReviews(limit, undefined, siteId);
        return res.json((0, response_types_1.createSuccessResponse)(reviews));
    }
    catch (error) {
        logger.error('Error getting featured reviews:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('FEATURED_REVIEWS_FETCH_FAILED', error instanceof Error ? error.message : 'Failed to fetch featured reviews'));
    }
}));
/**
 * GET /api/v1/reviews/stats
 * Get review statistics
 */
router.get('/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companyId = req.query.companyId ? parseInt(req.query.companyId) : undefined;
        const siteId = req.headers['x-site-id'] || req.query.siteId;
        logger.debug(`Stats request - siteId from header: ${siteId}, companyId: ${companyId}`);
        const stats = yield review_service_1.ReviewService.getStats(companyId, siteId);
        logger.debug(`Stats response - totalReviews: ${stats.totalReviews}, averageRating: ${stats.averageRating}`);
        return res.json((0, response_types_1.createSuccessResponse)(stats));
    }
    catch (error) {
        logger.error('Error getting review stats:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('REVIEW_STATS_FETCH_FAILED', error instanceof Error ? error.message : 'Failed to fetch review statistics'));
    }
}));
/**
 * GET /api/v1/reviews/services
 * Get distinct services that have reviews
 */
router.get('/services', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield review_service_1.ReviewService.getServices();
        return res.json((0, response_types_1.createSuccessResponse)(services));
    }
    catch (error) {
        logger.error('Error getting services:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('SERVICES_FETCH_FAILED', error instanceof Error ? error.message : 'Failed to fetch services'));
    }
}));
/**
 * GET /api/v1/reviews/:id
 * Get a single review by ID
 */
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_ID', 'Review ID must be a number'));
        }
        const review = yield review_service_1.ReviewService.getReviewById(id);
        if (!review) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', `Review with ID ${id} not found`));
        }
        // For public access, only show published reviews
        if (!req.user && review.status !== 'published') {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', `Review with ID ${id} not found`));
        }
        return res.json((0, response_types_1.createSuccessResponse)(review));
    }
    catch (error) {
        logger.error('Error getting review:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('REVIEW_FETCH_FAILED', error instanceof Error ? error.message : 'Failed to fetch review'));
    }
}));
/**
 * POST /api/v1/reviews
 * Create a new review
 */
router.post('/', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        logger.debug('Creating new review');
        // Check if user has admin privileges
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
            logger.warn(`User ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.userId} attempted to create review without admin privileges`);
            return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to create reviews'));
        }
        // Validate required fields
        const requiredFields = ['reviewerName', 'text', 'rating'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', `Missing required fields: ${missingFields.join(', ')}`));
        }
        // Validate rating
        if (req.body.rating < 1 || req.body.rating > 5) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Rating must be between 1 and 5'));
        }
        // Get siteId from header or body for multi-tenant scoping
        const siteId = req.body.siteId || req.headers['x-site-id'] || undefined;
        const reviewData = Object.assign(Object.assign({}, req.body), { siteId });
        const review = yield review_service_1.ReviewService.createReview(reviewData, req.user.userId);
        logger.debug(`Review created with ID: ${review.id}`);
        return res.status(201).json((0, response_types_1.createSuccessResponse)(review));
    }
    catch (error) {
        logger.error('Error creating review:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('REVIEW_CREATE_FAILED', error instanceof Error ? error.message : 'Failed to create review'));
    }
}));
/**
 * PUT /api/v1/reviews/:id
 * Update a review
 */
router.put('/:id', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_ID', 'Review ID must be a number'));
        }
        logger.debug(`Updating review with ID: ${id}`);
        // Check if user has admin privileges
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
            logger.warn(`User ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.userId} attempted to update review without admin privileges`);
            return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to update reviews'));
        }
        // Check if review exists
        const existingReview = yield review_service_1.ReviewService.getReviewById(id);
        if (!existingReview) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', `Review with ID ${id} not found`));
        }
        // Validate rating if provided
        if (req.body.rating !== undefined && (req.body.rating < 1 || req.body.rating > 5)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Rating must be between 1 and 5'));
        }
        const updatedReview = yield review_service_1.ReviewService.updateReview(id, req.body, req.user.userId);
        return res.json((0, response_types_1.createSuccessResponse)(updatedReview));
    }
    catch (error) {
        logger.error('Error updating review:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('REVIEW_UPDATE_FAILED', error instanceof Error ? error.message : 'Failed to update review'));
    }
}));
/**
 * DELETE /api/v1/reviews/:id
 * Delete a review
 */
router.delete('/:id', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_ID', 'Review ID must be a number'));
        }
        logger.debug(`Deleting review with ID: ${id}`);
        // Check if user has admin privileges
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
            logger.warn(`User ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.userId} attempted to delete review without admin privileges`);
            return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to delete reviews'));
        }
        const deleted = yield review_service_1.ReviewService.deleteReview(id, req.user.userId);
        if (!deleted) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', `Review with ID ${id} not found`));
        }
        return res.status(204).send();
    }
    catch (error) {
        logger.error('Error deleting review:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('REVIEW_DELETE_FAILED', error instanceof Error ? error.message : 'Failed to delete review'));
    }
}));
/**
 * POST /api/v1/reviews/:id/google-business
 * Post review to Google Business Profile
 */
router.post('/:id/google-business', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_ID', 'Review ID must be a number'));
        }
        logger.debug(`Posting review ${id} to Google Business`);
        // Check if user has admin privileges
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
            return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to post to Google Business'));
        }
        // Validate required fields
        const { accountId, locationId, accessToken } = req.body;
        if (!accountId || !locationId || !accessToken) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('VALIDATION_ERROR', 'Google Business accountId, locationId, and accessToken are required'));
        }
        const result = yield review_service_1.ReviewService.postToGoogleBusiness(id, accountId, locationId, accessToken);
        if (!result.success) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('GOOGLE_BUSINESS_POST_FAILED', result.error || 'Failed to post to Google Business'));
        }
        return res.json((0, response_types_1.createSuccessResponse)(result));
    }
    catch (error) {
        logger.error('Error posting to Google Business:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('GOOGLE_BUSINESS_POST_FAILED', error instanceof Error ? error.message : 'Failed to post to Google Business'));
    }
}));
/**
 * PATCH /api/v1/reviews/:id/featured
 * Toggle featured status of a review
 */
router.patch('/:id/featured', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json((0, response_types_1.createErrorResponse)('INVALID_ID', 'Review ID must be a number'));
        }
        // Check if user has admin privileges
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.some(role => ['Admin', 'Site Admin'].includes(role))) {
            return res.status(403).json((0, response_types_1.createErrorResponse)('FORBIDDEN', 'You do not have permission to feature reviews'));
        }
        const updatedReview = yield review_service_1.ReviewService.updateReview(id, { featured: req.body.featured }, req.user.userId);
        if (!updatedReview) {
            return res.status(404).json((0, response_types_1.createErrorResponse)('NOT_FOUND', `Review with ID ${id} not found`));
        }
        return res.json((0, response_types_1.createSuccessResponse)(updatedReview));
    }
    catch (error) {
        logger.error('Error toggling review featured status:', error);
        return res.status(500).json((0, response_types_1.createErrorResponse)('REVIEW_FEATURE_TOGGLE_FAILED', error instanceof Error ? error.message : 'Failed to toggle review featured status'));
    }
}));
logger.info('All review routes mounted successfully');
exports.default = router;
