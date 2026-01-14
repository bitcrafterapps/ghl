"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import {
  ArrowRight,
  Check,
  Phone,
  MessageSquare,
  CalendarCheck,
  PhoneOff,
  AlertTriangle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModals } from "@/components/modal-provider";

interface IndustryData {
  name: string;
  slug: string;
  headline: string;
  subheadline: string;
  description: string;
  painPoints: string[];
  benefits: string[];
  stats: {
    missedCallRecovery: string;
    responseTime: string;
    moreEstimates: string;
  };
  testimonialPlaceholder: string;
}

export function IndustryPageContent({ industry }: { industry: IndustryData }) {
  const { openDemoModal, openAuditModal } = useModals();

  return (
    <>
      {/* Hero Section */}
      <IndustryHero industry={industry} />

      {/* Pain Points Section */}
      <PainPointsSection industry={industry} />

      {/* Solution Section */}
      <SolutionSection industry={industry} />

      {/* Stats Section */}
      <StatsSection industry={industry} />

      {/* CTA Section */}
      <IndustryCTA industry={industry} />
    </>
  );
}

function IndustryHero({ industry }: { industry: IndustryData }) {
  const { openDemoModal, openAuditModal } = useModals();

  return (
    <section className="relative min-h-[80vh] flex items-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-safety-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-steel-950/80 via-steel-950/60 to-steel-950/90" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(249,115,22,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(249,115,22,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-safety-500/10 border border-safety-500/20 text-safety-400 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safety-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-safety-500"></span>
              </span>
              AI-Powered Revenue Recovery for {industry.name}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[0.95] mb-6"
          >
            {industry.headline}{" "}
            <span className="text-gradient">{industry.subheadline}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-steel-300 mb-10 leading-relaxed max-w-3xl mx-auto"
          >
            {industry.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="group" onClick={openDemoModal}>
              Book a 10-Minute Demo
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={openAuditModal}>
              Free &quot;Missed Jobs&quot; Audit
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PainPointsSection({ industry }: { industry: IndustryData }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding bg-steel-900/30" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white leading-[0.95] mb-6">
            THE CHALLENGES {industry.name.toUpperCase()}{" "}
            <span className="text-gradient">FACE EVERY DAY</span>
          </h2>
          <p className="text-steel-300 text-lg">
            Sound familiar? These are the revenue leaks we fix.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {industry.painPoints.map((point, i) => (
            <motion.div
              key={point}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <p className="text-steel-200">{point}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionSection({ industry }: { industry: IndustryData }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding" ref={ref}>
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white leading-[0.95] mb-6">
              HOW WE HELP{" "}
              <span className="text-gradient">{industry.name.toUpperCase()}</span>{" "}
              WIN MORE JOBS
            </h2>
            <p className="text-steel-300 text-lg mb-8">
              Our AI-powered system plugs directly into your existing workflow and starts recovering revenue from day one.
            </p>

            <ul className="space-y-4">
              {industry.benefits.map((benefit, i) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="shrink-0 mt-0.5 p-1 bg-emerald-500/20 rounded">
                    <Check className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="text-steel-200">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right - Flow Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-safety-500/10 rounded-3xl blur-3xl" />

            <div className="relative bg-steel-900/80 backdrop-blur-xl border border-steel-700 rounded-2xl p-6 shadow-2xl">
              <div className="space-y-4">
                {/* Missed Call */}
                <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="p-3 bg-red-500/20 rounded-lg">
                    <PhoneOff className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-red-400 font-semibold">Missed Call</p>
                    <p className="text-steel-400 text-sm">Lead calls during busy hours</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-red-500/50 to-safety-500/50" />
                </div>

                {/* Instant SMS */}
                <div className="flex items-center gap-4 p-4 bg-safety-500/10 border border-safety-500/20 rounded-xl">
                  <div className="p-3 bg-safety-500/20 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-safety-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-safety-400 font-semibold">AI Auto-Responds</p>
                    <p className="text-steel-400 text-sm mt-1 p-2 bg-steel-800 rounded-lg">
                      &quot;Sorry we missed you! Need a quote? Reply YES&quot;
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-safety-500/50 to-emerald-500/50" />
                </div>

                {/* Booked */}
                <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="p-3 bg-emerald-500/20 rounded-lg">
                    <CalendarCheck className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-emerald-400 font-semibold">Estimate Booked</p>
                    <p className="text-steel-400 text-sm">Automatically added to your calendar</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatsSection({ industry }: { industry: IndustryData }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding bg-steel-900/30" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl text-white leading-[0.95] mb-4">
            RESULTS {industry.name.toUpperCase()} SEE
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center p-8 bg-steel-900/50 border border-steel-800 rounded-2xl"
          >
            <p className="font-display text-5xl text-safety-400 mb-2">
              {industry.stats.missedCallRecovery}
            </p>
            <p className="text-steel-300">Missed Calls Recovered</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center p-8 bg-steel-900/50 border border-steel-800 rounded-2xl"
          >
            <p className="font-display text-5xl text-safety-400 mb-2">
              {industry.stats.responseTime}
            </p>
            <p className="text-steel-300">Average Response Time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center p-8 bg-steel-900/50 border border-steel-800 rounded-2xl"
          >
            <p className="font-display text-5xl text-safety-400 mb-2">
              {industry.stats.moreEstimates}
            </p>
            <p className="text-steel-300">More Estimates Booked</p>
          </motion.div>
        </div>

        {/* Testimonial placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <div className="p-8 bg-steel-900/50 border border-steel-800 rounded-2xl">
            <div className="flex gap-1 mb-4 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-safety-400 fill-safety-400" />
              ))}
            </div>
            <p className="text-steel-200 text-lg italic text-center mb-4">
              &quot;{industry.testimonialPlaceholder}&quot;
            </p>
            <p className="text-steel-400 text-center">
              — {industry.name.slice(0, -1)} Owner
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function IndustryCTA({ industry }: { industry: IndustryData }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { openDemoModal, openAuditModal } = useModals();

  return (
    <section className="section-padding relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-safety-500/10 via-transparent to-transparent" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(249,115,22,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(249,115,22,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="container-custom relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[0.95] mb-6">
            READY TO STOP LOSING{" "}
            <span className="text-gradient">JOBS TO YOUR COMPETITORS?</span>
          </h2>

          <p className="text-lg text-steel-300 mb-10 max-w-2xl mx-auto">
            See exactly how our AI system would work for your {industry.name.toLowerCase()} business.
            10-minute demo, no pressure, no heavy sales pitch.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" className="group" onClick={openDemoModal}>
              <Phone className="mr-2 h-5 w-5" />
              Book a 10-Minute Demo
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="xl" variant="outline" onClick={openAuditModal}>
              Request a Free &quot;Missed Jobs&quot; Audit
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
