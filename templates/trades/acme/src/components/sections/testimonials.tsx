"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { testimonials, siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function TestimonialsSection() {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section id="reviews" className="section-padding bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-primary font-semibold uppercase tracking-wide">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
            What Our Customers Say
          </h2>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg text-gray-600">
              {siteConfig.reviews.rating}/5 from {siteConfig.reviews.count}+ reviews
            </span>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.slice(0, 6).map((testimonial: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-xl p-6 relative"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />

              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < (testimonial.rating || 5)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 mb-4 line-clamp-4">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Reviewer Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {testimonial.name?.charAt(0) || "A"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  {testimonial.location && (
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  )}
                </div>
              </div>

              {/* Service Tag */}
              {testimonial.service && (
                <span className="inline-block mt-4 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {testimonial.service}
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* View All & Google Review CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
        >
          <Button size="lg" asChild>
            <Link href="/reviews">Read All Reviews</Link>
          </Button>
          {siteConfig.reviews.googleReviewLink && (
            <Button size="lg" variant="outline" asChild>
              <a
                href={siteConfig.reviews.googleReviewLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Leave Us a Review
              </a>
            </Button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
