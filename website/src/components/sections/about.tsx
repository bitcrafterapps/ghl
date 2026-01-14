"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Code2, Cpu, DollarSign } from "lucide-react";

const expertise = [
  {
    icon: Code2,
    title: "Full-Stack Development",
    description: "Building robust systems that just work",
  },
  {
    icon: Cpu,
    title: "AI Automation",
    description: "Cutting-edge AI that feels human",
  },
  {
    icon: DollarSign,
    title: "Revenue Focus",
    description: "Every feature tied to booked jobs",
  },
];

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding relative" ref={ref}>
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Photo/Avatar area */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative max-w-md mx-auto lg:mx-0">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-safety-500/20 to-transparent rounded-2xl blur-2xl" />
              
              {/* Avatar placeholder */}
              <div className="relative bg-steel-900/80 border border-steel-700 rounded-2xl p-8 lg:p-12">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-safety-500 to-safety-700 flex items-center justify-center">
                  <span className="font-display text-4xl text-white">JC</span>
                </div>
                
                <h3 className="font-display text-3xl text-center text-white mb-2">
                  JOBCAPTURE
                </h3>
                <p className="text-center text-safety-400 font-medium">
                  AI Automation for Contractors
                </p>

                {/* Expertise badges */}
                <div className="grid grid-cols-3 gap-3 mt-8">
                  {expertise.map((item) => (
                    <div key={item.title} className="text-center p-3 bg-steel-800/50 rounded-xl">
                      <item.icon className="h-5 w-5 text-safety-400 mx-auto mb-2" />
                      <p className="text-xs text-steel-300">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="font-display text-4xl sm:text-5xl text-white leading-[0.95] mb-6">
              BUILT BY A DEVELOPER WHO{" "}
              <span className="text-gradient">UNDERSTANDS CONTRACTORS</span>
            </h2>
            
            <div className="space-y-4 text-lg text-steel-300 leading-relaxed">
              <p>
                I specialize in helping construction and service companies{" "}
                <span className="text-white font-semibold">
                  capture more revenue from the leads they&apos;re already paying for
                </span>.
              </p>
              
              <p>
                With a background in full-stack development and AI automation, I build systems that are:
              </p>
              
              <ul className="space-y-2 pl-4">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-safety-500" />
                  <span>Simple for your team to use</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-safety-500" />
                  <span>Focused on booked jobs and revenue</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-safety-500" />
                  <span>Easy to roll out across multiple locations or trades</span>
                </li>
              </ul>

              <p className="pt-4">
                You don&apos;t need more software. You need a{" "}
                <span className="text-safety-400 font-semibold">revenue system</span>{" "}
                that works while you&apos;re on the job site.
              </p>

              <p className="text-white font-medium pt-4 border-t border-steel-800">
                My goal is simple: turn more of your calls and clicks into booked, profitable jobs — while keeping things easy for your office and crews.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

