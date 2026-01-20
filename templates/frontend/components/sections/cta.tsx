"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Calendar, ArrowRight } from "lucide-react";
import { siteConfig } from "@/data/config";
import { formatPhone, formatPhoneLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Contact {siteConfig.company.name} today for professional {siteConfig.industry.type.toLowerCase()} services. 
            Free estimates, upfront pricing, and satisfaction guaranteed.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg" asChild>
              <Link href="/free-estimate" className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Get Free Estimate
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary text-lg"
              asChild
            >
              <a href={formatPhoneLink(siteConfig.company.phone)} className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                {formatPhone(siteConfig.company.phone)}
              </a>
            </Button>
          </div>

          {/* Trust Line */}
          <p className="text-white/70 text-sm">
            Serving {siteConfig.serviceArea.primaryCity} and surrounding areas • 
            Licensed & Insured • {siteConfig.company.yearsInBusiness}+ Years Experience
          </p>
        </motion.div>
      </div>
    </section>
  );
}
