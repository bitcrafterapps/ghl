"use client";

import { motion } from "framer-motion";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { faqItems, siteConfig } from "@/data/config";
import { cn } from "@/lib/utils";

export function FAQSection() {
  if (!faqItems || faqItems.length === 0) {
    return null;
  }

  return (
    <section id="faq" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-primary font-semibold uppercase tracking-wide">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Have questions about our {siteConfig.industry.type.toLowerCase()} services?
              We&apos;ve got answers.
            </p>
          </motion.div>

          {/* FAQ Accordion */}
          <Accordion.Root type="single" collapsible className="space-y-4">
            {faqItems.map((item: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Accordion.Item
                  value={`item-${index}`}
                  className="bg-white rounded-xl border overflow-hidden"
                >
                  <Accordion.Trigger className="flex items-center justify-between w-full p-5 text-left hover:bg-gray-50 transition-colors group">
                    <span className="font-heading font-semibold text-gray-900 pr-4">
                      {item.question}
                    </span>
                    <ChevronDown className="h-5 w-5 text-primary shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                  <Accordion.Content className="overflow-hidden data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up">
                    <div className="p-5 pt-0 text-gray-600">
                      {item.answer}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </motion.div>
            ))}
          </Accordion.Root>

          {/* Additional Help */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12 p-6 bg-primary/5 rounded-xl"
          >
            <p className="text-gray-700 mb-2">
              Still have questions? We&apos;re here to help!
            </p>
            <a
              href={`tel:${siteConfig.company.phone.replace(/\D/g, "")}`}
              className="text-primary font-semibold hover:underline"
            >
              Call us at {siteConfig.company.phone}
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
