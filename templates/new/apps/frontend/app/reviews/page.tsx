"use client";

import { useState, useEffect } from "react";
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

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const apiUrl = getApiUrl();
        const siteId = getSiteId();
        const headers: HeadersInit = siteId ? { 'x-site-id': siteId } : {};

        // Fetch reviews and stats in parallel with site scoping
        const [reviewsResponse, statsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/v1/reviews?status=published`, { headers }),
          fetch(`${apiUrl}/api/v1/reviews/stats`, { headers })
        ]);

        if (reviewsResponse.ok) {
          const reviewsResult = await reviewsResponse.json();
          setReviews(reviewsResult.data || reviewsResult || []);
        }

        if (statsResponse.ok) {
          const statsResult = await statsResponse.json();
          setStats(statsResult.data || statsResult);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
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

  const displayRating = stats?.averageRating?.toFixed(1) || siteConfig.reviews.rating;
  const displayCount = stats?.totalReviews || siteConfig.reviews.count;

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
            Customer Reviews
          </h1>
          <p className="text-xl text-white/80 mb-8">
            See what our customers are saying about {siteConfig.company.name}.
            We're proud of our {displayRating}-star rating!
          </p>

          {/* Rating Summary */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur px-6 py-4 rounded-xl">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-2xl font-bold text-white">{displayRating}</span>
            <span className="text-white/70">({displayCount}+ reviews)</span>
          </div>

          {siteConfig.reviews.googleReviewLink && (
            <div className="mt-6">
              <a
                href={siteConfig.reviews.googleReviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white hover:text-primary transition-colors"
              >
                View our Google Reviews
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </motion.div>
      </PageHero>

      {/* Testimonials Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : reviews.length > 0 ? (
            <>
              {/* Featured Testimonial Carousel */}
              <div className="max-w-4xl mx-auto mb-16 relative">
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

              {/* All Reviews Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl p-6"
                  >
                    <div className="flex gap-1 mb-4">
                      {[...Array(review.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 line-clamp-4">
                      "{review.text}"
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900">{review.reviewerName}</p>
                      <p className="text-gray-600 text-sm">
                        {review.reviewerLocation || siteConfig.company.city}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                {displayRating}-Star Rated on Google
              </h2>
              <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                We're proud to have {displayCount}+ satisfied customers.
                Check out our reviews on Google!
              </p>
              {siteConfig.reviews.googleReviewLink && (
                <Button asChild>
                  <a
                    href={siteConfig.reviews.googleReviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    View Google Reviews
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
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
