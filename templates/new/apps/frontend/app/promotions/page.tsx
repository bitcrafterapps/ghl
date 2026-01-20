"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tag, Percent, DollarSign, Calendar, Copy, Check, Phone, Loader2, Clock, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink, cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api";
import { PageHero } from "@/components/sections/PageHero";
import {
  PromoCode,
  formatDiscount,
  getPromoCodeExpiryText,
} from "@/types/promo-codes";

function PromoCodeCard({ promoCode, index }: { promoCode: PromoCode; index: number }) {
  const [copied, setCopied] = useState(false);
  const expiryText = getPromoCodeExpiryText(promoCode);

  const copyCode = () => {
    navigator.clipboard.writeText(promoCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Discount Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {promoCode.discountType === 'percentage' ? (
              <Percent className="w-6 h-6" />
            ) : (
              <DollarSign className="w-6 h-6" />
            )}
            <span className="text-2xl font-bold">
              {formatDiscount(promoCode.discountType, promoCode.discountValue)}
            </span>
          </div>
          {expiryText && (
            <span className={cn(
              "text-sm px-3 py-1 rounded-full",
              expiryText === 'Expired'
                ? "bg-red-500/30"
                : expiryText.includes('today') || expiryText.includes('tomorrow')
                  ? "bg-yellow-500/30"
                  : "bg-white/20"
            )}>
              {expiryText}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{promoCode.name}</h3>
        {promoCode.description && (
          <p className="text-gray-600 mb-4">{promoCode.description}</p>
        )}

        {/* Code */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3 font-mono text-lg font-bold text-gray-900 text-center tracking-wider">
            {promoCode.code}
          </div>
          <button
            onClick={copyCode}
            className={cn(
              "p-3 rounded-lg transition-all",
              copied
                ? "bg-green-100 text-green-600"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-500">
          {/* Valid Dates */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              Valid: {new Date(promoCode.startDate).toLocaleDateString()}
              {promoCode.endDate && ` - ${new Date(promoCode.endDate).toLocaleDateString()}`}
            </span>
          </div>

          {/* Minimum Order */}
          {promoCode.minimumOrderAmount && promoCode.minimumOrderAmount > 0 && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>Min. order: ${(promoCode.minimumOrderAmount / 100).toFixed(2)}</span>
            </div>
          )}

          {/* Applicable Services */}
          {promoCode.applicableServices && promoCode.applicableServices.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="w-4 h-4 mt-0.5" />
              <span>Valid for: {promoCode.applicableServices.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Terms */}
        {promoCode.terms && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">{promoCode.terms}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function PromotionsPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPromoCodes = async () => {
      try {
        const apiUrl = getApiUrl();
        const companyId = siteConfig.companyId;

        if (!companyId) {
          console.warn('No companyId configured');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/v1/promo-codes/public?companyId=${companyId}`);

        if (response.ok) {
          const result = await response.json();
          const codes = result.data || result || [];
          setPromoCodes(Array.isArray(codes) ? codes : []);
        }
      } catch (error) {
        console.warn('Failed to fetch promo codes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromoCodes();
  }, []);

  const hasPromoCodes = promoCodes.length > 0;

  return (
    <PublicLayout>
      {/* Hero Section */}
      <PageHero>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-white/90 font-medium">Special Offers</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
            {hasPromoCodes ? "Current Promotions" : "Promotions Coming Soon"}
          </h1>
          <p className="text-xl text-white/80 mb-8">
            {hasPromoCodes
              ? `Save on your next service with ${siteConfig.company.name}! Use these exclusive promo codes at checkout.`
              : `We are preparing some great deals for you. Check back soon for exclusive offers from ${siteConfig.company.name}!`
            }
          </p>

          {hasPromoCodes && (
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur px-6 py-4 rounded-xl">
              <Tag className="w-6 h-6 text-white" />
              <span className="text-2xl font-bold text-white">{promoCodes.length}</span>
              <span className="text-white/70">Active Promotion{promoCodes.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </motion.div>
      </PageHero>

      {/* Promo Codes Section */}
      <section className="section-padding bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : !hasPromoCodes ? (
            // Empty State
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="h-10 w-10 text-gray-300" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                No Active Promotions
              </h2>
              <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                We don't have any active promotions right now, but check back soon!
                In the meantime, give us a call for a free estimate.
              </p>
              <Button asChild>
                <Link href="/free-estimate">Get a Free Estimate</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Section Header */}
              <div className="text-center max-w-3xl mx-auto mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                    Limited Time Offers
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
                    Use These Codes & Save
                  </h2>
                  <p className="text-lg text-gray-600">
                    Click on any code to copy it. Mention the code when booking or enter it during checkout.
                  </p>
                </motion.div>
              </div>

              {/* Promo Codes Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promoCodes.map((promoCode, index) => (
                  <PromoCodeCard
                    key={promoCode.id}
                    promoCode={promoCode}
                    index={index}
                  />
                ))}
              </div>

              {/* How to Use */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">How to Use Your Promo Code</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold text-xl">1</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Copy the Code</h4>
                    <p className="text-gray-600 text-sm">Click the copy button next to your chosen promo code</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold text-xl">2</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Book Your Service</h4>
                    <p className="text-gray-600 text-sm">Schedule your service online or give us a call</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold text-xl">3</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Apply & Save</h4>
                    <p className="text-gray-600 text-sm">Mention the code when booking to receive your discount</p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Ready to Save?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Book your service today and use one of our promo codes to save on quality service.
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
