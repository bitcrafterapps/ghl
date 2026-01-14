"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Clock } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/data/config";
import { formatPhone, formatPhoneLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ServiceAreaSection() {
  const areas = siteConfig.serviceArea.areas;

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Service Areas
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
              Proudly Serving {siteConfig.serviceArea.primaryCity} & Surrounding Areas
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              We provide professional {siteConfig.industry.type.toLowerCase()} services 
              within a {siteConfig.serviceArea.radius}-mile radius of {siteConfig.serviceArea.primaryCity}. 
              Our team is ready to help homeowners and businesses throughout the region.
            </p>

            {/* Areas Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {areas.map((area, index) => (
                <motion.div
                  key={area}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm"
                >
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-gray-700">{area}</span>
                </motion.div>
              ))}
            </div>

            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <Link href="/service-areas">View All Service Areas</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href={formatPhoneLink(siteConfig.company.phone)} className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {formatPhone(siteConfig.company.phone)}
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Map Placeholder / Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {/* Map placeholder - replace with actual map if needed */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 aspect-square flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                <p className="text-xl font-heading font-semibold text-gray-900">
                  {siteConfig.serviceArea.primaryCity}, {siteConfig.company.state}
                </p>
                <p className="text-gray-600">
                  {siteConfig.serviceArea.radius} mile service radius
                </p>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <Clock className="h-6 w-6 text-primary mb-2" />
                <p className="font-semibold text-gray-900 text-sm">Business Hours</p>
                <p className="text-gray-600 text-xs">{siteConfig.hours.weekdays}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <Phone className="h-6 w-6 text-primary mb-2" />
                <p className="font-semibold text-gray-900 text-sm">Call Us</p>
                <p className="text-gray-600 text-xs">{formatPhone(siteConfig.company.phone)}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
