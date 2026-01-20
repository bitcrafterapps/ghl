"use client";

import { motion } from "framer-motion";
import { MapPin, CheckCircle } from "lucide-react";
import { siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ServiceAreaSection() {
  return (
    <section id="service-area" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold uppercase tracking-wide">
              Service Area
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
              Proudly Serving {siteConfig.serviceArea.primaryCity} &amp; Surrounding Areas
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {siteConfig.company.name} provides professional {siteConfig.industry.type.toLowerCase()} services
              throughout {siteConfig.company.stateFullName}. We serve a {siteConfig.serviceArea.radius}-mile
              radius from {siteConfig.serviceArea.primaryCity}, ensuring prompt response times for all
              our valued customers.
            </p>

            {/* Cities Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {siteConfig.serviceArea.areas.slice(0, 12).map((city: string, index: number) => (
                <motion.div
                  key={city}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-gray-700">{city}</span>
                </motion.div>
              ))}
            </div>

            <Button size="lg" asChild>
              <Link href="/service-areas">
                <MapPin className="h-5 w-5 mr-2" />
                View All Service Areas
              </Link>
            </Button>
          </motion.div>

          {/* Right Content - Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gray-200 rounded-2xl overflow-hidden aspect-[4/3] shadow-lg">
              {/* Google Maps Embed or Static Map */}
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(
                  `${siteConfig.company.city}, ${siteConfig.company.state}`
                )}&zoom=10`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Service Area Map"
              />
            </div>

            {/* Service Radius Badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-full shadow-lg">
              <span className="font-semibold">
                {siteConfig.serviceArea.radius}-Mile Service Radius
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
