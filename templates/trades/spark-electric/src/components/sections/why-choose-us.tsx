"use client";

import { motion } from "framer-motion";
import { Shield, Award, Clock, Wrench, ThumbsUp, BadgeCheck } from "lucide-react";
import { siteConfig } from "@/data/config";

const features = [
  {
    icon: Shield,
    title: "Licensed & Insured",
    description: `Fully licensed and insured for your peace of mind. ${siteConfig.company.license ? `License #${siteConfig.company.license}` : "All work guaranteed."}`,
  },
  {
    icon: Award,
    title: `${siteConfig.company.yearsInBusiness}+ Years Experience`,
    description: `Trusted by ${siteConfig.company.city} homeowners for over ${siteConfig.company.yearsInBusiness} years. Proven track record of quality work.`,
  },
  {
    icon: Clock,
    title: siteConfig.industry.emergencyService ? "24/7 Emergency Service" : "Fast Response Time",
    description: siteConfig.industry.emergencyService
      ? "Day or night, we're here when you need us. Emergency service available around the clock."
      : "Quick response times and efficient service. We value your time as much as you do.",
  },
  {
    icon: ThumbsUp,
    title: "100% Satisfaction Guaranteed",
    description: "We're not happy until you're happy. Every job comes with our satisfaction guarantee.",
  },
  {
    icon: Wrench,
    title: "Quality Workmanship",
    description: "Expert technicians using premium materials. We do the job right the first time, every time.",
  },
  {
    icon: BadgeCheck,
    title: "Upfront Pricing",
    description: "No hidden fees or surprise charges. You'll know the price before any work begins.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-us" className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-primary font-semibold uppercase tracking-wide">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
            The {siteConfig.company.name} Difference
          </h2>
          <p className="text-lg text-gray-600">
            When you choose {siteConfig.company.name}, you&apos;re choosing quality,
            reliability, and a commitment to excellence that&apos;s unmatched in{" "}
            {siteConfig.company.city}.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
