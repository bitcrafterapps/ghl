"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Phone, Shield, Award, Users, CheckCircle, Star } from "lucide-react";
import { siteConfig, teamMembers } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";

export default function AboutPage() {
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
              About {siteConfig.company.name}
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Trusted {siteConfig.industry.type.toLowerCase()} professionals serving{" "}
              {siteConfig.serviceArea.primaryCity} and surrounding areas for{" "}
              {siteConfig.company.yearsInBusiness}+ years.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary font-semibold uppercase tracking-wide">
                Our Story
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-6">
                {siteConfig.company.yearsInBusiness}+ Years of Excellence
              </h2>
              <div className="prose prose-lg text-gray-600">
                <p>
                  {siteConfig.company.name} was founded with a simple mission: to provide
                  honest, reliable {siteConfig.industry.type.toLowerCase()} services to our
                  community. What started as a small operation has grown into one of the
                  most trusted names in {siteConfig.serviceArea.primaryCity}.
                </p>
                <p>
                  Over the years, we&apos;ve built our reputation on quality workmanship,
                  transparent pricing, and exceptional customer service. Our team of
                  licensed professionals treats every home like their own, ensuring
                  the job is done right the first time.
                </p>
                <p>
                  Today, we&apos;re proud to serve thousands of satisfied customers across
                  {siteConfig.company.stateFullName}. Whether it&apos;s a routine service call
                  or an emergency situation, you can count on {siteConfig.company.name} to
                  be there when you need us.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl relative">
                <Image
                  src={`https://placehold.co/800x600/1a1a2e/ffffff?text=${encodeURIComponent(siteConfig.company.name)}`}
                  alt={`${siteConfig.company.name} team`}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Stats Overlay */}
              <div className="absolute -bottom-6 -right-6 bg-primary text-white p-6 rounded-xl shadow-lg">
                <div className="text-3xl font-bold">{siteConfig.reviews.count}+</div>
                <div className="text-sm text-white/80">Happy Customers</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span className="text-primary font-semibold uppercase tracking-wide">
              Our Values
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
              What Sets Us Apart
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "Integrity",
                description: "We do what we say and always provide honest assessments and fair pricing.",
              },
              {
                icon: Award,
                title: "Quality",
                description: "We use premium materials and never cut corners on workmanship.",
              },
              {
                icon: Users,
                title: "Customer Focus",
                description: "Your satisfaction is our top priority on every single job.",
              },
              {
                icon: Star,
                title: "Excellence",
                description: "We continuously improve our skills and stay current with industry best practices.",
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 text-center shadow-sm"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
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

      {/* Credentials */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Years Experience", value: `${siteConfig.company.yearsInBusiness}+` },
                  { label: "Google Rating", value: `${siteConfig.reviews.rating}/5` },
                  { label: "Happy Customers", value: `${siteConfig.reviews.count}+` },
                  { label: "Service Area", value: `${siteConfig.serviceArea.radius} mi` },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl p-6 text-center"
                  >
                    <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <span className="text-primary font-semibold uppercase tracking-wide">
                Credentials
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-6">
                Licensed, Insured & Trusted
              </h2>
              <ul className="space-y-4">
                {[
                  `Licensed ${siteConfig.industry.type} Contractor${siteConfig.company.license ? ` (${siteConfig.company.license})` : ""}`,
                  "Fully Bonded & Insured",
                  "Background-Checked Technicians",
                  "Ongoing Professional Training",
                  "Member of Local Business Associations",
                  "A+ BBB Rating",
                ].map((credential, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-gray-600">{credential}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {teamMembers && teamMembers.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <span className="text-primary font-semibold uppercase tracking-wide">
                Our Team
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
                Meet the Experts
              </h2>
              <p className="text-gray-600">
                Our experienced team is dedicated to providing you with the best
                {siteConfig.industry.type.toLowerCase()} service possible.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={member.image || `https://placehold.co/400x400/1a1a2e/ffffff?text=${encodeURIComponent(member.name || 'Team Member')}`}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-heading font-semibold text-gray-900">
                      {member.name}
                    </h3>
                    <p className="text-primary font-medium">{member.role}</p>
                    {member.bio && (
                      <p className="text-gray-600 text-sm mt-2">{member.bio}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Ready to Work With Us?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Experience the {siteConfig.company.name} difference. Contact us today for
            a free estimate.
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
