"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X, Sparkles, ArrowRight, Star, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModals } from "@/components/modal-provider";

interface Feature {
  text: string;
  included: boolean;
  highlight?: boolean;
  isHeader?: boolean;
}

interface Tier {
  name: string;
  price: string;
  description: string;
  highlight: boolean;
  popular: boolean;
  features: Feature[];
}

const tiers: Tier[] = [
  {
    name: "Starter",
    price: "97",
    description: "Professional website & basic CRM to establish your online presence",
    highlight: false,
    popular: false,
    features: [
      { text: "Free professional website included", included: true, highlight: true },
      { text: "Click-to-call & free estimate buttons", included: true },
      { text: "Mobile-optimized design", included: true },
      { text: "Basic CRM & contact management", included: true },
      { text: "Up to 50 contacts", included: true },
      { text: "1-3 team members", included: true },
      { text: "Email marketing (100/month)", included: true },
      { text: "Appointment scheduling", included: true },
      { text: "Basic reporting dashboard", included: true },
      { text: "Email support", included: true },
      { text: "SMS messaging", included: false },
      { text: "AI automation", included: false },
      { text: "Branded mobile app", included: false },
    ],
  },
  {
    name: "Growth",
    price: "297",
    description: "Full AI automation to capture more leads and close more jobs",
    highlight: true,
    popular: true,
    features: [
      { text: "Everything in Starter, plus:", included: true, isHeader: true },
      { text: "Advanced website with online booking", included: true },
      { text: "Up to 500 contacts", included: true },
      { text: "Up to 10 team members", included: true },
      { text: "500 emails/month", included: true },
      { text: "2,500 SMS credits/month", included: true },
      { text: "Missed call text-back automation", included: true },
      { text: "AI lead qualification", included: true },
      { text: "Automatic appointment booking", included: true },
      { text: "Quote follow-up automation", included: true },
      { text: "Google review automation", included: true },
      { text: "Unified inbox (calls, texts, email)", included: true },
      { text: "Advanced reporting & analytics", included: true },
      { text: "Priority email & chat support", included: true },
      { text: "Branded mobile app", included: false },
    ],
  },
  {
    name: "Pro",
    price: "497",
    description: "Complete branded platform with your own mobile app",
    highlight: false,
    popular: false,
    features: [
      { text: "Everything in Growth, plus:", included: true, isHeader: true },
      { text: "Your branded mobile app (iOS & Android)", included: true },
      { text: "Unlimited contacts", included: true },
      { text: "Unlimited team members", included: true },
      { text: "5,000 SMS credits/month", included: true },
      { text: "Advanced AI conversation features", included: true },
      { text: "Multiple pipelines & workflows", included: true },
      { text: "Invoicing & payment processing", included: true },
      { text: "Reputation monitoring dashboard", included: true },
      { text: "Custom integrations & API access", included: true },
      { text: "Priority phone support", included: true },
      { text: "Dedicated account manager", included: true },
    ],
  },
];

export function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { openDemoModal } = useModals();

  return (
    <section id="pricing" className="section-padding relative" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-safety-500/5 to-transparent pointer-events-none" />

      <div className="container-custom relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[0.95] mb-6">
            SIMPLE, TRANSPARENT{" "}
            <span className="text-gradient">PRICING</span>
          </h2>
          <p className="text-lg text-steel-300">
            Choose the plan that fits your business. No hidden fees. No long-term contracts.
          </p>
        </motion.div>

        {/* Free Website Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-4xl mx-auto mb-10"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="shrink-0 p-3 bg-emerald-500/20 rounded-xl">
                <Globe className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-emerald-400 mb-1">
                  Free Professional Website Included With Every Plan
                </h3>
                <p className="text-steel-300 text-sm">
                  Every plan includes a modern, mobile-optimized website with click-to-call buttons and free estimate request forms — ready to start generating leads from day one.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
              className={`relative rounded-2xl overflow-hidden ${
                tier.highlight
                  ? "lg:-mt-4 lg:mb-4"
                  : ""
              }`}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-safety-600 to-safety-500 px-4 py-2 flex items-center justify-center gap-2 z-10">
                  <Star className="h-4 w-4 text-white fill-white" />
                  <span className="text-white text-sm font-semibold">Most Popular</span>
                </div>
              )}

              <div
                className={`h-full flex flex-col p-6 lg:p-8 ${
                  tier.highlight
                    ? "bg-gradient-to-br from-safety-500/10 via-steel-900/90 to-steel-900/90 border-2 border-safety-500/50"
                    : "bg-steel-900/50 border border-steel-800"
                } ${tier.popular ? "pt-14" : ""} rounded-2xl`}
              >
                {/* Tier Header */}
                <div className="mb-6">
                  <h3 className="font-heading text-xl text-white mb-2">{tier.name}</h3>
                  <p className="text-steel-400 text-sm mb-4">{tier.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-5xl text-safety-400">${tier.price}</span>
                    <span className="text-steel-400">/month</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, j) => (
                    <li
                      key={j}
                      className={`flex items-start gap-3 ${
                        feature.isHeader ? "pt-2" : ""
                      }`}
                    >
                      {feature.isHeader ? (
                        <span className="text-safety-400 font-medium text-sm">
                          {feature.text}
                        </span>
                      ) : (
                        <>
                          <div
                            className={`shrink-0 mt-0.5 p-0.5 rounded ${
                              feature.included
                                ? feature.highlight
                                  ? "bg-emerald-500/30"
                                  : "bg-safety-500/20"
                                : "bg-steel-800"
                            }`}
                          >
                            {feature.included ? (
                              <Check className={`h-3.5 w-3.5 ${feature.highlight ? "text-emerald-400" : "text-safety-400"}`} />
                            ) : (
                              <X className="h-3.5 w-3.5 text-steel-600" />
                            )}
                          </div>
                          <span
                            className={`text-sm ${
                              feature.included
                                ? feature.highlight
                                  ? "text-emerald-400 font-medium"
                                  : "text-steel-300"
                                : "text-steel-500"
                            }`}
                          >
                            {feature.text}
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  size="lg"
                  variant={tier.highlight ? "default" : "outline"}
                  className={`w-full group ${
                    tier.highlight ? "" : "border-steel-700 hover:border-safety-500/50"
                  }`}
                  onClick={openDemoModal}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-steel-900/50 border border-steel-800 rounded-full">
            <Sparkles className="h-4 w-4 text-safety-400" />
            <span className="text-steel-300 text-sm">
              <span className="text-white font-medium">Setup fee waived</span> for early clients — limited time
            </span>
          </div>
          <p className="text-steel-400 text-sm mt-4">
            All plans include free onboarding. Cancel anytime — no long-term contracts.
          </p>
        </motion.div>

        {/* ROI Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 max-w-2xl mx-auto"
        >
          <div className="p-6 bg-steel-900/30 border border-steel-800 rounded-xl text-center">
            <p className="text-steel-300">
              <span className="text-white font-semibold">The math is simple:</span> If your average job is worth $2,500-$5,000, just one extra job per month pays for the entire system — and then some.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
