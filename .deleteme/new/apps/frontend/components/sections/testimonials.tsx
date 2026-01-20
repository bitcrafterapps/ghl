"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote, Loader2 } from "lucide-react";
import { siteConfig } from "@/data/config";
import { getApiUrl, getSiteId } from "@/lib/api";

interface Review {
  id: number;
  reviewerName: string;
  reviewerLocation?: string;
  text: string;
  rating: number;
  featured: boolean;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
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
  const rotateY = offset * -35; // Rotate side cards (less angle for cards)
  const translateX = offset * 280; // Spread cards horizontally
  const translateZ = absOffset === 0 ? 0 : -120 - (absOffset * 40); // Push side cards back
  const scale = absOffset === 0 ? 1 : 0.8 - (absOffset * 0.1); // Scale down side cards
  const opacity = absOffset > 2 ? 0 : 1 - (absOffset * 0.25); // Fade distant cards
  const zIndex = totalReviews - absOffset;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        width: '380px',
        minHeight: '280px',
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
        <div className="p-6 md:p-8">
          {/* Quote Icon */}
          <Quote className={`h-10 w-10 mb-4 ${
            absOffset === 0 ? 'text-primary/30' : 'text-gray-200'
          }`} />

          {/* Review Text */}
          <p className={`text-base md:text-lg leading-relaxed mb-6 line-clamp-4 ${
            absOffset === 0 ? 'text-gray-700' : 'text-gray-500'
          }`}>
            "{review.text}"
          </p>

          {/* Reviewer Info */}
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-semibold ${
                absOffset === 0 ? 'text-gray-900' : 'text-gray-600'
              }`}>
                {review.reviewerName}
              </p>
              <p className="text-gray-500 text-sm">
                {review.reviewerLocation || siteConfig.company.city}
              </p>
            </div>
            
            {/* Stars */}
            <div className="flex gap-1">
              {[...Array(review.rating || 5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${
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
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
        )}
      </div>
      
      {/* Reflection effect */}
      <div 
        className="absolute top-full left-0 right-0 h-16 overflow-hidden rounded-2xl opacity-20"
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

export function TestimonialsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = getApiUrl();
        const siteId = getSiteId();
        const headers: HeadersInit = siteId ? { 'x-site-id': siteId } : {};
        
        const [reviewsRes, statsRes] = await Promise.all([
          // Fetch all published reviews for this site (not just featured)
          fetch(`${apiUrl}/api/v1/reviews?status=published&limit=10`, { headers }),
          fetch(`${apiUrl}/api/v1/reviews/stats`, { headers })
        ]);

        if (reviewsRes.ok) {
          const result = await reviewsRes.json();
          const fetchedReviews = result.data || result || [];
          setReviews(fetchedReviews);
          if (fetchedReviews.length > 0) {
            setActiveIndex(Math.floor(fetchedReviews.length / 2)); // Start in middle
          }
        }

        if (statsRes.ok) {
          const result = await statsRes.json();
          setStats(result.data || result);
        }
      } catch (error) {
        console.warn('Failed to fetch testimonials data:', error);
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  // Safe access to stats
  const reviewCount = stats?.totalReviews ?? 0;
  const averageRating = stats?.averageRating?.toFixed(1) ?? siteConfig.reviews.rating;

  // Show loading state
  if (isLoading) {
    return (
      <section className="section-padding bg-gradient-to-b from-white to-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </div>
      </section>
    );
  }

  // If no reviews from API, show a 'Coming Soon' message
  if (reviews.length === 0) {
    return (
      <section className="section-padding bg-gradient-to-b from-white to-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Customer Reviews
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
              Reviews Coming Soon
            </h2>
            <div className="flex flex-col items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Star className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-lg text-gray-600 max-w-lg">
                We are currently collecting reviews from our valued customers. 
                Check back soon to see what others are saying!
              </p>
            </div>
            
            {siteConfig.reviews.googleReviewLink && (
              <a
                href={siteConfig.reviews.googleReviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-primary font-medium hover:underline"
              >
                Have you worked with us? Leave a review →
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
              What Our Customers Say
            </h2>
            <div className="flex items-center justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="ml-2 text-xl font-semibold text-gray-900">
                {averageRating}
              </span>
              <span className="text-gray-600">({reviewCount} reviews)</span>
            </div>
          </motion.div>
        </div>

        {/* Cover Flow Container */}
        <div 
          className="relative h-[380px] flex items-center justify-center"
          style={{ perspective: '1200px' }}
        >
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 md:left-8 z-50 p-3 rounded-full bg-white/90 shadow-lg hover:bg-white hover:scale-110 transition-all"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 md:right-8 z-50 p-3 rounded-full bg-white/90 shadow-lg hover:bg-white hover:scale-110 transition-all"
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
        <div className="flex justify-center gap-2 mt-8">
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

        {/* Google Review Link */}
        {siteConfig.reviews.googleReviewLink && (
          <div className="text-center mt-8">
            <a
              href={siteConfig.reviews.googleReviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
            >
              Leave Us a Review
              <Star className="h-5 w-5" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
