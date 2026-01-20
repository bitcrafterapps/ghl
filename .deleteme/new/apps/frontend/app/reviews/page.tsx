"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, Phone, ExternalLink, Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";
import { getApiUrl, getSiteId } from "@/lib/api";
import { PageHero } from "@/components/sections/PageHero";

interface Review {
  id: number;
  reviewerName: string;
  reviewerLocation?: string;
  text: string;
  rating: number;
  service?: string;
  featured: boolean;
  status: string;
  reviewDate?: string;
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

// Individual review card for Cover Flow
function CoverFlowCard({ 
  review, 
  index, 
  activeIndex, 
  totalReviews,
  onClick 
}: { 
  review: Review; 
  index: number; 
  activeIndex: number;
  totalReviews: number;
  onClick: () => void;
}) {
  // Calculate position relative to active index
  const offset = index - activeIndex;
  const absOffset = Math.abs(offset);
  
  // Calculate 3D transforms for cover flow effect
  const rotateY = offset * -35;
  const translateX = offset * 300;
  const translateZ = absOffset === 0 ? 0 : -120 - (absOffset * 40);
  const scale = absOffset === 0 ? 1 : 0.8 - (absOffset * 0.1);
  const opacity = absOffset > 2 ? 0 : 1 - (absOffset * 0.25);
  const zIndex = totalReviews - absOffset;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        width: '420px',
        minHeight: '320px',
        transformStyle: 'preserve-3d',
      }}
      animate={{
        rotateY,
        x: translateX,
        z: translateZ,
        scale: Math.max(0.5, scale),
        opacity: Math.max(0, opacity),
        zIndex,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      onClick={onClick}
      whileHover={absOffset === 0 ? { scale: 1.03 } : {}}
    >
      <div 
        className={`relative w-full h-full rounded-2xl overflow-hidden ${
          absOffset === 0 ? 'ring-4 ring-primary/30' : ''
        }`}
        style={{
          boxShadow: absOffset === 0 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.35)' 
            : '0 10px 30px -10px rgba(0, 0, 0, 0.2)',
          background: absOffset === 0 
            ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' 
            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        }}
      >
        <div className="p-8">
          {/* Quote Icon */}
          <Quote className={`h-12 w-12 mb-4 ${
            absOffset === 0 ? 'text-primary/30' : 'text-gray-200'
          }`} />

          {/* Review Text */}
          <p className={`text-lg leading-relaxed mb-6 ${
            absOffset === 0 ? 'text-gray-700 line-clamp-5' : 'text-gray-500 line-clamp-4'
          }`}>
            "{review.text}"
          </p>

          {/* Reviewer Info */}
          <div className="flex items-center justify-between mt-auto">
            <div>
              <p className={`font-semibold text-lg ${
                absOffset === 0 ? 'text-gray-900' : 'text-gray-600'
              }`}>
                {review.reviewerName}
              </p>
              <p className="text-gray-500 text-sm">
                {review.reviewerLocation || siteConfig.company.city}
              </p>
              {review.service && absOffset === 0 && (
                <p className="text-primary text-sm mt-1">{review.service}</p>
              )}
            </div>
            
            {/* Stars */}
            <div className="flex gap-1">
              {[...Array(review.rating || 5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-5 w-5 ${
                    absOffset === 0 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-yellow-300 fill-yellow-300'
                  }`} 
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Decorative gradient overlay for active card */}
        {absOffset === 0 && (
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
        )}
      </div>
      
      {/* Reflection effect */}
      <div 
        className="absolute top-full left-0 right-0 h-20 overflow-hidden rounded-2xl opacity-20"
        style={{
          transform: 'scaleY(-1)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        }}
      />
    </motion.div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const apiUrl = getApiUrl();
        const siteId = getSiteId();
        const headers: HeadersInit = siteId ? { 'x-site-id': siteId } : {};

        const [reviewsResponse, statsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/v1/reviews?status=published`, { headers }),
          fetch(`${apiUrl}/api/v1/reviews/stats`, { headers })
        ]);

        if (reviewsResponse.ok) {
          const reviewsResult = await reviewsResponse.json();
          const fetchedReviews = reviewsResult.data || reviewsResult || [];
          setReviews(fetchedReviews);
          if (fetchedReviews.length > 0) {
            setActiveIndex(Math.floor(fetchedReviews.length / 2));
          }
        }

        if (statsResponse.ok) {
          const statsResult = await statsResponse.json();
          setStats(statsResult.data || statsResult);
        }
      } catch (error) {
        console.warn('Failed to fetch reviews data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const goToPrevious = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : reviews.length - 1));
  }, [reviews.length]);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev < reviews.length - 1 ? prev + 1 : 0));
  }, [reviews.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  const displayRating = stats?.averageRating?.toFixed(1) ?? siteConfig.reviews.rating;
  const displayCount = stats?.totalReviews ?? siteConfig.reviews.count;
  const hasNoReviews = stats !== null && stats.totalReviews === 0;

  return (
    <PublicLayout>
      {/* Hero Section */}
      <PageHero>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
            {hasNoReviews ? "Reviews Coming Soon" : "Customer Reviews"}
          </h1>
          <p className="text-xl text-white/80 mb-8">
            {hasNoReviews 
              ? `We are currently collecting reviews for ${siteConfig.company.name}. Check back soon!` 
              : `See what our customers are saying about ${siteConfig.company.name}. We're proud of our ${displayRating}-star rating!`
            }
          </p>

          {!hasNoReviews && (
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur px-6 py-4 rounded-xl">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-2xl font-bold text-white">{displayRating}</span>
              <span className="text-white/70">({displayCount}+ reviews)</span>
            </div>
          )}

          {siteConfig.reviews.googleReviewLink && (
            <div className="mt-6">
              <a
                href={siteConfig.reviews.googleReviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white hover:text-primary transition-colors"
              >
                {hasNoReviews ? "Be the first to leave a review" : "View our Google Reviews"}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </motion.div>
      </PageHero>

      {/* Cover Flow Reviews Section */}
      <section className="section-padding bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="container-custom">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : hasNoReviews || reviews.length === 0 ? (
            // Empty State
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-10 w-10 text-gray-300" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                No Reviews Yet
              </h2>
              <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                We are just getting started collecting feedback from our happy customers. 
                If you have worked with us, please take a moment to share your experience!
              </p>
              {siteConfig.reviews.googleReviewLink && (
                <Button asChild>
                  <a
                    href={siteConfig.reviews.googleReviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    Leave a Google Review
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Section Header */}
              <div className="text-center max-w-3xl mx-auto mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                    Testimonials
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
                    {reviews.length} Customer Review{reviews.length !== 1 ? 's' : ''}
                  </h2>
                  <p className="text-lg text-gray-600">
                    Use the arrows to browse what our customers have to say
                  </p>
                </motion.div>
              </div>

              {/* Cover Flow Container */}
              <div 
                className="relative h-[450px] flex items-center justify-center"
                style={{ perspective: '1200px' }}
              >
                {/* Navigation Arrows */}
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 md:left-8 z-50 p-4 rounded-full bg-white/95 shadow-xl hover:bg-white hover:scale-110 transition-all"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
                
                <button
                  onClick={goToNext}
                  className="absolute right-4 md:right-8 z-50 p-4 rounded-full bg-white/95 shadow-xl hover:bg-white hover:scale-110 transition-all"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>

                {/* Reviews Container */}
                <div 
                  className="relative flex items-center justify-center"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  {reviews.map((review, index) => (
                    <CoverFlowCard
                      key={review.id || index}
                      review={review}
                      index={index}
                      activeIndex={activeIndex}
                      totalReviews={reviews.length}
                      onClick={() => setActiveIndex(index)}
                    />
                  ))}
                </div>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-8 flex-wrap">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === activeIndex 
                        ? 'w-8 bg-primary' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to review ${index + 1}`}
                  />
                ))}
              </div>

              {/* Review Counter */}
              <div className="text-center mt-6">
                <span className="text-gray-500">
                  Review {activeIndex + 1} of {reviews.length}
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Leave a Review CTA */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
            Had a Great Experience?
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            We'd love to hear from you! Leave us a review and let others know about
            your experience with {siteConfig.company.name}.
          </p>
          {siteConfig.reviews.googleReviewLink && (
            <Button asChild>
              <a
                href={siteConfig.reviews.googleReviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                Leave a Review
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Join Our Happy Customers
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Experience the quality service that's earned us {displayCount}+ 5-star reviews.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link href="/free-estimate">Get Free Estimate</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
              <a href={formatPhoneLink(siteConfig.company.phone)}>
                <Phone className="h-5 w-5 mr-2" />
                {formatPhone(siteConfig.company.phone)}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
