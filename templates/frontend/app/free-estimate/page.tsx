"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Calendar, CheckCircle, Clock, Shield, Award } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";
import { PageHero } from "@/components/sections/PageHero";

export default function FreeEstimatePage() {
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
            Get Your Free Estimate
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Schedule a free, no-obligation estimate for your {siteConfig.industry.type.toLowerCase()} project. 
            Our experts will assess your needs and provide transparent pricing.
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-white text-sm">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>No Obligation</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-white text-sm">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Transparent Pricing</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-white text-sm">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Expert Consultation</span>
            </div>
          </div>
        </motion.div>
      </PageHero>

      {/* Form Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">
                  Why Choose {siteConfig.company.name}?
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Licensed & Insured</h3>
                      <p className="text-gray-600 text-sm">Fully licensed, bonded, and insured for your protection.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{siteConfig.company.yearsInBusiness}+ Years Experience</h3>
                      <p className="text-gray-600 text-sm">Decades of expertise in {siteConfig.industry.type.toLowerCase()} services.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Fast Response</h3>
                      <p className="text-gray-600 text-sm">
                        {siteConfig.industry.emergencyService 
                          ? "24/7 emergency service available." 
                          : "Quick response times for all inquiries."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Call CTA */}
                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                  <p className="font-semibold text-gray-900 mb-2">Prefer to call?</p>
                  <a 
                    href={formatPhoneLink(siteConfig.company.phone)}
                    className="inline-flex items-center gap-2 text-primary text-xl font-bold hover:underline"
                  >
                    <Phone className="h-5 w-5" />
                    {formatPhone(siteConfig.company.phone)}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="bg-gray-50 rounded-xl p-8">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                  Schedule Your Free Estimate
                </h2>

                {siteConfig.ghl.calendarEmbed ? (
                  // GHL Calendar Embed
                  <div 
                    dangerouslySetInnerHTML={{ __html: siteConfig.ghl.calendarEmbed }}
                    className="ghl-calendar-container"
                  />
                ) : siteConfig.ghl.formEmbed ? (
                  // GHL Form Embed
                  <div 
                    dangerouslySetInnerHTML={{ __html: siteConfig.ghl.formEmbed }}
                    className="ghl-form-container"
                  />
                ) : (
                  // Fallback Form
                  <form className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Service Address *
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Street address"
                      />
                    </div>
                    
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          required
                          defaultValue={siteConfig.company.state}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP *
                        </label>
                        <input
                          type="text"
                          id="zip"
                          name="zip"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="projectDetails" className="block text-sm font-medium text-gray-700 mb-2">
                        Project Details
                      </label>
                      <textarea
                        id="projectDetails"
                        name="projectDetails"
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        placeholder="Tell us about your project - type of service needed, any specific concerns, preferred timing, etc."
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" size="lg">
                      <Calendar className="h-5 w-5 mr-2" />
                      Request Free Estimate
                    </Button>
                    
                    <p className="text-center text-gray-500 text-sm">
                      By submitting this form, you agree to be contacted by {siteConfig.company.name} regarding your request.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
