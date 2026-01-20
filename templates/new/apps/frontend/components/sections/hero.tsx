"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Star, Shield, Clock, CheckCircle, Sparkles, ArrowRight, User, Mail, MessageSquare } from "lucide-react";
import { siteConfig, services } from "@/data/config";
import { formatPhone, formatPhoneLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getApiUrl, getSiteId } from "@/lib/api";

export function HeroSection() {
  // Get hero gradient colors from branding, fallback to default dark gradient
  const heroBgFrom = siteConfig.branding.heroBgFrom || '';
  const heroBgTo = siteConfig.branding.heroBgTo || '';
  const heroPattern = siteConfig.branding.heroPattern || 'none';
  const hasCustomGradient = heroBgFrom && heroBgTo && heroBgFrom !== '' && heroBgTo !== '';
  
  // Build gradient style
  const gradientStyle = hasCustomGradient 
    ? { background: `linear-gradient(135deg, ${heroBgFrom} 0%, ${heroBgTo} 100%)` }
    : undefined;

  // Pattern SVG options
  const patterns: Record<string, string> = {
    crosses: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    dots: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
    grid: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.2'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
    diagonal: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.15'%3E%3Cpath d='M0 40L40 0M-10 10L10 -10M30 50L50 30'/%3E%3C/g%3E%3C/svg%3E")`,
    waves: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q25 0, 50 10 T100 10' stroke='%23ffffff' stroke-opacity='0.15' fill='none'/%3E%3C/svg%3E")`,
    hexagons: `url("data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.15'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.35 11-6.35V17.9l-11-6.35L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/svg%3E")`,
    circles: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='12' stroke='%23ffffff' stroke-opacity='0.12' fill='none'/%3E%3C/svg%3E")`,
  };

  const [stats, setStats] = useState<{ averageRating: number; totalReviews: number } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = getApiUrl();
        const siteId = getSiteId();
        const headers: HeadersInit = siteId ? { 'x-site-id': siteId } : {};
        const response = await fetch(`${apiUrl}/api/v1/reviews/stats`, { headers });
        if (response.ok) {
           const result = await response.json();
           setStats(result.data || result);
        }
      } catch (e) {
         console.warn("Failed to fetch hero stats", e);
      }
    };
    fetchStats();
  }, []);

  // Determine valid stats or fallback
  const hasNoReviews = stats !== null && stats.totalReviews === 0;
  const displayRating = stats?.averageRating?.toFixed(1) ?? siteConfig.reviews.rating;
  const displayCount = stats?.totalReviews ?? siteConfig.reviews.count;
  
  return (
    <section 
      className="relative min-h-[85vh] flex items-center overflow-hidden"
      style={gradientStyle}
    >
      {/* Background - Either custom gradient or default gradient */}
      {!hasCustomGradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      )}
      
      {/* Background Pattern - Only if pattern is selected */}
      {heroPattern !== 'none' && patterns[heroPattern] && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: patterns[heroPattern],
          }} />
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />

      <div className="container-custom relative z-10 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Trust Badge */}
            {!hasNoReviews && (
              <div className="flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 w-fit">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-white/90 text-sm">
                  {displayRating} • {displayCount}+ Reviews
                </span>
              </div>
            )}

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
              {siteConfig.company.license ? (
                <div className="flex items-center gap-2 text-white/90 bg-white/5 px-4 py-2 rounded-full">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span>Licensed & Insured • Lic# {siteConfig.company.license}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white/90 bg-white/5 px-4 py-2 rounded-full">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span>Dependable & Reliable</span>
                </div>
              )}
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


          </motion.div>

          {/* Right Content - Compact Modern Quote Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/95 backdrop-blur-md rounded-xl p-5 shadow-2xl border border-white/20"
          >
            {/* Compact Form Header */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1.5 text-primary font-medium text-xs uppercase tracking-wider mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Free Quote</span>
              </div>
              <h2 className="text-xl font-heading font-bold text-gray-900">
                Get Your Free Estimate
              </h2>
              <p className="text-gray-500 text-xs mt-1">
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
                className="space-y-2.5"
              >
                {/* Hidden fields for GHL tracking */}
                <input type="hidden" name="source" value="website-hero" />
                <input type="hidden" name="page_url" value={typeof window !== 'undefined' ? window.location.href : ''} />
                
                {/* Name & Phone Row */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Full Name *" 
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50/50 text-gray-900 placeholder-gray-400 transition-all" 
                      required 
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      type="tel" 
                      name="phone"
                      placeholder="Phone *" 
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50/50 text-gray-900 placeholder-gray-400 transition-all" 
                      required 
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Email Address *" 
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50/50 text-gray-900 placeholder-gray-400 transition-all" 
                    required 
                  />
                </div>

                {/* Service Select */}
                <div className="relative">
                  <select 
                    name="service"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50/50 text-gray-900 appearance-none cursor-pointer transition-all"
                  >
                    <option value="">Select Service Needed</option>
                    {services.map((service: { slug: string; name: string }) => (
                      <option key={service.slug} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Message */}
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea 
                    name="message"
                    placeholder="Describe your project..." 
                    rows={2} 
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50/50 text-gray-900 placeholder-gray-400 resize-none transition-all"
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  Get My Free Estimate
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
            
            <p className="text-[10px] text-center text-gray-400 mt-3">
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
