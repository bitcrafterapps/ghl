"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { services, siteConfig } from "@/data/config";

export function ServicesSection() {
  // Show only first 6 services on homepage
  const displayServices = services.slice(0, 6);

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Our Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
              Professional {siteConfig.industry.type} Solutions
            </h2>
            <p className="text-lg text-gray-600">
              From {siteConfig.industry.serviceVerb} to maintenance, we provide 
              comprehensive {siteConfig.industry.type.toLowerCase()} services for 
              residential and commercial properties.
            </p>
          </motion.div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service: any, index: number) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/services/${service.slug}`}
                className="block bg-white rounded-xl border overflow-hidden hover:shadow-xl transition-all duration-300 h-full group"
              >
                {/* Service Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <Image
                    src={service.image || `https://placehold.co/600x400/1a1a2e/ffffff?text=${encodeURIComponent(service.name)}`}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                {/* Service Content */}
                <div className="p-6">
                  <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {service.shortDescription || service.description}
                  </p>
                  <span className="inline-flex items-center text-primary font-medium group-hover:gap-3 transition-all">
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Services */}
        {services.length > 6 && (
          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
            >
              View All Services
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
