"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Quote, Building2, TrendingUp, Clock, Users } from "lucide-react";

export function CaseStudySection() {
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
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[0.95]">
            WHAT THIS LOOKS LIKE{" "}
            <span className="text-gradient">IN THE REAL WORLD</span>
          </h2>
        </motion.div>

        {/* Case Study Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="grid lg:grid-cols-5 gap-0 bg-steel-900/50 border border-steel-800 rounded-2xl overflow-hidden">
            {/* Left - Context */}
            <div className="lg:col-span-2 p-8 lg:p-10 bg-steel-800/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-safety-500/20 rounded-lg">
                  <Building2 className="h-6 w-6 text-safety-400" />
                </div>
                <div>
                  <p className="text-safety-400 text-sm font-medium">Case Study</p>
                  <p className="text-white font-heading text-lg">Mid-Size HVAC Company</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="font-heading text-xl text-white">The Problem</h3>
                <p className="text-steel-300 leading-relaxed">
                  A mid-size HVAC company was missing evening and weekend calls from Google LSAs. Their team was on job sites during peak call times, and by the time they returned calls, leads had already hired competitors.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-xl text-white">The Solution</h3>
                <p className="text-steel-300 leading-relaxed">
                  We installed missed-call-to-SMS, AI intake, and automated booking to capture leads 24/7.
                </p>
              </div>
            </div>

            {/* Right - Results */}
            <div className="lg:col-span-3 p-8 lg:p-10">
              <h3 className="font-heading text-xl text-white mb-6">The Results</h3>

              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="p-4 bg-steel-800/50 rounded-xl text-center"
                >
                  <TrendingUp className="h-6 w-6 text-safety-400 mx-auto mb-2" />
                  <p className="font-display text-2xl text-safety-400">+35%</p>
                  <p className="text-sm text-steel-400">More Bookings</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="p-4 bg-steel-800/50 rounded-xl text-center"
                >
                  <Clock className="h-6 w-6 text-safety-400 mx-auto mb-2" />
                  <p className="font-display text-2xl text-safety-400">24/7</p>
                  <p className="text-sm text-steel-400">Lead Capture</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="p-4 bg-steel-800/50 rounded-xl text-center"
                >
                  <Users className="h-6 w-6 text-safety-400 mx-auto mb-2" />
                  <p className="font-display text-2xl text-safety-400">$0</p>
                  <p className="text-sm text-steel-400">New Staff Needed</p>
                </motion.div>
              </div>

              {/* Key Outcomes */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-steel-200">Started booking more after-hours estimates without adding staff</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-steel-200">Clear pipeline visibility: new leads, quotes, and won jobs</span>
                </div>
              </div>

              {/* Quote */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="relative p-6 bg-gradient-to-br from-safety-500/10 to-transparent border border-safety-500/20 rounded-xl"
              >
                <Quote className="absolute top-4 left-4 h-8 w-8 text-safety-500/30" />
                <blockquote className="relative pl-6">
                  <p className="text-lg text-white italic leading-relaxed">
                    &quot;It&apos;s like having a 24/7 dispatcher that never forgets to follow up.&quot;
                  </p>
                  <footer className="mt-3 text-steel-400">
                    — HVAC Company Owner
                  </footer>
                </blockquote>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

