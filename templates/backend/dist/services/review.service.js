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
exports.ReviewService = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const logger_1 = require("../logger");
const drizzle_orm_1 = require("drizzle-orm");
const activity_service_1 = require("./activity.service");
const logger = logger_1.LoggerFactory.getLogger('ReviewService');
class ReviewService {
    /**
     * Create a new review
     */
    static createReview(data, actorUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                logger.debug('Creating review from:', data.reviewerName);
                // Validate rating
                if (data.rating < 1 || data.rating > 5) {
                    throw new Error('Rating must be between 1 and 5');
                }
                const [review] = yield db_1.db.insert(schema_1.reviews).values({
                    userId: actorUserId || null,
                    companyId: data.companyId || null,
                    siteId: data.siteId || null, // Multi-tenant site scoping
                    reviewerName: data.reviewerName,
                    reviewerLocation: data.reviewerLocation || null,
                    reviewerEmail: data.reviewerEmail || null,
                    text: data.text,
                    rating: data.rating,
                    service: data.service || null,
                    source: data.source || 'manual',
                    featured: (_a = data.featured) !== null && _a !== void 0 ? _a : false,
                    sortOrder: (_b = data.sortOrder) !== null && _b !== void 0 ? _b : 0,
                    status: data.status || 'published',
                    reviewDate: data.reviewDate ? new Date(data.reviewDate) : new Date()
                }).returning();
                // Log activity
                if (actorUserId) {
                    yield activity_service_1.ActivityService.logActivity({
                        type: 'review',
                        action: 'created',
                        title: `Review from: ${review.reviewerName}`,
                        entityId: review.id,
                        userId: actorUserId
                    });
                }
                logger.debug('Review created successfully:', review.id);
                return this.formatResponse(review);
            }
            catch (error) {
                logger.error('Error creating review:', error);
                throw error;
            }
        });
    }
    /**
     * Get all reviews with optional filtering
     */
    static getReviews() {
        return __awaiter(this, arguments, void 0, function* (params = {}) {
            try {
                logger.debug('Fetching reviews with params:', params);
                const conditions = [];
                if (params.status) {
                    conditions.push((0, drizzle_orm_1.eq)(schema_1.reviews.status, params.status));
                }
                if (params.source) {
                    conditions.push((0, drizzle_orm_1.eq)(schema_1.reviews.source, params.source));
                }
                if (params.featured !== undefined) {
                    conditions.push((0, drizzle_orm_1.eq)(schema_1.reviews.featured, params.featured));
                }
                if (params.minRating !== undefined) {
                    conditions.push((0, drizzle_orm_1.gte)(schema_1.reviews.rating, params.minRating));
                }
                if (params.maxRating !== undefined) {
                    conditions.push((0, drizzle_orm_1.lte)(schema_1.reviews.rating, params.maxRating));
                }
                if (params.companyId) {
                    conditions.push((0, drizzle_orm_1.eq)(schema_1.reviews.companyId, params.companyId));
                }
                // Multi-tenant site scoping - filter by siteId if provided
                if (params.siteId) {
                    conditions.push((0, drizzle_orm_1.eq)(schema_1.reviews.siteId, params.siteId));
                }
                let query = db_1.db.select().from(schema_1.reviews);
                if (conditions.length > 0) {
                    query = query.where((0, drizzle_orm_1.and)(...conditions));
                }
                query = query.orderBy((0, drizzle_orm_1.asc)(schema_1.reviews.sortOrder), (0, drizzle_orm_1.desc)(schema_1.reviews.reviewDate));
                if (params.limit) {
                    query = query.limit(params.limit);
                }
                if (params.offset) {
                    query = query.offset(params.offset);
                }
                const reviewList = yield query;
                logger.debug(`Retrieved ${reviewList.length} reviews`);
                return reviewList.map(this.formatResponse);
            }
            catch (error) {
                logger.error('Error fetching reviews:', error);
                throw error;
            }
        });
    }
    /**
     * Get a single review by ID
     */
    static getReviewById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [review] = yield db_1.db.select().from(schema_1.reviews).where((0, drizzle_orm_1.eq)(schema_1.reviews.id, id));
                if (!review) {
                    return null;
                }
                return this.formatResponse(review);
            }
            catch (error) {
                logger.error('Error fetching review by ID:', error);
                throw error;
            }
        });
    }
    /**
     * Update a review
     */
    static updateReview(id, data, actorUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger.debug('Updating review:', id);
                // Validate rating if provided
                if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
                    throw new Error('Rating must be between 1 and 5');
                }
                const updateData = {
                    updatedAt: new Date()
                };
                if (data.reviewerName !== undefined)
                    updateData.reviewerName = data.reviewerName;
                if (data.reviewerLocation !== undefined)
                    updateData.reviewerLocation = data.reviewerLocation;
                if (data.reviewerEmail !== undefined)
                    updateData.reviewerEmail = data.reviewerEmail;
                if (data.text !== undefined)
                    updateData.text = data.text;
                if (data.rating !== undefined)
                    updateData.rating = data.rating;
                if (data.service !== undefined)
                    updateData.service = data.service;
                if (data.source !== undefined)
                    updateData.source = data.source;
                if (data.featured !== undefined)
                    updateData.featured = data.featured;
                if (data.sortOrder !== undefined)
                    updateData.sortOrder = data.sortOrder;
                if (data.status !== undefined)
                    updateData.status = data.status;
                if (data.reviewDate !== undefined)
                    updateData.reviewDate = data.reviewDate ? new Date(data.reviewDate) : null;
                const [updated] = yield db_1.db
                    .update(schema_1.reviews)
                    .set(updateData)
                    .where((0, drizzle_orm_1.eq)(schema_1.reviews.id, id))
                    .returning();
                if (!updated) {
                    return null;
                }
                // Log activity
                if (actorUserId) {
                    yield activity_service_1.ActivityService.logActivity({
                        type: 'review',
                        action: 'updated',
                        title: `Review from: ${updated.reviewerName}`,
                        entityId: updated.id,
                        userId: actorUserId
                    });
                }
                logger.debug('Review updated successfully:', id);
                return this.formatResponse(updated);
            }
            catch (error) {
                logger.error('Error updating review:', error);
                throw error;
            }
        });
    }
    /**
     * Delete a review
     */
    static deleteReview(id, actorUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger.debug('Deleting review:', id);
                // Get the review first for activity logging
                const [review] = yield db_1.db.select().from(schema_1.reviews).where((0, drizzle_orm_1.eq)(schema_1.reviews.id, id));
                if (!review) {
                    return false;
                }
                const [deleted] = yield db_1.db.delete(schema_1.reviews).where((0, drizzle_orm_1.eq)(schema_1.reviews.id, id)).returning();
                // Log activity
                if (actorUserId && deleted) {
                    yield activity_service_1.ActivityService.logActivity({
                        type: 'review',
                        action: 'deleted',
                        title: `Review from: ${review.reviewerName}`,
                        entityId: id,
                        userId: actorUserId
                    });
                }
                logger.debug('Review deleted successfully:', id);
                return !!deleted;
            }
            catch (error) {
                logger.error('Error deleting review:', error);
                throw error;
            }
        });
    }
    /**
     * Get review statistics
     */
    static getStats(companyId, siteId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger.debug(`Fetching review stats - companyId: ${companyId}, siteId: ${siteId}`);
                const conditions = [(0, drizzle_orm_1.eq)(schema_1.reviews.status, 'published')];
                if (companyId) {
                    conditions.push((0, drizzle_orm_1.eq)(schema_1.reviews.companyId, companyId));
                }
                if (siteId) {
                    logger.debug(`Adding siteId filter: ${siteId}`);
                    conditions.push((0, drizzle_orm_1.eq)(schema_1.reviews.siteId, siteId));
                }
                else {
                    logger.debug('No siteId provided - returning stats for all reviews');
                }
                // Get total count and average
                const [stats] = yield db_1.db
                    .select({
                    totalReviews: (0, drizzle_orm_1.count)(),
                    averageRating: (0, drizzle_orm_1.avg)(schema_1.reviews.rating)
                })
                    .from(schema_1.reviews)
                    .where((0, drizzle_orm_1.and)(...conditions));
                // Get featured count
                const [featuredStats] = yield db_1.db
                    .select({ count: (0, drizzle_orm_1.count)() })
                    .from(schema_1.reviews)
                    .where((0, drizzle_orm_1.and)(...conditions, (0, drizzle_orm_1.eq)(schema_1.reviews.featured, true)));
                // Get rating distribution
                const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                const ratingCounts = yield db_1.db
                    .select({
                    rating: schema_1.reviews.rating,
                    count: (0, drizzle_orm_1.count)()
                })
                    .from(schema_1.reviews)
                    .where((0, drizzle_orm_1.and)(...conditions))
                    .groupBy(schema_1.reviews.rating);
                for (const rc of ratingCounts) {
                    if (rc.rating >= 1 && rc.rating <= 5) {
                        distribution[rc.rating] = Number(rc.count);
                    }
                }
                return {
                    totalReviews: Number(stats.totalReviews) || 0,
                    averageRating: Number(stats.averageRating) || 0,
                    ratingDistribution: distribution,
                    featuredCount: Number(featuredStats.count) || 0
                };
            }
            catch (error) {
                logger.error('Error fetching review stats:', error);
                throw error;
            }
        });
    }
    /**
     * Post review to Google Business Profile
     * Note: This requires Google Business Profile API setup and OAuth credentials
     */
    static postToGoogleBusiness(reviewId, googleAccountId, googleLocationId, accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                logger.debug('Posting review to Google Business:', reviewId);
                // Get the review
                const review = yield this.getReviewById(reviewId);
                if (!review) {
                    return { success: false, error: 'Review not found' };
                }
                // Google Business Profile API endpoint for posting reviews
                // Note: Google doesn't allow posting reviews programmatically - you can only reply to reviews
                // What we can do is create a review request link or use the business messaging API
                // For this implementation, we'll create a reply to an existing Google review if the review
                // has a googleReviewId, or we'll generate a review request that can be shared
                const googleApiUrl = `https://mybusiness.googleapis.com/v4/accounts/${googleAccountId}/locations/${googleLocationId}/reviews`;
                // If this review already has a Google Review ID, we can reply to it
                if (review.googleReviewId) {
                    const replyUrl = `${googleApiUrl}/${review.googleReviewId}/reply`;
                    const response = yield fetch(replyUrl, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            comment: `Thank you for your ${review.rating}-star review, ${review.reviewerName}!`
                        })
                    });
                    if (!response.ok) {
                        const errorData = yield response.json();
                        logger.error('Google Business API error:', errorData);
                        return {
                            success: false,
                            error: ((_a = errorData.error) === null || _a === void 0 ? void 0 : _a.message) || 'Failed to post to Google Business'
                        };
                    }
                    const result = yield response.json();
                    // Update the review with Google posting info
                    yield db_1.db
                        .update(schema_1.reviews)
                        .set({
                        googlePostedAt: new Date(),
                        updatedAt: new Date()
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.reviews.id, reviewId));
                    logger.debug('Successfully posted reply to Google Business');
                    return {
                        success: true,
                        googleReviewId: review.googleReviewId,
                        postedAt: new Date()
                    };
                }
                // If no Google Review ID, we can generate a review request URL
                // This URL can be shared with customers to request reviews
                const reviewRequestUrl = `https://search.google.com/local/writereview?placeid=${googleLocationId}`;
                logger.debug('Generated review request URL:', reviewRequestUrl);
                return {
                    success: true,
                    googleReviewId: undefined,
                    postedAt: new Date(),
                    error: `Review request URL generated: ${reviewRequestUrl}. Note: Google does not allow programmatic review posting.`
                };
            }
            catch (error) {
                logger.error('Error posting to Google Business:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error occurred'
                };
            }
        });
    }
    /**
     * Get featured reviews (for frontend display)
     */
    static getFeaturedReviews() {
        return __awaiter(this, arguments, void 0, function* (limit = 6, companyId, siteId) {
            return this.getReviews({
                status: 'published',
                featured: true,
                limit,
                companyId,
                siteId
            });
        });
    }
    /**
     * Get distinct services that have reviews
     */
    static getServices() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield db_1.db
                    .selectDistinct({ service: schema_1.reviews.service })
                    .from(schema_1.reviews)
                    .where((0, drizzle_orm_1.sql) `${schema_1.reviews.service} IS NOT NULL`);
                return results.map(r => r.service).filter((s) => s !== null);
            }
            catch (error) {
                logger.error('Error fetching services:', error);
                throw error;
            }
        });
    }
    /**
     * Format database record to response
     */
    static formatResponse(review) {
        var _a, _b;
        return {
            id: review.id,
            userId: review.userId,
            companyId: review.companyId,
            siteId: review.siteId, // Multi-tenant site scoping
            reviewerName: review.reviewerName,
            reviewerLocation: review.reviewerLocation,
            reviewerEmail: review.reviewerEmail,
            text: review.text,
            rating: review.rating,
            service: review.service,
            source: review.source || 'manual',
            externalId: review.externalId,
            googleReviewId: review.googleReviewId,
            googlePostedAt: review.googlePostedAt,
            featured: (_a = review.featured) !== null && _a !== void 0 ? _a : false,
            sortOrder: (_b = review.sortOrder) !== null && _b !== void 0 ? _b : 0,
            status: review.status || 'published',
            reviewDate: review.reviewDate,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
        };
    }
}
exports.ReviewService = ReviewService;
