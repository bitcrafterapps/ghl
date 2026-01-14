"use client";

import { motion } from "framer-motion";
import { Phone, Star, Clock, Shield, CheckCircle } from "lucide-react";
import { siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Trust Badge */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-white/90">
                {siteConfig.reviews.rating} Rating • {siteConfig.reviews.count}+ Reviews
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-tight">
              South Orange County&apos;s Most Trusted{" "}
              <span className="text-primary">{siteConfig.industry.type}</span>{" "}
              {siteConfig.industry.serviceNoun}
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-white/80 mb-8 max-w-xl">
              Professional {siteConfig.industry.type.toLowerCase()} services with{" "}
              {siteConfig.company.yearsInBusiness}+ years of experience. Licensed,
              insured, and committed to your satisfaction.
            </p>

            {/* Trust Points */}
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-2 text-white/90">
                <Shield className="h-5 w-5 text-primary" />
                <span>Licensed & Insured</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Free Estimates</span>
              </div>
              {siteConfig.industry.emergencyService && (
                <div className="flex items-center gap-2 text-white/90">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>24/7 Emergency</span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="xl" asChild>
                <Link href="/free-estimate">Get Your Free Estimate</Link>
              </Button>
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900" asChild>
                <a href={formatPhoneLink(siteConfig.company.phone)}>
                  <Phone className="h-5 w-5 mr-2" />
                  {formatPhone(siteConfig.company.phone)}
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Right Content - Quote Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-2xl"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                Get Your Free Estimate
              </h2>
              <p className="text-gray-600">
                Fast response • No obligation • Free quote
              </p>
            </div>

            {/* GHL Form Embed Placeholder */}
            <div className="space-y-4">
              <div
                dangerouslySetInnerHTML={{ __html: siteConfig.ghl.formEmbed || `
                  <form class="space-y-4">
                    <div>
                      <input type="text" placeholder="Full Name *" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required />
                    </div>
                    <div>
                      <input type="tel" placeholder="Phone Number *" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required />
                    </div>
                    <div>
                      <input type="email" placeholder="Email Address *" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required />
                    </div>
                    <div>
                      <select class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="">Select Service Needed</option>
                      </select>
                    </div>
                    <div>
                      <textarea placeholder="Describe your project..." rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                    </div>
                    <button type="submit" class="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                      Get My Free Estimate
                    </button>
                  </form>
                ` }}
              />
              <p className="text-xs text-center text-gray-500">
                By submitting, you agree to receive calls and texts about your inquiry.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
