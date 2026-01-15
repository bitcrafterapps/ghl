"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { services, siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";

export default function ServicesPage() {
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
              Our {siteConfig.industry.type} Services
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Professional {siteConfig.industry.type.toLowerCase()} solutions for
              residential and commercial properties in {siteConfig.serviceArea.primaryCity}{" "}
              and surrounding areas.
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

      {/* Services Grid */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service: any, index: number) => (
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
                  <div className="relative h-48 overflow-hidden">
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
                    <h2 className="text-xl font-heading font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {service.name}
                    </h2>
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Need {siteConfig.industry.type} Help?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Contact us today for a free estimate. Our expert team is ready to help
            with all your {siteConfig.industry.type.toLowerCase()} needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link href="/free-estimate">Get Your Free Estimate</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
              <a href={formatPhoneLink(siteConfig.company.phone)}>
                <Phone className="h-5 w-5 mr-2" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
