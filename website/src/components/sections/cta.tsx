"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModals } from "@/components/modal-provider";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { openDemoModal, openAuditModal } = useModals();

  return (
    <section className="section-padding relative overflow-hidden" ref={ref}>
      {/* Background */}
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
            WANT TO SEE HOW MANY JOBS{" "}
            <span className="text-gradient">YOU&apos;RE LEAVING ON THE TABLE?</span>
          </h2>
          
          <p className="text-lg text-steel-300 mb-10 max-w-2xl mx-auto">
            Let&apos;s do a quick 10-minute walkthrough of how missed call recovery and AI booking would work in your business. No pressure, no heavy sales pitch — just a clear look at how many jobs we can help you recover in the next 30–60 days.
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

