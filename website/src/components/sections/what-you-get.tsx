"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Smartphone,
  Globe,
  LayoutDashboard,
  MessageSquareText,
  BrainCircuit,
  CalendarPlus,
  Send,
  Star,
  Users,
  PieChart,
  Bell,
  CreditCard,
  Check,
} from "lucide-react";

const platformFeatures = [
  {
    icon: Smartphone,
    title: "Your Own Branded Mobile App",
    description:
      "A custom iOS and Android app with your logo, colors, and company name. Your team manages leads, appointments, and client communication from anywhere. Published to the App Store and Google Play under YOUR brand.",
    highlight: true,
  },
  {
    icon: Globe,
    title: "Professional Business Website",
    description:
      "A modern, mobile-optimized website built to convert visitors into leads. Integrated forms, click-to-call, online booking, and chat — all feeding directly into your CRM.",
    highlight: true,
  },
  {
    icon: LayoutDashboard,
    title: "Complete CRM & Lead Management",
    description:
      "Every lead, customer, and job in one place. Track opportunities from first contact to completed job, with full communication history and notes.",
    highlight: false,
  },
];

const automationFeatures = [
  {
    icon: MessageSquareText,
    title: "Missed Call Text-Back",
    description: "Every missed call gets an instant SMS response within seconds.",
  },
  {
    icon: BrainCircuit,
    title: "AI Lead Qualification",
    description: "AI asks the right questions and filters out tire-kickers automatically.",
  },
  {
    icon: CalendarPlus,
    title: "Automatic Appointment Booking",
    description: "Qualified leads book directly on your calendar — no back-and-forth.",
  },
  {
    icon: Send,
    title: "Quote Follow-Up Automation",
    description: "Every quote gets smart follow-ups until you get a yes or no.",
  },
  {
    icon: Star,
    title: "Review Generation",
    description: "Automatic Google review requests after completed jobs.",
  },
  {
    icon: Bell,
    title: "Real-Time Notifications",
    description: "Get instant alerts for new leads, bookings, and messages.",
  },
];

const additionalFeatures = [
  "Unified inbox for calls, texts, emails, and social messages",
  "Visual pipeline to track leads from inquiry to closed job",
  "Team management with role-based access",
  "Estimate and invoice creation",
  "Payment processing built-in",
  "Detailed reporting and analytics",
  "Two-way texting with customers",
  "Email marketing campaigns",
  "Reputation monitoring dashboard",
  "Unlimited contacts and leads",
];

export function WhatYouGetSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="what-you-get" className="section-padding relative" ref={ref}>
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-safety-500/10 border border-safety-500/20 text-safety-400 text-sm font-medium mb-6">
            <LayoutDashboard className="h-4 w-4" />
            Complete Business Platform
          </div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[0.95] mb-6">
            YOUR OWN BRANDED{" "}
            <span className="text-gradient">BUSINESS PLATFORM</span>
          </h2>

          <p className="text-lg text-steel-300 leading-relaxed">
            Not just automation — you get a complete branded platform with your
            own mobile app, professional website, and full CRM. Everything your
            team needs to capture, manage, and close more jobs.
          </p>
        </motion.div>

        {/* Main Platform Features */}
        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          {platformFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                feature.highlight
                  ? "bg-gradient-to-br from-safety-500/10 via-steel-900/80 to-steel-900/80 border-safety-500/30"
                  : "bg-steel-900/50 border-steel-800 hover:border-safety-500/30"
              }`}
            >
              {feature.highlight && (
                <div className="absolute -top-3 left-6">
                  <span className="px-3 py-1 bg-safety-500 text-white text-xs font-bold rounded-full">
                    INCLUDED
                  </span>
                </div>
              )}

              <div
                className={`inline-flex p-4 rounded-xl mb-6 ${
                  feature.highlight ? "bg-safety-500/20" : "bg-safety-500/10"
                }`}
              >
                <feature.icon
                  className={`h-8 w-8 ${
                    feature.highlight ? "text-safety-400" : "text-safety-400"
                  }`}
                />
              </div>

              <h3 className="font-heading text-xl text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-steel-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Automation Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h3 className="font-display text-2xl sm:text-3xl text-white text-center mb-8">
            PLUS AI-POWERED AUTOMATION
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {automationFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.05 }}
                className="flex items-start gap-4 p-4 bg-steel-900/30 border border-steel-800 rounded-xl"
              >
                <div className="shrink-0 p-2 bg-safety-500/10 rounded-lg">
                  <feature.icon className="h-5 w-5 text-safety-400" />
                </div>
                <div>
                  <h4 className="font-heading text-white mb-1">{feature.title}</h4>
                  <p className="text-sm text-steel-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional Features Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="p-8 bg-steel-900/50 border border-steel-800 rounded-2xl">
            <h4 className="font-heading text-xl text-white text-center mb-6">
              Everything Else Included
            </h4>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {additionalFeatures.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.7 + i * 0.03 }}
                  className="flex items-center gap-3"
                >
                  <div className="shrink-0 p-0.5 bg-safety-500/20 rounded">
                    <Check className="h-3.5 w-3.5 text-safety-400" />
                  </div>
                  <span className="text-steel-300 text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
