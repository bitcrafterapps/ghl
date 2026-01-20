"use client";

import { motion } from "framer-motion";
import { Phone, ArrowRight, Clock } from "lucide-react";
import { siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-primary via-primary to-secondary overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          {siteConfig.industry.emergencyService && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6">
              <Clock className="h-5 w-5 text-white" />
              <span className="text-white font-medium">
                24/7 Emergency Service Available
              </span>
            </div>
          )}

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
            Ready to Get Started?
          </h2>

          <p className="text-xl text-white/90 mb-8">
            Get your free, no-obligation estimate today. Our team is standing by
            to help with all your {siteConfig.industry.type.toLowerCase()} needs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="xl"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/free-estimate">
                Get Free Estimate
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>

            <Button
              size="xl"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
              asChild
            >
              <a href={formatPhoneLink(siteConfig.company.phone)}>
                <Phone className="h-5 w-5 mr-2" />
                {formatPhone(siteConfig.company.phone)}
              </a>
            </Button>
          </div>

          <p className="text-white/70 mt-6 text-sm">
            Serving {siteConfig.serviceArea.primaryCity} &amp; surrounding areas
            for {siteConfig.company.yearsInBusiness}+ years
          </p>
        </motion.div>
      </div>
    </section>
  );
}
