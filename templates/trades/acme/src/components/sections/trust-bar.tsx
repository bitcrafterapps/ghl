"use client";

import { motion } from "framer-motion";
import { Shield, Award, Clock, Users, ThumbsUp } from "lucide-react";
import { siteConfig } from "@/data/config";

const trustItems = [
  {
    icon: Shield,
    label: "Licensed & Insured",
    value: `Lic# ${siteConfig.company.license || "Fully Licensed"}`,
  },
  {
    icon: Award,
    label: "Years of Experience",
    value: `${siteConfig.company.yearsInBusiness}+ Years`,
  },
  {
    icon: ThumbsUp,
    label: "Customer Rating",
    value: `${siteConfig.reviews.rating}/5 Stars`,
  },
  {
    icon: Users,
    label: "Satisfied Customers",
    value: `${siteConfig.reviews.count}+ Reviews`,
  },
  ...(siteConfig.industry.emergencyService
    ? [
        {
          icon: Clock,
          label: "Emergency Service",
          value: "24/7 Available",
        },
      ]
    : []),
];

export function TrustBar() {
  return (
    <section className="bg-gray-50 py-8 border-y">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {trustItems.slice(0, 5).map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="font-semibold text-gray-900">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
