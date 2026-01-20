"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";
import { PageHero } from "@/components/sections/PageHero";

export default function ContactPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <PageHero
        title="Contact Us"
        description="Have questions or need a quote? We're here to help. Reach out to us today!"
      />

      {/* Contact Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Get in Touch
              </h2>
              <p className="text-gray-600 mb-8">
                We'd love to hear from you. Whether you have a question about our services, 
                need a quote, or want to schedule an appointment, our team is ready to help.
              </p>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <a 
                      href={formatPhoneLink(siteConfig.company.phone)}
                      className="text-primary hover:underline text-lg"
                    >
                      {formatPhone(siteConfig.company.phone)}
                    </a>
                    {siteConfig.industry.emergencyService && (
                      <p className="text-sm text-gray-500">24/7 Emergency Service Available</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <a 
                      href={`mailto:${siteConfig.company.email}`}
                      className="text-primary hover:underline text-lg"
                    >
                      {siteConfig.company.email}
                    </a>
                    <p className="text-sm text-gray-500">We typically respond within 24 hours</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600">
                      {siteConfig.company.address}<br />
                      {siteConfig.company.city}, {siteConfig.company.state} {siteConfig.company.zip}
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Hours</h3>
                    <div className="text-gray-600 space-y-1">
                      <p>Monday - Friday: {siteConfig.hours.weekdays}</p>
                      <p>Saturday: {siteConfig.hours.saturday}</p>
                      <p>Sunday: {siteConfig.hours.sunday}</p>
                      {siteConfig.hours.emergencyNote && (
                        <p className="text-primary text-sm font-medium mt-2">{siteConfig.hours.emergencyNote}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form or GHL Embed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-gray-50 rounded-xl p-8">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                  Send Us a Message
                </h2>

                {siteConfig.ghl.formEmbed ? (
                  // GHL Form Embed
                  <div 
                    dangerouslySetInnerHTML={{ __html: siteConfig.ghl.formEmbed }}
                    className="ghl-form-container"
                  />
                ) : (
                  // Fallback Contact Form
                  <form className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
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
                          Last Name
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
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
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
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        placeholder="Tell us about your project or question..."
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" size="lg">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section (placeholder) */}
      <section className="h-96 bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-gray-600">
              {siteConfig.company.city}, {siteConfig.company.state}
            </p>
            <p className="text-gray-500 text-sm">
              Serving a {siteConfig.serviceArea.radius}-mile radius
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
