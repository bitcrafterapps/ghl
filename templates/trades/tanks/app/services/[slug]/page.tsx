"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, CheckCircle, Calendar, Clock, Shield, Award, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { services, siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const service = services.find((s: any) => s.slug === slug);

  if (!service) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
            <Button asChild>
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Get related services (exclude current service)
  const otherServices = services.filter((s: any) => s.slug !== slug).slice(0, 3);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Services
              </Link>
              <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
                {service.name}
              </h1>
              <p className="text-xl text-white/80 mb-8">
                {service.description || service.shortDescription}
              </p>

              {/* Trust Points */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-white/90">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Licensed & Insured</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Award className="h-5 w-5 text-primary" />
                  <span>{siteConfig.company.yearsInBusiness}+ Years Experience</span>
                </div>
                {siteConfig.industry.emergencyService && (
                  <div className="flex items-center gap-2 text-white/90">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>24/7 Emergency</span>
                  </div>
                )}
              </div>

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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative hidden lg:block"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={service.image || `https://placehold.co/800x600/1a1a2e/ffffff?text=${encodeURIComponent(service.name)}`}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
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
                <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
                  About Our {service.name} Service
                </h2>
                <div className="prose prose-lg max-w-none text-gray-600" data-testid="service-description">
                  {service.longDescription ? (
                    <div 
                      className="text-lg leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: service.longDescription.replace(/\n/g, '<br/>') }} 
                    />
                  ) : (
                    <div className="fallback-text">
                      <p className="mb-4">
                        At {siteConfig.company.name}, we provide professional {service.name.toLowerCase()} services
                        to homeowners and businesses throughout {siteConfig.serviceArea.primaryCity} and
                        the surrounding {siteConfig.company.stateFullName} area.
                      </p>
                      <p>
                        With {siteConfig.company.yearsInBusiness}+ years of experience, our licensed
                        technicians deliver quality workmanship you can trust. We use the latest
                        equipment and techniques to ensure every job is done right the first time.
                      </p>
                    </div>
                  )}
                </div>

                {/* Benefits */}
                <div className="mt-8">
                  <h3 className="text-xl font-heading font-semibold text-gray-900 mb-4">
                    Why Choose Us for {service.name}
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Licensed and insured professionals",
                      "Upfront, transparent pricing",
                      "Same-day service available",
                      "100% satisfaction guarantee",
                      "Clean and courteous technicians",
                      "Quality parts and materials",
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Contact Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-xl p-6 sticky top-24"
              >
                <h3 className="text-xl font-heading font-semibold text-gray-900 mb-4">
                  Get a Free Estimate
                </h3>
                <p className="text-gray-600 mb-6">
                  Ready to get started? Contact us today for a free, no-obligation estimate.
                </p>

                <div className="space-y-4">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/free-estimate">Request Estimate</Link>
                  </Button>

                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <a href={formatPhoneLink(siteConfig.company.phone)}>
                      <Phone className="h-5 w-5 mr-2" />
                      {formatPhone(siteConfig.company.phone)}
                    </a>
                  </Button>
                </div>

                {siteConfig.industry.emergencyService && (
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium text-primary">
                      🚨 24/7 Emergency Service Available
                    </p>
                  </div>
                )}

                {/* Service Area */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-2">Service Area</h4>
                  <p className="text-sm text-gray-600">
                    Serving {siteConfig.serviceArea.primaryCity} and surrounding areas
                    within a {siteConfig.serviceArea.radius}-mile radius.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Services */}
      {otherServices.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-custom">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-8 text-center">
              Other Services We Offer
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {otherServices.map((otherService: any, index: number) => (
                <motion.div
                  key={otherService.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/services/${otherService.slug}`}
                    className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow group"
                  >
                    <div className="text-4xl mb-4">{otherService.icon || "🔧"}</div>
                    <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {otherService.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {otherService.shortDescription}
                    </p>
                    <span className="inline-flex items-center text-primary text-sm font-medium">
                      Learn More <ArrowRight className="h-4 w-4 ml-1" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link href="/services">View All Services</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Contact us today for professional {service.name.toLowerCase()} services.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link href="/free-estimate">Get Free Estimate</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
              <a href={formatPhoneLink(siteConfig.company.phone)}>
                <Phone className="h-5 w-5 mr-2" />
                {formatPhone(siteConfig.company.phone)}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
