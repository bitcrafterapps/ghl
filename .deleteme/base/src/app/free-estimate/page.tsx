"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, CheckCircle, Clock, Shield, Star } from "lucide-react";
import { siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";

export default function FreeEstimatePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
              Get Your Free Quote
            </h1>
            <p className="text-xl text-white/80 mb-6">
              Tell us about your project and we&apos;ll get back to you with a
              free, no-obligation quote.
            </p>

            {/* Trust Points */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>No Obligation</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Clock className="h-5 w-5 text-primary" />
                <span>Fast Response</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Shield className="h-5 w-5 text-primary" />
                <span>Licensed & Insured</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="bg-gray-50 rounded-xl p-6 sm:p-8">
                {siteConfig.ghl.formEmbed ? (
                  <div dangerouslySetInnerHTML={{ __html: siteConfig.ghl.formEmbed }} />
                ) : (
                  <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Smith"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        How can we help? *
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Briefly describe what you need help with..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      Get My Free Quote
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                      By submitting, you agree to receive calls and texts about your inquiry.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              {/* Call Us Card */}
              <div className="bg-primary text-white rounded-xl p-6 mb-6">
                <h3 className="text-xl font-heading font-semibold mb-4">
                  Prefer to Call?
                </h3>
                <p className="text-white/90 mb-4">
                  Speak directly with our team for immediate assistance.
                </p>
                <a
                  href={formatPhoneLink(siteConfig.company.phone)}
                  className="flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  {formatPhone(siteConfig.company.phone)}
                </a>
                {siteConfig.industry.emergencyService && (
                  <p className="text-sm text-white/70 text-center mt-3">
                    24/7 Emergency Service Available
                  </p>
                )}
              </div>

              {/* What to Expect */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
                  What to Expect
                </h3>
                <ul className="space-y-3">
                  {[
                    "We'll contact you within 24 hours",
                    "Schedule a convenient time for assessment",
                    "Receive a detailed, written estimate",
                    "No pressure, no obligation",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust Badges */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
                  Why Choose Us
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{siteConfig.reviews.rating}/5 Rating</p>
                      <p className="text-sm text-gray-500">{siteConfig.reviews.count}+ Reviews</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Licensed & Insured</p>
                      <p className="text-sm text-gray-500">
                        {siteConfig.company.license ? `#${siteConfig.company.license}` : "Fully Licensed"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{siteConfig.company.yearsInBusiness}+ Years</p>
                      <p className="text-sm text-gray-500">Serving {siteConfig.serviceArea.primaryCity}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
