"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { PhoneOff, Clock, Brain, AlertTriangle, DollarSign } from "lucide-react";

const problems = [
  {
    icon: PhoneOff,
    title: "Missed Calls",
    description: "When the office is busy or closed, calls go to voicemail — and voicemails go unanswered.",
  },
  {
    icon: Clock,
    title: "Slow Quote Follow-Up",
    description: "Your team is on job sites all day. Quotes sit for hours or days before anyone follows up.",
  },
  {
    icon: Brain,
    title: "No Automation",
    description: "Everything depends on humans remembering to call back. And humans get busy.",
  },
];

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="problem" className="section-padding relative" ref={ref}>
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent pointer-events-none" />
      
      <div className="container-custom relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-6">
              <AlertTriangle className="h-4 w-4" />
              The Silent Revenue Killer
            </div>
            
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[0.95] mb-6">
              MOST CONTRACTORS LOSE JOBS{" "}
              <span className="text-red-400">BEFORE THEY EVEN CALL BACK</span>
            </h2>
            
            <p className="text-lg text-steel-300 mb-6 leading-relaxed">
              When a homeowner or property manager reaches out, they&apos;re usually calling{" "}
              <span className="text-white font-semibold">3–5 companies</span>. The one who responds first and follows up best usually wins the job.
            </p>
            
            <p className="text-lg text-steel-300 leading-relaxed">
              If your phones ring during lunch, after hours, or while your crew is in the field…
              there&apos;s a good chance{" "}
              <span className="text-red-400 font-semibold">20–40% of potential jobs are slipping away</span>.
            </p>

            {/* Stat callout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 p-6 bg-steel-900/50 border border-steel-800 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <DollarSign className="h-8 w-8 text-red-400" />
                </div>
                <div>
                  <p className="text-steel-400 text-sm">You&apos;re already paying for leads from</p>
                  <p className="text-white font-semibold">Google • LSAs • Angi • Referrals</p>
                  <p className="text-red-400 mt-1 font-medium">Every missed call is pure waste — money out, nothing back.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Problem Cards */}
          <div className="space-y-4">
            {problems.map((problem, i) => (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="group p-6 bg-steel-900/50 border border-steel-800 rounded-xl hover:border-red-500/30 transition-all duration-300"
              >
                <div className="flex gap-4">
                  <div className="shrink-0 p-3 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                    <problem.icon className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl text-white mb-2">{problem.title}</h3>
                    <p className="text-steel-400">{problem.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Percentage visualization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 p-6 bg-gradient-to-br from-red-500/10 to-steel-900/50 border border-red-500/20 rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-steel-300">Potential Revenue Lost</span>
                <span className="text-red-400 font-display text-2xl">20-40%</span>
              </div>
              <div className="h-3 bg-steel-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: "35%" } : {}}
                  transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                />
              </div>
              <p className="text-sm text-steel-400 mt-3">
                Based on industry averages for contractors without automated follow-up
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

