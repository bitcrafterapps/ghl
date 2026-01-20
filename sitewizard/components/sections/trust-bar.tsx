"use client";

import { Star, Shield, Clock, Award } from "lucide-react";
import { siteConfig } from "@/data/config";

export function TrustBar() {
  const trustItems = [
    {
      icon: Star,
      label: `${siteConfig.reviews.rating} Star Rating`,
      sublabel: `${siteConfig.reviews.count}+ Reviews`,
    },
    {
      icon: Shield,
      label: "Licensed & Insured",
      sublabel: siteConfig.company.license ? `Lic# ${siteConfig.company.license}` : "Fully Bonded",
    },
    {
      icon: Award,
      label: `${siteConfig.company.yearsInBusiness}+ Years`,
      sublabel: "In Business",
    },
    {
      icon: Clock,
      label: siteConfig.industry.emergencyService ? "24/7 Available" : "Fast Response",
      sublabel: siteConfig.industry.emergencyService ? "Emergency Service" : "Same Day Service",
    },
  ];

  return (
    <section className="bg-white py-8 border-b">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-600">{item.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
