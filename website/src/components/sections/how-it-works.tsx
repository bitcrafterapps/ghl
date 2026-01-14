"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ClipboardCheck, Cog, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Audit & Design",
    timeline: "Day 1-2",
    description:
      "We review how leads currently come in: phone, web forms, LSAs, Angi, etc. Then we design your AI booking and follow-up workflow tailored to your services and service area.",
    details: [
      "Lead source audit",
      "Service area mapping",
      "Custom workflow design",
    ],
  },
  {
    number: "02",
    icon: Cog,
    title: "Build & Connect",
    timeline: "Day 3-5",
    description:
      "We set everything up in your dedicated automation platform — your complete job capture and follow-up system, ready to go.",
    details: [
      "Call tracking & missed-call routing",
      "SMS templates & AI intake flows",
      "Pipelines for leads, estimates, and jobs",
      "Calendars for estimates/site visits",
      "Follow-up and review campaigns",
    ],
  },
  {
    number: "03",
    icon: Rocket,
    title: "Launch & Optimize",
    timeline: "Day 6-7",
    description:
      "We go live, monitor new leads and bookings, and tune the automation so it feels natural and on-brand. You get a simple dashboard to see how many jobs and dollars are being recovered.",
    details: [
      "Live monitoring",
      "Message optimization",
      "Performance dashboard",
    ],
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="section-padding relative" ref={ref}>
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[0.95] mb-6">
            SIMPLE{" "}
            <span className="text-gradient">3-STEP</span>{" "}
            IMPLEMENTATION
          </h2>
          <p className="text-lg text-steel-300">
            Get your entire revenue recovery system up and running in just 7 days.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-steel-700 to-transparent -translate-y-1/2" />
          
          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.2 }}
                className="relative"
              >
                {/* Card */}
                <div className="relative bg-steel-900/70 border border-steel-800 rounded-2xl p-8 h-full hover:border-safety-500/30 transition-all duration-300 group">
                  {/* Step number badge */}
                  <div className="absolute -top-4 left-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-safety-500 blur-lg opacity-50" />
                      <div className="relative bg-safety-500 text-white font-display text-xl px-4 py-1 rounded-lg">
                        {step.number}
                      </div>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="flex items-center justify-between mb-6 mt-4">
                    <div className="p-3 bg-steel-800 rounded-xl group-hover:bg-safety-500/20 transition-colors">
                      <step.icon className="h-8 w-8 text-safety-400" />
                    </div>
                    <span className="text-sm font-medium text-safety-400 bg-safety-500/10 px-3 py-1 rounded-full">
                      {step.timeline}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="font-heading text-2xl text-white mb-4">{step.title}</h3>
                  <p className="text-steel-400 mb-6 leading-relaxed">{step.description}</p>

                  {/* Details */}
                  <ul className="space-y-2">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-sm text-steel-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-safety-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-safety-500/10 border border-safety-500/20 rounded-full">
            <span className="text-safety-400 font-display text-2xl">7 DAYS</span>
            <span className="text-steel-300">from start to first recovered job</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

