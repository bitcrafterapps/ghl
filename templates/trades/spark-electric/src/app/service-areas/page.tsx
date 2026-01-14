"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, MapPin, CheckCircle, Clock } from "lucide-react";
import { siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";

export default function ServiceAreasPage() {
  const areas = siteConfig.serviceArea.areas;

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
              Areas We Serve
            </h1>
            <p className="text-xl text-white/80 mb-8">
              {siteConfig.company.name} proudly serves {siteConfig.serviceArea.primaryCity} and
              surrounding communities within a {siteConfig.serviceArea.radius}-mile radius.
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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
                Communities We Serve
              </h2>
              <p className="text-gray-600 mb-8">
                Our team of licensed {siteConfig.industry.type.toLowerCase()} professionals
                provides fast, reliable service throughout the {siteConfig.company.stateFullName} area.
                No matter where you are within our service area, we&apos;re just a phone call away.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {areas.map((area: string, index: number) => (
                  <motion.div
                    key={area}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-gray-700 font-medium">{area}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-primary/5 rounded-xl">
                <h3 className="font-heading font-semibold text-gray-900 mb-2">
                  Don&apos;t see your area listed?
                </h3>
                <p className="text-gray-600 mb-4">
                  We may still be able to help! Give us a call to check if we service your location.
                </p>
                <a
                  href={formatPhoneLink(siteConfig.company.phone)}
                  className="inline-flex items-center text-primary font-semibold hover:underline"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {formatPhone(siteConfig.company.phone)}
                </a>
              </div>
            </motion.div>

            {/* Map & Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* Map Embed */}
              <div className="bg-gray-200 rounded-xl overflow-hidden aspect-square shadow-lg mb-6">
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

              {/* Service Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-semibold text-gray-900">{siteConfig.serviceArea.radius} Mile</p>
                  <p className="text-sm text-gray-500">Service Radius</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-semibold text-gray-900">{areas.length}+</p>
                  <p className="text-sm text-gray-500">Cities Served</p>
                </div>

                {siteConfig.industry.emergencyService && (
                  <div className="col-span-2 bg-primary/10 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <p className="font-semibold text-primary">24/7 Emergency Service Available</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
              Why {siteConfig.serviceArea.primaryCity} Chooses {siteConfig.company.name}
            </h2>
            <p className="text-gray-600">
              For {siteConfig.company.yearsInBusiness}+ years, we&apos;ve been the trusted choice
              for {siteConfig.industry.type.toLowerCase()} services in the area.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Fast Response Times",
                description: `We know ${siteConfig.industry.type.toLowerCase()} issues can't wait. Our team responds quickly to all service calls throughout our coverage area.`,
              },
              {
                title: "Local Expertise",
                description: `Our technicians know the ${siteConfig.serviceArea.primaryCity} area inside and out, allowing us to provide efficient, knowledgeable service.`,
              },
              {
                title: "Community Commitment",
                description: `As a local business, we're committed to providing exceptional service to our neighbors and building lasting relationships.`,
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-xl font-heading font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Contact us today for fast, reliable {siteConfig.industry.type.toLowerCase()} service
            in {siteConfig.serviceArea.primaryCity} and surrounding areas.
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
    </>
  );
}
