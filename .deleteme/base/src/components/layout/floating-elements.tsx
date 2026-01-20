"use client";

import { useState, useEffect } from "react";
import { Phone, ArrowUp, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/data/config";
import { formatPhoneLink } from "@/lib/utils";

export function FloatingElements() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Click-to-Call FAB - Always visible on mobile */}
      <a
        href={formatPhoneLink(siteConfig.company.phone)}
        className="fixed bottom-4 right-4 z-50 lg:hidden flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Call us"
      >
        <Phone className="h-6 w-6" />
      </a>

      {/* Get Quote Sticky Bar - Mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-primary text-white p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <a
          href="/free-estimate"
          className="flex items-center justify-center gap-2 font-semibold"
        >
          <MessageCircle className="h-5 w-5" />
          Get Your Free Estimate
        </a>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-40 flex items-center justify-center w-12 h-12 bg-secondary text-white rounded-full shadow-lg hover:bg-secondary/90 transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
