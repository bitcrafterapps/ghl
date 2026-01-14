"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  MessageSquareText,
  BrainCircuit,
  Camera,
  CalendarPlus,
  Send,
  Star,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: MessageSquareText,
    title: "Missed Call → Instant SMS",
    description:
      'Every missed call triggers an automatic text: "Sorry we missed your call — are you looking for a quote on [service]?"',
  },
  {
    icon: BrainCircuit,
    title: "AI Job Qualification",
    description:
      "Our AI intake asks the right questions (location, scope of work, timeline, photos) and filters out tire-kickers.",
  },
  {
    icon: Camera,
    title: "Photo-Based Job Analysis",
    description:
      "Prospects can text photos or videos of their project. AI helps categorize the job and route it correctly.",
  },
  {
    icon: CalendarPlus,
    title: "Automatic Booking",
    description:
      "Qualified jobs are offered open time slots on your calendar with no back-and-forth scheduling hassle.",
  },
  {
    icon: Send,
    title: "Quote Follow-Up Automation",
    description:
      'Every quote gets smart follow-ups by SMS/email until they say "yes," "no," or "later."',
  },
  {
    icon: Star,
    title: "Review Generation Engine",
    description:
      "After a completed job, the system automatically requests Google reviews to boost your local rankings.",
  },
];

export function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="solution" className="section-padding relative" ref={ref}>
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-safety-500/10 border border-safety-500/20 text-safety-400 text-sm font-medium mb-6">
            <CheckCircle2 className="h-4 w-4" />
            How The Automation Works
          </div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[0.95] mb-6">
            AI THAT WORKS FOR YOU{" "}
            <span className="text-gradient">24/7</span>
          </h2>

          <p className="text-lg text-steel-300 leading-relaxed">
            Your platform comes loaded with powerful automations that capture every lead, qualify them instantly, and book appointments on your calendar — all while you focus on doing the work.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className="group relative p-6 bg-steel-900/50 border border-steel-800 rounded-xl hover:border-safety-500/30 transition-all duration-300"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-safety-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="inline-flex p-3 bg-safety-500/10 rounded-lg mb-4 group-hover:bg-safety-500/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-safety-400" />
                </div>
                
                <h3 className="font-heading text-xl text-white mb-3">{feature.title}</h3>
                <p className="text-steel-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-steel-300 mb-2">
            You keep your crews and office running like they do today.
          </p>
          <p className="text-lg text-white font-medium">
            We plug in a{" "}
            <span className="text-safety-400">revenue recovery layer</span> that makes sure every good lead is caught, followed up with, and offered a time on your calendar.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

