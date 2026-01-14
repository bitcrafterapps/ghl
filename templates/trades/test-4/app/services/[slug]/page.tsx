"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, CheckCircle, Calendar } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { services, siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";

interface ServicePageProps {
  params: {
    slug: string;
  };
}

export default function ServiceDetailPage({ params }: ServicePageProps) {
  const service = services.find((s: any) => s.slug === params.slug);

  if (!service) {
    notFound();
  }

  // Get related services (exclude current service)
  const relatedServices = services
    .filter((s: any) => s.slug !== params.slug)
    .slice(0, 3);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </Link>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
                  {service.name}
                </h1>
                <p className="text-xl text-white/80 mb-8">
                  {service.description || service.shortDescription}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link href="/free-estimate" className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Get Free Estimate
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900" asChild>
                    <a href={formatPhoneLink(siteConfig.company.phone)}>
                      <Phone className="h-5 w-5 mr-2" />
                      {formatPhone(siteConfig.company.phone)}
                    </a>
                  </Button>
                </div>
              </div>

              {/* Service Image */}
              <div className="relative hidden lg:block">
                <div className="rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={service.image || `https://placehold.co/600x400/1a1a2e/ffffff?text=${encodeURIComponent(service.name)}`}
                    alt={service.name}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Details */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                  About Our {service.name} Service
                </h2>
                <div className="prose prose-lg max-w-none text-gray-600">
                  <p>
                    {siteConfig.company.name} provides professional {service.name.toLowerCase()} services 
                    in {siteConfig.serviceArea.primaryCity} and throughout {siteConfig.company.stateFullName}. 
                    With over {siteConfig.company.yearsInBusiness} years of experience, our licensed and 
                    insured team delivers quality workmanship on every project.
                  </p>
                  <p>
                    Whether you need residential or commercial {service.name.toLowerCase()}, 
                    we're committed to providing reliable, efficient service at competitive prices. 
                    Contact us today for a free estimate.
                  </p>
                </div>

                {/* Features/Benefits */}
                <h3 className="text-xl font-heading font-semibold text-gray-900 mt-8 mb-4">
                  Why Choose Us for {service.name}
                </h3>
                <ul className="space-y-3">
                  {[
                    "Licensed, bonded, and insured professionals",
                    "Upfront pricing with no hidden fees",
                    `${siteConfig.company.yearsInBusiness}+ years of industry experience`,
                    "Satisfaction guaranteed on all work",
                    siteConfig.industry.emergencyService ? "24/7 emergency service available" : "Fast response times",
                    "Free estimates for all projects",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-xl p-6 sticky top-24"
              >
                <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-gray-600 mb-6">
                  Contact us today for a free estimate on your {service.name.toLowerCase()} project.
                </p>
                <div className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/free-estimate">Request Free Estimate</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={formatPhoneLink(siteConfig.company.phone)} className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      {formatPhone(siteConfig.company.phone)}
                    </a>
                  </Button>
                </div>

                {/* Service Area */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-500">
                    Serving {siteConfig.serviceArea.primaryCity} and surrounding areas including{" "}
                    {siteConfig.serviceArea.areas.slice(0, 3).join(", ")}.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-custom">
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-8 text-center">
              Other Services You May Need
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedServices.map((related: any) => (
                <Link
                  key={related.slug}
                  href={`/services/${related.slug}`}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {related.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {related.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
