import { db } from '../db';
import { reviews, ReviewStatus, ReviewSource } from '../db/schema';
import {
  ReviewCreateDto,
  ReviewUpdateDto,
  ReviewResponse,
  ReviewQueryParams,
  ReviewStats,
  GoogleBusinessPostResult
} from '../types/review.types';
import { LoggerFactory } from '../logger';
import { eq, and, desc, asc, gte, lte, sql, count, avg } from 'drizzle-orm';
import { ActivityService } from './activity.service';

const logger = LoggerFactory.getLogger('ReviewService');

export class ReviewService {
  /**
   * Create a new review
   */
  static async createReview(
    data: ReviewCreateDto,
    actorUserId?: number
  ): Promise<ReviewResponse> {
    try {
      logger.debug('Creating review from:', data.reviewerName);

      // Validate rating
      if (data.rating < 1 || data.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const [review] = await db.insert(reviews).values({
        userId: actorUserId || null,
        companyId: data.companyId || null,
        siteId: data.siteId || null,  // Multi-tenant site scoping
        reviewerName: data.reviewerName,
        reviewerLocation: data.reviewerLocation || null,
        reviewerEmail: data.reviewerEmail || null,
        text: data.text,
        rating: data.rating,
        service: data.service || null,
        source: data.source || 'manual',
        featured: data.featured ?? false,
        sortOrder: data.sortOrder ?? 0,
        status: data.status || 'published',
        reviewDate: data.reviewDate ? new Date(data.reviewDate) : new Date()
      }).returning();

      // Log activity
      if (actorUserId) {
        await ActivityService.logActivity({
          type: 'review',
          action: 'created',
          title: `Review from: ${review.reviewerName}`,
          entityId: review.id,
          userId: actorUserId
        });
      }

      logger.debug('Review created successfully:', review.id);

      return this.formatResponse(review);
    } catch (error) {
      logger.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Get all reviews with optional filtering
   */
  static async getReviews(params: ReviewQueryParams = {}): Promise<ReviewResponse[]> {
    try {
      logger.debug('Fetching reviews with params:', params);

      const conditions = [];

      if (params.status) {
        conditions.push(eq(reviews.status, params.status));
      }

      if (params.source) {
        conditions.push(eq(reviews.source, params.source));
      }

      if (params.featured !== undefined) {
        conditions.push(eq(reviews.featured, params.featured));
      }

      if (params.minRating !== undefined) {
        conditions.push(gte(reviews.rating, params.minRating));
      }

      if (params.maxRating !== undefined) {
        conditions.push(lte(reviews.rating, params.maxRating));
      }

      if (params.companyId) {
        conditions.push(eq(reviews.companyId, params.companyId));
      }

      // Multi-tenant site scoping - filter by siteId if provided
      if (params.siteId) {
        conditions.push(eq(reviews.siteId, params.siteId));
      }

      let query = db.select().from(reviews);

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }

      query = query.orderBy(asc(reviews.sortOrder), desc(reviews.reviewDate)) as typeof query;

      if (params.limit) {
        query = query.limit(params.limit) as typeof query;
      }

      if (params.offset) {
        query = query.offset(params.offset) as typeof query;
      }

      const reviewList = await query;

      logger.debug(`Retrieved ${reviewList.length} reviews`);

      return reviewList.map(this.formatResponse);
    } catch (error) {
      logger.error('Error fetching reviews:', error);
      throw error;
    }
  }

  /**
   * Get a single review by ID
   */
  static async getReviewById(id: number): Promise<ReviewResponse | null> {
    try {
      const [review] = await db.select().from(reviews).where(eq(reviews.id, id));

      if (!review) {
        return null;
      }

      return this.formatResponse(review);
    } catch (error) {
      logger.error('Error fetching review by ID:', error);
      throw error;
    }
  }

  /**
   * Update a review
   */
  static async updateReview(
    id: number,
    data: ReviewUpdateDto,
    actorUserId?: number
  ): Promise<ReviewResponse | null> {
    try {
      logger.debug('Updating review:', id);

      // Validate rating if provided
      if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
        throw new Error('Rating must be between 1 and 5');
      }

      const updateData: Record<string, any> = {
        updatedAt: new Date()
      };

      if (data.reviewerName !== undefined) updateData.reviewerName = data.reviewerName;
      if (data.reviewerLocation !== undefined) updateData.reviewerLocation = data.reviewerLocation;
      if (data.reviewerEmail !== undefined) updateData.reviewerEmail = data.reviewerEmail;
      if (data.text !== undefined) updateData.text = data.text;
      if (data.rating !== undefined) updateData.rating = data.rating;
      if (data.service !== undefined) updateData.service = data.service;
      if (data.source !== undefined) updateData.source = data.source;
      if (data.featured !== undefined) updateData.featured = data.featured;
      if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.reviewDate !== undefined) updateData.reviewDate = data.reviewDate ? new Date(data.reviewDate) : null;

      const [updated] = await db
        .update(reviews)
        .set(updateData)
        .where(eq(reviews.id, id))
        .returning();

      if (!updated) {
        return null;
      }

      // Log activity
      if (actorUserId) {
        await ActivityService.logActivity({
          type: 'review',
          action: 'updated',
          title: `Review from: ${updated.reviewerName}`,
          entityId: updated.id,
          userId: actorUserId
        });
      }

      logger.debug('Review updated successfully:', id);

      return this.formatResponse(updated);
    } catch (error) {
      logger.error('Error updating review:', error);
      throw error;
    }
  }

