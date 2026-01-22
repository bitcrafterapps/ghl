"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Clock,
  Award,
  ThumbsUp,
  Users,
  Wrench,
  CheckCircle
} from "lucide-react";
import { siteConfig } from "@/data/config";
import { useSiteContent, renderHtmlContent } from "@/lib/use-site-content";

const features = [
  {
    icon: Shield,
    title: "Licensed & Insured",
    description: "Fully licensed, bonded, and insured for your peace of mind and protection.",
  },
  {
    icon: Clock,
    title: "Fast Response Time",
    description: "Quick response times with same-day service available for urgent needs.",
  },
  {
    icon: Award,
    title: "Experienced Team",
    description: `Over ${siteConfig.company.yearsInBusiness} years of industry experience and expertise.`,
  },
  {
    icon: ThumbsUp,
    title: "Satisfaction Guaranteed",
    description: "We stand behind our work with a 100% satisfaction guarantee.",
  },
  {
    icon: Users,
    title: "Trusted by Community",
    description: `${siteConfig.reviews.count}+ happy customers and ${siteConfig.reviews.rating}-star rating.`,
  },
  {
    icon: Wrench,
    title: "Quality Workmanship",
    description: "Professional-grade materials and meticulous attention to detail.",
  },
];

export function WhyChooseUs() {
  // Fetch dynamic content for why-choose-us section
  const { content: dynamicContent } = useSiteContent("landing", "why-choose-us");

  // Default content
  const defaultBadge = "Why Choose Us";
  const defaultHeadline = `Why ${siteConfig.serviceArea.primaryCity} Trusts ${siteConfig.company.name}`;
  const defaultDescription = `We're committed to providing exceptional ${siteConfig.industry.type.toLowerCase()} services with integrity, professionalism, and outstanding results.`;

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {dynamicContent.badge ? (
              <span
                className="text-primary font-semibold text-sm uppercase tracking-wider"
                dangerouslySetInnerHTML={renderHtmlContent(dynamicContent.badge)}
              />
            ) : (
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                {defaultBadge}
              </span>
            )}
            {dynamicContent.headline ? (
              <h2
                className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4"
                dangerouslySetInnerHTML={renderHtmlContent(dynamicContent.headline)}
              />
            ) : (
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
                {defaultHeadline}
              </h2>
            )}
            {dynamicContent.description ? (
              <div
                className="text-lg text-gray-600"
                dangerouslySetInnerHTML={renderHtmlContent(dynamicContent.description)}
              />
            ) : (
              <p className="text-lg text-gray-600">
                {defaultDescription}
              </p>
            )}
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            <CheckCircle className="h-5 w-5" />
            <span>Free estimates • No hidden fees • Upfront pricing</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
