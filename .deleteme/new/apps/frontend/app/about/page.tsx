"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Phone, Shield, Award, Users, CheckCircle } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { siteConfig, teamMembers } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";
import { PageHero } from "@/components/sections/PageHero";

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <PageHero
        title={`About ${siteConfig.company.name}`}
        description={`Your trusted ${siteConfig.industry.type.toLowerCase()} professionals in ${siteConfig.serviceArea.primaryCity} with over ${siteConfig.company.yearsInBusiness} years of experience.`}
      />

      {/* About Content */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
                Committed to Excellence in {siteConfig.industry.type}
              </h2>
              <div className="prose prose-lg text-gray-600">
                <p>
                  {siteConfig.company.name} has been proudly serving {siteConfig.serviceArea.primaryCity} and 
                  surrounding communities for over {siteConfig.company.yearsInBusiness} years. Our commitment 
                  to quality workmanship and exceptional customer service has made us a trusted name in 
                  {siteConfig.industry.type.toLowerCase()} services.
                </p>
                <p>
                  We understand that {siteConfig.industry.type.toLowerCase()} issues can be stressful. 
                  That's why our team works diligently to provide prompt, reliable service with transparent 
                  pricing and no hidden fees.
                </p>
                <p>
                  As a locally owned and operated business, we take pride in our community and treat every 
                  customer's home or business as if it were our own.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <p className="text-4xl font-bold text-primary mb-2">{siteConfig.company.yearsInBusiness}+</p>
                  <p className="text-gray-600">Years Experience</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <p className="text-4xl font-bold text-primary mb-2">{siteConfig.reviews.count}+</p>
                  <p className="text-gray-600">Happy Customers</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-xl overflow-hidden shadow-xl">
                <Image
                  src={siteConfig.branding.logoUrl || `https://placehold.co/600x400/1a1a2e/ffffff?text=${encodeURIComponent(siteConfig.company.name)}`}
                  alt={`${siteConfig.company.name} team`}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600">
              These core principles guide everything we do at {siteConfig.company.name}.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Integrity",
                description: "Honest, transparent service with upfront pricing and no surprises.",
              },
              {
                icon: Award,
                title: "Quality",
                description: "Professional-grade materials and meticulous attention to detail on every job.",
              },
              {
                icon: Users,
                title: "Customer Focus",
                description: "Your satisfaction is our top priority. We're not done until you're happy.",
              },
              {
                icon: CheckCircle,
                title: "Reliability",
                description: "We show up on time, every time. Dependable service you can count on.",
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm text-center"
              >
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section (if team members exist) */}
      {teamMembers && teamMembers.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                Meet Our Team
              </h2>
              <p className="text-lg text-gray-600">
                Expert professionals dedicated to delivering exceptional service.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member: any, index: number) => (
                <motion.div
                  key={member.name || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={member.image || `https://placehold.co/200x200/1a1a2e/ffffff?text=${encodeURIComponent(member.name?.[0] || 'T')}`}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{member.title}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Ready to Work With Us?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Experience the {siteConfig.company.name} difference. Contact us today for a free estimate.
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