  /**
   * Delete a review
   */
  static async deleteReview(id: number, actorUserId?: number): Promise<boolean> {
    try {
      logger.debug('Deleting review:', id);

      // Get the review first for activity logging
      const [review] = await db.select().from(reviews).where(eq(reviews.id, id));

      if (!review) {
        return false;
      }

      const [deleted] = await db.delete(reviews).where(eq(reviews.id, id)).returning();

      // Log activity
      if (actorUserId && deleted) {
        await ActivityService.logActivity({
          type: 'review',
          action: 'deleted',
          title: `Review from: ${review.reviewerName}`,
          entityId: id,
          userId: actorUserId
        });
      }

      logger.debug('Review deleted successfully:', id);

      return !!deleted;
    } catch (error) {
      logger.error('Error deleting review:', error);
      throw error;
    }
  }

  /**
   * Get review statistics
   */
  static async getStats(companyId?: number, siteId?: string): Promise<ReviewStats> {
    try {
      logger.debug(`Fetching review stats - companyId: ${companyId}, siteId: ${siteId}`);

      const conditions = [eq(reviews.status, 'published')];
      if (companyId) {
        conditions.push(eq(reviews.companyId, companyId));
      }
      if (siteId) {
        logger.debug(`Adding siteId filter: ${siteId}`);
        conditions.push(eq(reviews.siteId, siteId));
      } else {
        logger.debug('No siteId provided - returning stats for all reviews');
      }

      // Get total count and average
      const [stats] = await db
        .select({
          totalReviews: count(),
          averageRating: avg(reviews.rating)
        })
        .from(reviews)
        .where(and(...conditions));

      // Get featured count
      const [featuredStats] = await db
        .select({ count: count() })
        .from(reviews)
        .where(and(...conditions, eq(reviews.featured, true)));

      // Get rating distribution
      const distribution: ReviewStats['ratingDistribution'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      const ratingCounts = await db
        .select({
          rating: reviews.rating,
          count: count()
        })
        .from(reviews)
        .where(and(...conditions))
        .groupBy(reviews.rating);

      for (const rc of ratingCounts) {
        if (rc.rating >= 1 && rc.rating <= 5) {
          distribution[rc.rating as 1 | 2 | 3 | 4 | 5] = Number(rc.count);
        }
      }

      return {
        totalReviews: Number(stats.totalReviews) || 0,
        averageRating: Number(stats.averageRating) || 0,
        ratingDistribution: distribution,
        featuredCount: Number(featuredStats.count) || 0
      };
    } catch (error) {
      logger.error('Error fetching review stats:', error);
      throw error;
    }
  }

  /**
   * Post review to Google Business Profile
   * Note: This requires Google Business Profile API setup and OAuth credentials
   */
  static async postToGoogleBusiness(
    reviewId: number,
    googleAccountId: string,
    googleLocationId: string,
    accessToken: string
  ): Promise<GoogleBusinessPostResult> {
    try {
      logger.debug('Posting review to Google Business:', reviewId);

      // Get the review
      const review = await this.getReviewById(reviewId);
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

        const response = await fetch(replyUrl, {
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
          const errorData = await response.json();
          logger.error('Google Business API error:', errorData);
          return {
            success: false,
            error: errorData.error?.message || 'Failed to post to Google Business'
          };
        }

        const result = await response.json();

        // Update the review with Google posting info
        await db
          .update(reviews)
          .set({
            googlePostedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(reviews.id, reviewId));

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

    } catch (error) {
      logger.error('Error posting to Google Business:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get featured reviews (for frontend display)
   */
  static async getFeaturedReviews(limit: number = 6, companyId?: number, siteId?: string): Promise<ReviewResponse[]> {
    return this.getReviews({
      status: 'published',
      featured: true,
      limit,
      companyId,
      siteId
    });
  }

  /**
   * Get distinct services that have reviews
   */
  static async getServices(): Promise<string[]> {
    try {
      const results = await db
        .selectDistinct({ service: reviews.service })
        .from(reviews)
        .where(sql`${reviews.service} IS NOT NULL`);

      return results.map(r => r.service).filter((s): s is string => s !== null);
    } catch (error) {
      logger.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * Format database record to response
   */
  private static formatResponse(review: typeof reviews.$inferSelect): ReviewResponse {
    return {
      id: review.id,
      userId: review.userId,
      companyId: review.companyId,
      siteId: review.siteId,  // Multi-tenant site scoping
      reviewerName: review.reviewerName,
      reviewerLocation: review.reviewerLocation,
      reviewerEmail: review.reviewerEmail,
      text: review.text,
      rating: review.rating,
      service: review.service,
      source: (review.source as ReviewSource) || 'manual',
      externalId: review.externalId,
      googleReviewId: review.googleReviewId,
      googlePostedAt: review.googlePostedAt,
      featured: review.featured ?? false,
      sortOrder: review.sortOrder ?? 0,
      status: (review.status as ReviewStatus) || 'published',
      reviewDate: review.reviewDate,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    };
  }
}
