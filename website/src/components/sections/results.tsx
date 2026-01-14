"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Zap, Clock, Target, Star, Calculator } from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    stat: "20-40%",
    label: "More Jobs",
    description: "Capture more jobs from the same calls and inquiries",
  },
  {
    icon: Clock,
    stat: "< 60sec",
    label: "Response Time",
    description: "Book more estimates automatically, even after hours",
  },
  {
    icon: Target,
    stat: "2x",
    label: "Close Rate",
    description: "Increase close rates with consistent follow-up",
  },
  {
    icon: Star,
    stat: "5★",
    label: "More Reviews",
    description: "Boost Google reviews and local rankings",
  },
];

export function ResultsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding relative" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-steel-950 via-safety-500/5 to-steel-950 pointer-events-none" />
      
      <div className="container-custom relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[0.95] mb-6">
            TURN EXISTING LEAD FLOW INTO{" "}
            <span className="text-gradient">EXTRA REVENUE</span>
          </h2>
          <p className="text-lg text-steel-300">
            Without more ad spend. Without hiring staff. Just better systems.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className="text-center p-6 bg-steel-900/50 border border-steel-800 rounded-xl hover:border-safety-500/30 transition-all duration-300 group"
            >
              <div className="inline-flex p-3 bg-safety-500/10 rounded-xl mb-4 group-hover:bg-safety-500/20 transition-colors">
                <benefit.icon className="h-6 w-6 text-safety-400" />
              </div>
              <div className="font-display text-4xl text-safety-400 mb-1">
                {benefit.stat}
              </div>
              <div className="font-heading text-lg text-white mb-2">{benefit.label}</div>
              <p className="text-sm text-steel-400">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* ROI Calculator Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-safety-500/10 via-steel-900/80 to-steel-900/80 border border-safety-500/20 rounded-2xl p-8 lg:p-12">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-safety-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-safety-500/20 rounded-lg">
                    <Calculator className="h-6 w-6 text-safety-400" />
                  </div>
                  <h3 className="font-heading text-2xl text-white">Example Scenario</h3>
                </div>
                
                <p className="text-steel-300 leading-relaxed mb-6">
                  For most contractors, <span className="text-white font-semibold">one extra booked job per month</span> more than covers the entire system.
                </p>

                <div className="space-y-3 text-steel-300">
                  <div className="flex justify-between py-2 border-b border-steel-800">
                    <span>Average job value</span>
                    <span className="text-white font-semibold">$2,500</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-steel-800">
                    <span>Current monthly jobs</span>
                    <span className="text-white font-semibold">10 jobs</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-steel-800">
                    <span>Recovered jobs per month</span>
                    <span className="text-safety-400 font-semibold">+2 jobs</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-center p-8 bg-steel-900/80 border border-steel-700 rounded-xl">
                <p className="text-steel-400 text-sm uppercase tracking-wider mb-2">Additional Monthly Revenue</p>
                <div className="font-display text-5xl lg:text-6xl text-safety-400 mb-2">
                  $5,000
                </div>
                <p className="text-steel-400 text-sm">from the same marketing spend</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

