"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";

export default function ServiceAreasPage() {
  const areas = siteConfig.serviceArea.areas;

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
              Areas We Serve
            </h1>
            <p className="text-xl text-white/80 mb-8">
              {siteConfig.company.name} provides professional {siteConfig.industry.type.toLowerCase()} services 
              throughout {siteConfig.serviceArea.primaryCity} and the surrounding {siteConfig.serviceArea.radius}-mile area.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/free-estimate">Get Free Estimate</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900" asChild>
                <a href={formatPhoneLink(siteConfig.company.phone)}>
                  <Phone className="h-5 w-5 mr-2" />
                  {formatPhone(siteConfig.company.phone)}
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Areas Grid */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Areas List */}
            <div>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Communities We Serve
              </h2>
              <p className="text-gray-600 mb-8">
                We proudly serve homeowners and businesses in the following areas. 
                Don't see your city listed? Give us a call — we may still be able to help!
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {areas.map((area, index) => (
                  <motion.div
                    key={area}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg"
                  >
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{area}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-primary/5 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Not listed above?
                </h3>
                <p className="text-gray-600 mb-4">
                  We may still be able to serve your area. Contact us to check availability.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/contact" className="flex items-center gap-2">
                    Contact Us
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Service Info */}
            <div>
              <div className="bg-gray-50 rounded-xl p-8">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                  Local {siteConfig.industry.type} Experts
                </h2>
                
                <div className="space-y-6">
                  {/* Headquarters */}
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Headquarters</h3>
                      <p className="text-gray-600">
                        {siteConfig.company.address}<br />
                        {siteConfig.company.city}, {siteConfig.company.state} {siteConfig.company.zip}
                      </p>
                    </div>
                  </div>

                  {/* Service Radius */}
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Service Radius</h3>
                      <p className="text-gray-600">
                        We serve customers within a {siteConfig.serviceArea.radius}-mile radius of {siteConfig.serviceArea.primaryCity}.
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
                      <div className="text-gray-600 text-sm space-y-1">
                        <p>Mon-Fri: {siteConfig.hours.weekdays}</p>
                        <p>Saturday: {siteConfig.hours.saturday}</p>
                        <p>Sunday: {siteConfig.hours.sunday}</p>
                        {siteConfig.hours.emergencyNote && (
                          <p className="text-primary font-medium">{siteConfig.hours.emergencyNote}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Call Us</h3>
                      <a 
                        href={formatPhoneLink(siteConfig.company.phone)}
                        className="text-primary font-medium hover:underline"
                      >
                        {formatPhone(siteConfig.company.phone)}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/free-estimate">Schedule Free Estimate</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
