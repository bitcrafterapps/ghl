"use client";

import { useState, useEffect } from "react";
import { Star, Shield, Clock, Award } from "lucide-react";
import { siteConfig } from "@/data/config";
import { fetchApi } from "@/lib/api";

export function TrustBar() {
  const [stats, setStats] = useState<{ averageRating: number; totalReviews: number } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // fetchApi automatically includes x-site-id header from NEXT_PUBLIC_SITE_ID
        const response = await fetchApi('/api/v1/reviews/stats');
        if (response.ok) {
          const result = await response.json();
          setStats(result.data || result);
        }
      } catch (e) {
        console.warn("Failed to fetch trust bar stats", e);
      }
    };
    fetchStats();
  }, []);

  // Only show reviews if we have stats loaded and there are reviews
  const hasReviews = stats !== null && stats.totalReviews > 0;
  const displayRating = stats?.averageRating?.toFixed(1) ?? "5.0";
  const displayCount = stats?.totalReviews ?? 0;

  const trustItems = [
    // Only include review item if there are reviews for this site
    ...(hasReviews ? [{
      icon: Star,
      label: `${displayRating} Star Rating`,
      sublabel: `${displayCount}+ Reviews`,
    }] : []),
    {
      icon: Shield,
      label: siteConfig.company.license ? "Licensed & Insured" : "Dependable & Reliable",
      sublabel: siteConfig.company.license ? `Lic# ${siteConfig.company.license}` : "Trusted Service",
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
        <div className={`grid grid-cols-2 ${trustItems.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
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
