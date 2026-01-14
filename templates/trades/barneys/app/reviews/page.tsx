"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, Phone, ExternalLink } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { testimonials, siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";

export default function ReviewsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    if (testimonials.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }
  };

  const prevTestimonial = () => {
    if (testimonials.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="container-custom">
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
              We're proud of our {siteConfig.reviews.rating}-star rating!
            </p>
            
            {/* Rating Summary */}
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur px-6 py-4 rounded-xl">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-2xl font-bold text-white">{siteConfig.reviews.rating}</span>
              <span className="text-white/70">({siteConfig.reviews.count}+ reviews)</span>
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
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          {testimonials && testimonials.length > 0 ? (
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
                      "{testimonials[currentIndex].text}"
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {testimonials[currentIndex].name}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {testimonials[currentIndex].location || siteConfig.company.city}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(testimonials[currentIndex].rating || 5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                {testimonials.length > 1 && (
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
                {testimonials.length > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {testimonials.map((_, i) => (
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
                {testimonials.map((testimonial: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl p-6"
                  >
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 line-clamp-4">
                      "{testimonial.text}"
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-gray-600 text-sm">
                        {testimonial.location || siteConfig.company.city}
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
                {siteConfig.reviews.rating}-Star Rated on Google
              </h2>
              <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                We're proud to have {siteConfig.reviews.count}+ satisfied customers. 
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
            Experience the quality service that's earned us {siteConfig.reviews.count}+ 5-star reviews.
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
