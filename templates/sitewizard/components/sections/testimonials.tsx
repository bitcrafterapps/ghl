"use client";

import { useState, useEffect } from "react";
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

export function TestimonialsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchFeaturedReviews = async () => {
      try {
        const apiUrl = getApiUrl();
        const siteId = getSiteId();
        const headers: HeadersInit = siteId ? { 'x-site-id': siteId } : {};
        const response = await fetch(`${apiUrl}/api/v1/reviews/featured?limit=6`, { headers });
        if (response.ok) {
          const result = await response.json();
          setReviews(result.data || result || []);
        }
      } catch (error) {
        console.error('Error fetching featured reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedReviews();
  }, []);

  const nextTestimonial = () => {
    if (reviews.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }
  };

  const prevTestimonial = () => {
    if (reviews.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </div>
      </section>
    );
  }

  // If no reviews from API, show a fallback
  if (reviews.length === 0) {
    return (
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Customer Reviews
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
              What Our Customers Say
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="ml-2 text-xl font-semibold text-gray-900">
                {siteConfig.reviews.rating}
              </span>
            </div>
            <p className="text-lg text-gray-600">
              Rated {siteConfig.reviews.rating} stars based on {siteConfig.reviews.count}+ reviews
            </p>
            {siteConfig.reviews.googleReviewLink && (
              <a
                href={siteConfig.reviews.googleReviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-primary font-medium hover:underline"
              >
                View our Google Reviews →
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
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
              What Our Customers Say
            </h2>
            <div className="flex items-center justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="ml-2 text-xl font-semibold text-gray-900">
                {siteConfig.reviews.rating}
              </span>
              <span className="text-gray-600">({siteConfig.reviews.count}+ reviews)</span>
            </div>
          </motion.div>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-gray-50 rounded-2xl p-8 md:p-12"
            >
              <Quote className="h-12 w-12 text-primary/20 mb-6" />

              <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                "{reviews[currentIndex].text}"
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {reviews[currentIndex].reviewerName}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {reviews[currentIndex].reviewerLocation || siteConfig.company.city}
                  </p>
                </div>
                <div className="flex gap-1">
                  {[...Array(reviews[currentIndex].rating || 5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Dots */}
          {reviews.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === currentIndex ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
