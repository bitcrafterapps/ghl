"use client";

import { motion } from "framer-motion";
import {
  PhoneOff,
  MessageSquare,
  CalendarCheck,
  ArrowRight,
  Building2,
  Wrench,
  Zap,
  Droplets,
  Home,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModals } from "@/components/modal-provider";

const industries = [
  { icon: Building2, label: "General Contractors" },
  { icon: Flame, label: "HVAC" },
  { icon: Droplets, label: "Plumbing" },
  { icon: Zap, label: "Electrical" },
  { icon: Home, label: "Roofing" },
  { icon: Wrench, label: "Restoration" },
];

export function HeroSection() {
  const { openDemoModal, openAuditModal } = useModals();
  
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orb - base layer */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-safety-500/10 rounded-full blur-[120px]" />
        
        {/* Construction site image overlay */}
        <div 
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop')`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            mixBlendMode: "luminosity",
          }}
        />
        
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-steel-950/80 via-steel-950/60 to-steel-950/90" />
        
        {/* Grid overlay */}
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
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="max-w-2xl">
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
                AI-Powered Revenue Recovery for Contractors
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[0.95] mb-6"
            >
              EVERY MISSED CALL IS A JOB YOUR{" "}
              <span className="text-gradient">COMPETITOR WINS</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-steel-300 mb-4 leading-relaxed"
            >
              Get your own branded mobile app, professional website, and AI-powered
              CRM that captures missed calls, books estimates, and follows up
              automatically 24/7 — everything your contracting business needs to
              win more jobs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium"
            >
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Free Professional Website Included With Every Plan
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-12 max-w-xl"
            >
              <Button size="lg" className="group shrink-0" onClick={openDemoModal}>
                Book a 10-Minute Demo
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="shrink-0 whitespace-nowrap" onClick={openAuditModal}>
                Free &quot;Missed Jobs&quot; Audit
              </Button>
            </motion.div>

            {/* Credibility Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-8 border-t border-steel-800"
            >
              <p className="text-steel-400 text-sm mb-4 font-medium uppercase tracking-wider">
                Built for contractors who are serious about growth
              </p>
              <div className="flex flex-wrap gap-4">
                {industries.map((industry, i) => (
                  <motion.div
                    key={industry.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-steel-800/50 text-steel-300 text-sm"
                  >
                    <industry.icon className="h-4 w-4 text-safety-500" />
                    {industry.label}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {/* Phone Mockup with SMS */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-safety-500/20 rounded-3xl blur-3xl" />
              
              {/* Main card - Flow visualization */}
              <div className="relative bg-steel-900/80 backdrop-blur-xl border border-steel-700 rounded-2xl p-6 shadow-2xl">
                {/* Flow steps */}
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
                      <p className="text-steel-400 text-sm">Tuesday at 2:00 PM confirmed</p>
                    </div>
                  </div>
                </div>

                {/* Stats bar */}
                <div className="mt-6 pt-6 border-t border-steel-700 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-display text-safety-400">24/7</p>
                    <p className="text-xs text-steel-400">Response Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-display text-safety-400">40%</p>
                    <p className="text-xs text-steel-400">More Jobs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-display text-safety-400">$0</p>
                    <p className="text-xs text-steel-400">Extra Staff</p>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="absolute -top-4 -right-4 bg-emerald-500/90 backdrop-blur text-white px-4 py-2 rounded-lg shadow-lg"
              >
                <p className="text-sm font-semibold">+$5,200 recovered this month</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

