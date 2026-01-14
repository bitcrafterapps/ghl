"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink, formatEmailLink, formatAddressLink } from "@/lib/utils";

export default function ContactPage() {
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
              Contact Us
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Have a question or need service? We&apos;re here to help. Reach out to
              us today and we&apos;ll get back to you as soon as possible.
            </p>
            {siteConfig.industry.emergencyService && (
              <div className="inline-flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-white font-medium">24/7 Emergency Service Available</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Send Us a Message
              </h2>

              {/* GHL Form Embed or Default Form */}
              <div className="bg-gray-50 rounded-xl p-6">
                {siteConfig.ghl.formEmbed ? (
                  <div dangerouslySetInnerHTML={{ __html: siteConfig.ghl.formEmbed }} />
                ) : (
                  <form className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        How Can We Help? *
                      </label>
                      <textarea
                        rows={4}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Tell us about your project or question..."
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      Send Message
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                      By submitting, you agree to receive calls and texts about your inquiry.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Get in Touch
              </h2>

              <div className="space-y-6">
                {/* Phone */}
                <a
                  href={formatPhoneLink(siteConfig.company.phone)}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p className="text-primary text-lg font-medium">
                      {formatPhone(siteConfig.company.phone)}
                    </p>
                    <p className="text-sm text-gray-500">Call or text us anytime</p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href={formatEmailLink(siteConfig.company.email)}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-primary">{siteConfig.company.email}</p>
                    <p className="text-sm text-gray-500">We&apos;ll respond within 24 hours</p>
                  </div>
                </a>

                {/* Address */}
                <a
                  href={formatAddressLink(
                    siteConfig.company.address,
                    siteConfig.company.city,
                    siteConfig.company.state,
                    siteConfig.company.zip
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Location</p>
                    <p className="text-gray-600">
                      {siteConfig.company.address}<br />
                      {siteConfig.company.city}, {siteConfig.company.state} {siteConfig.company.zip}
                    </p>
                    <p className="text-sm text-primary">Get Directions →</p>
                  </div>
                </a>

                {/* Hours */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Business Hours</p>
                    <div className="text-gray-600 text-sm space-y-1 mt-1">
                      <p>Mon-Fri: {siteConfig.hours.weekdays}</p>
                      <p>Saturday: {siteConfig.hours.saturday}</p>
                      <p>Sunday: {siteConfig.hours.sunday}</p>
                    </div>
                    {siteConfig.industry.emergencyService && (
                      <p className="text-primary text-sm font-medium mt-2">
                        24/7 Emergency Service Available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="mt-8 rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(
                    `${siteConfig.company.address}, ${siteConfig.company.city}, ${siteConfig.company.state} ${siteConfig.company.zip}`
                  )}`}
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Our Location"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Emergency CTA */}
      {siteConfig.industry.emergencyService && (
        <section className="bg-red-600 py-8">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-white text-center md:text-left">
                <p className="font-bold text-xl">
                  {siteConfig.industry.type} Emergency?
                </p>
                <p className="text-white/90">
                  We&apos;re available 24/7 for urgent service calls.
                </p>
              </div>
              <Button size="lg" className="bg-white text-red-600 hover:bg-white/90" asChild>
                <a href={formatPhoneLink(siteConfig.company.phone)}>
                  <Phone className="h-5 w-5 mr-2" />
                  Call Now: {formatPhone(siteConfig.company.phone)}
                </a>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Free Estimate CTA */}
      <section className="bg-primary py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Need a Free Estimate?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get a detailed, no-obligation estimate for your{" "}
            {siteConfig.industry.type.toLowerCase()} project.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
            <Link href="/free-estimate">
              <MessageCircle className="h-5 w-5 mr-2" />
              Get Free Estimate
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
