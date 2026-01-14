"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, CheckCircle } from "lucide-react";

export function GuaranteeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding relative" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative p-8 lg:p-12 bg-gradient-to-br from-emerald-500/10 via-steel-900/80 to-steel-900/80 border border-emerald-500/20 rounded-2xl">
            {/* Shield icon */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-50" />
                <div className="relative p-4 bg-steel-900 border border-emerald-500/30 rounded-xl">
                  <Shield className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white leading-[0.95] mb-6">
                IF IT DOESN&apos;T HELP YOU{" "}
                <span className="text-emerald-400">BOOK MORE JOBS</span>, YOU DON&apos;T KEEP IT
              </h2>
              
              <p className="text-lg text-steel-300 mb-8 max-w-2xl mx-auto">
                We&apos;re confident that better speed and follow-up will book you more work. That&apos;s why we offer a simple promise:
              </p>

              <div className="space-y-4 text-left max-w-xl mx-auto">
                <div className="flex items-start gap-4 p-4 bg-steel-800/50 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-steel-200">
                    If you don&apos;t feel the system is helping you <span className="text-white font-semibold">capture and book more qualified estimates</span> in the first 30 days, you can cancel and walk away.
                  </p>
                </div>
                <div className="flex items-start gap-4 p-4 bg-steel-800/50 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-steel-200">
                    <span className="text-white font-semibold">No hard feelings, no long-term contract.</span> We aim to pay for ourselves with recovered jobs every single month.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

