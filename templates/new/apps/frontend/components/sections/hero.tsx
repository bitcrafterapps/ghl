"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Star, Shield, Clock, CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { siteConfig, services } from "@/data/config";
import { formatPhone, formatPhoneLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />

      <div className="container-custom relative z-10 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Trust Badge */}
            <div className="flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 w-fit">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-white/90 text-sm">
                {siteConfig.reviews.rating} • {siteConfig.reviews.count}+ Reviews
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-tight">
              {siteConfig.serviceArea.primaryCity}&apos;s Most Trusted{" "}
              <span className="text-primary">{siteConfig.industry.type}</span>{" "}
              Experts
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-white/80 mb-8 max-w-xl">
              Professional {siteConfig.industry.type.toLowerCase()} services with{" "}
              {siteConfig.company.yearsInBusiness}+ years of experience. Licensed,
              insured, and committed to your satisfaction.
            </p>

            {/* Trust Points */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-white/90 bg-white/5 px-4 py-2 rounded-full">
                <Shield className="h-5 w-5 text-green-400" />
                <span>Licensed & Insured</span>
              </div>
              <div className="flex items-center gap-2 text-white/90 bg-white/5 px-4 py-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Free Estimates</span>
              </div>
              {siteConfig.industry.emergencyService && (
                <div className="flex items-center gap-2 text-white/90 bg-white/5 px-4 py-2 rounded-full">
                  <Clock className="h-5 w-5 text-yellow-400" />
                  <span>24/7 Emergency</span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-lg">
                <Link href="/free-estimate" className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Get Your Free Estimate
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-gray-900 text-lg" 
                asChild
              >
                <a href={formatPhoneLink(siteConfig.company.phone)} className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
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
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl"
          >
            {/* Form Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 text-primary font-medium text-sm mb-2">
                <Sparkles className="h-4 w-4" />
                <span>Free Quote</span>
              </div>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                Get Your Free Estimate
              </h2>
              <p className="text-gray-600 text-sm">
                Fast response • No obligation • Free quote
              </p>
            </div>

            {/* Lead Capture Form - Will be replaced by GHL embed if provided */}
            {siteConfig.ghl.formEmbed ? (
              <div 
                className="ghl-form-container"
                dangerouslySetInnerHTML={{ __html: siteConfig.ghl.formEmbed }}
              />
            ) : (
              <form 
                action="{{GHL_WEBHOOK_URL}}" 
                method="POST" 
                className="space-y-4"
              >
                {/* Hidden fields for GHL tracking */}
                <input type="hidden" name="source" value="website-hero" />
                <input type="hidden" name="page_url" value={typeof window !== 'undefined' ? window.location.href : ''} />
                
                <div>
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Full Name *" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900 placeholder-gray-500" 
                    required 
                  />
                </div>
                <div>
                  <input 
                    type="tel" 
                    name="phone"
                    placeholder="Phone Number *" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900 placeholder-gray-500" 
                    required 
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Email Address *" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900 placeholder-gray-500" 
                    required 
                  />
                </div>
                <div>
                  <select 
                    name="service"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select Service Needed</option>
                    {services.map((service: { slug: string; name: string }) => (
                      <option key={service.slug} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <textarea 
                    name="message"
                    placeholder="Describe your project..." 
                    rows={3} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900 placeholder-gray-500 resize-none"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  Get My Free Estimate
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            )}
            
            <p className="text-xs text-center text-gray-500 mt-4">
              By submitting, you agree to receive calls and texts about your inquiry.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
