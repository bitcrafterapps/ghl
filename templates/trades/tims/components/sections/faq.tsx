"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { faqItems, siteConfig } from "@/data/config";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // If no FAQ items, don't show section
  if (!faqItems || faqItems.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Got questions about our {siteConfig.industry.type.toLowerCase()} services? 
              We've got answers. If you don't see your question here, feel free to contact us.
            </p>
            <div className="bg-primary/5 rounded-xl p-6">
              <p className="font-semibold text-gray-900 mb-2">Still have questions?</p>
              <p className="text-gray-600 text-sm">
                Our team is happy to help. Call us at{" "}
                <a href={`tel:${siteConfig.company.phone}`} className="text-primary font-medium">
                  {siteConfig.company.phone}
                </a>{" "}
                or send us a message.
              </p>
            </div>
          </motion.div>

          {/* Right Column - FAQ Items */}
          <div className="space-y-4">
            {faqItems.map((item: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-gray-900 pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-4 text-gray-600">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
