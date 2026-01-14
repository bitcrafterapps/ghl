"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, Star, Quote, ExternalLink } from "lucide-react";
import { siteConfig, testimonials } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";

export default function ReviewsPage() {
  return (
    <>
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
            <p className="text-xl text-white/80 mb-6">
              Don&apos;t just take our word for it. See what our customers have to say
              about {siteConfig.company.name}.
            </p>

            {/* Rating Summary */}
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur px-6 py-4 rounded-xl">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < Math.floor(parseFloat(siteConfig.reviews.rating))
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-400"
                    }`}
                  />
                ))}
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-xl">{siteConfig.reviews.rating}/5</p>
                <p className="text-white/70 text-sm">{siteConfig.reviews.count}+ Reviews</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Leave Review CTA */}
      <section className="bg-primary py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white text-center md:text-left">
              <p className="font-semibold text-lg">Had a great experience with us?</p>
              <p className="text-white/80">We&apos;d love to hear your feedback!</p>
            </div>
            {siteConfig.reviews.googleReviewLink && (
              <Button className="bg-white text-primary hover:bg-white/90" asChild>
                <a
                  href={siteConfig.reviews.googleReviewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Leave Us a Review
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          {testimonials && testimonials.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial: any, index: number) => (
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
                  <p className="text-gray-700 mb-4">
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No reviews yet.</p>
              {siteConfig.reviews.googleReviewLink && (
                <Button asChild>
                  <a
                    href={siteConfig.reviews.googleReviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Be the First to Leave a Review
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
              Why Customers Trust Us
            </h2>
            <p className="text-gray-600">
              We&apos;ve built our reputation on delivering exceptional service, every time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                stat: `${siteConfig.company.yearsInBusiness}+`,
                label: "Years in Business",
                description: "Decades of experience serving our community",
              },
              {
                stat: `${siteConfig.reviews.count}+`,
                label: "Happy Customers",
                description: "Thousands of satisfied homeowners",
              },
              {
                stat: `${siteConfig.reviews.rating}/5`,
                label: "Average Rating",
                description: "Consistently rated among the best",
              },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 text-center shadow-sm"
              >
                <div className="text-4xl font-bold text-primary mb-2">{item.stat}</div>
                <div className="font-heading font-semibold text-gray-900 mb-1">
                  {item.label}
                </div>
                <div className="text-gray-600 text-sm">{item.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Ready to Experience Our Service?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join our growing list of satisfied customers. Contact us today for a
            free estimate.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link href="/free-estimate">Get Your Free Estimate</Link>
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
    </>
  );
}
