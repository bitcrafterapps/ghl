"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I need to switch my phone system or CRM?",
    answer:
      "Not necessarily. Our platform can sit alongside your current tools, or we can consolidate everything into one system. Most clients love having everything in one place once they see how seamless it is.",
  },
  {
    question: "Will this replace my office staff?",
    answer:
      "No. This system supports your staff by catching what they can't get to — after-hours calls, peak times, and follow-ups that slip through the cracks. Think of it as giving your team superpowers, not replacing them.",
  },
  {
    question: "How fast can we be live?",
    answer:
      "Most companies are live within 7 days, often faster if you already have clear services and pricing. We handle all the setup and configuration — you just need to review and approve.",
  },
  {
    question: "What if the AI says something wrong?",
    answer:
      "We use tested scripts and guardrails built specifically for contractors. You approve all messaging, and we monitor and adjust in the first weeks after launch. The AI follows your rules.",
  },
  {
    question: "Is this compliant with TCPA and SMS regulations?",
    answer:
      "Yes. We build your flows to follow opt-in and messaging best practices. We'll walk you through the basics during setup and make sure everything is compliant from day one.",
  },
  {
    question: "What do you need from us to start?",
    answer:
      "Typically just access to your existing numbers or call routing, a short list of services and service areas, and a point person who can approve messaging and see the first leads come in. Usually takes about 30 minutes of your time total.",
  },
  {
    question: "What happens if I want to cancel?",
    answer:
      "There are no long-term contracts. You can cancel anytime with 30 days notice. We export all your data so nothing is lost. We're confident you'll stay because the system pays for itself.",
  },
];

export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="faq" className="section-padding relative" ref={ref}>
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[0.95] mb-6">
            FREQUENTLY ASKED{" "}
            <span className="text-gradient">QUESTIONS</span>
          </h2>
          <p className="text-lg text-steel-300">
            Got questions? We&apos;ve got answers.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-steel-900/50 border border-steel-800 rounded-xl px-6 data-[state=open]:border-safety-500/30 transition-colors"
              >
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

