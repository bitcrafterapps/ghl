"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X } from "lucide-react";

const forItems = [
  "5–50 employees",
  "$1M–$10M annual revenue",
  "Running Google Ads, Local Service Ads (LSA), Angi, or similar",
  "Missing calls or slow follow-up is a known issue",
  "Owner/manager is revenue-driven and wants more jobs from existing lead flow",
];

const notForItems = [
  "One-man shops that don't want to grow",
  "Businesses not yet generating regular inbound calls or web leads",
  "Teams unwilling to make small process changes to capture more jobs",
];

const industries = {
  primary: [
    "General contractors",
    "HVAC companies",
    "Plumbing companies",
    "Electrical contractors",
    "Roofing companies",
  ],
  secondary: [
    "Mold remediation",
    "Water/fire restoration",
    "Carpet & tile cleaning",
    "Pool service",
    "Landscaping",
  ],
};

export function WhoItsForSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding relative" ref={ref}>
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[0.95] mb-6">
            BUILT FOR CONSTRUCTION & SERVICE BUSINESSES{" "}
            <span className="text-gradient">THAT CARE ABOUT REVENUE</span>
          </h2>
        </motion.div>

        {/* Industries Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Primary Industries */}
            <div className="p-6 bg-steel-900/50 border border-steel-800 rounded-xl">
              <h3 className="font-heading text-lg text-safety-400 mb-4">Primary Industries</h3>
              <div className="flex flex-wrap gap-2">
                {industries.primary.map((industry) => (
                  <span
                    key={industry}
                    className="px-3 py-1.5 bg-safety-500/10 border border-safety-500/20 text-steel-200 rounded-lg text-sm"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>

            {/* Secondary Industries */}
            <div className="p-6 bg-steel-900/50 border border-steel-800 rounded-xl">
              <h3 className="font-heading text-lg text-steel-400 mb-4">Also Great For</h3>
              <div className="flex flex-wrap gap-2">
                {industries.secondary.map((industry) => (
                  <span
                    key={industry}
                    className="px-3 py-1.5 bg-steel-800 border border-steel-700 text-steel-300 rounded-lg text-sm"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* For / Not For Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Who It's For */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl"
          >
            <h3 className="font-heading text-2xl text-emerald-400 mb-6 flex items-center gap-2">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Check className="h-5 w-5" />
              </div>
              Best Fit Profile
            </h3>
            <ul className="space-y-4">
              {forItems.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="shrink-0 mt-0.5 p-1 bg-emerald-500/20 rounded">
                    <Check className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="text-steel-200">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Who It's Not For */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 bg-steel-900/50 border border-steel-800 rounded-2xl"
          >
            <h3 className="font-heading text-2xl text-steel-400 mb-6 flex items-center gap-2">
              <div className="p-2 bg-steel-800 rounded-lg">
                <X className="h-5 w-5" />
              </div>
              Who This Is Not For
            </h3>
            <ul className="space-y-4">
              {notForItems.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: 10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="shrink-0 mt-0.5 p-1 bg-steel-800 rounded">
                    <X className="h-4 w-4 text-steel-500" />
                  </div>
                  <span className="text-steel-400">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

