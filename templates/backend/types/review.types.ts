import { ReviewStatus, ReviewSource } from '../db/schema';

export type { ReviewStatus, ReviewSource };

// Create DTO for adding a new review
export interface ReviewCreateDto {
  reviewerName: string;
  reviewerLocation?: string;
  reviewerEmail?: string;
  text: string;
  rating: number;
  service?: string;
  source?: ReviewSource;
  featured?: boolean;
  sortOrder?: number;
  status?: ReviewStatus;
  companyId?: number;
  reviewDate?: Date;
}

// Update DTO
export interface ReviewUpdateDto {
  reviewerName?: string;
  reviewerLocation?: string;
  reviewerEmail?: string;
  text?: string;
  rating?: number;
  service?: string;
  source?: ReviewSource;
  featured?: boolean;
  sortOrder?: number;
  status?: ReviewStatus;
  reviewDate?: Date;
}

// Response type for reviews
export interface ReviewResponse {
  id: number;
  userId: number | null;
  companyId: number | null;
  reviewerName: string;
  reviewerLocation: string | null;
  reviewerEmail: string | null;
  text: string;
  rating: number;
  service: string | null;
  source: ReviewSource;
  externalId: string | null;
  googleReviewId: string | null;
  googlePostedAt: Date | null;
  featured: boolean;
  sortOrder: number;
  status: ReviewStatus;
  reviewDate: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// Google Business posting
export interface GoogleBusinessPostDto {
  reviewId: number;
  // Google Business Profile details (would come from site settings or be passed)
  accountId?: string;
  locationId?: string;
}

export interface GoogleBusinessPostResult {
  success: boolean;
  googleReviewId?: string;
  postedAt?: Date;
  error?: string;
}

// Query parameters
export interface ReviewQueryParams {
  status?: ReviewStatus;
  source?: ReviewSource;
  featured?: boolean;
  minRating?: number;
  maxRating?: number;
  companyId?: number;
  limit?: number;
  offset?: number;
}

// Aggregate review stats
export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  featuredCount: number;
}
