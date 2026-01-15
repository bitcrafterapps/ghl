"use client";

import { Phone, MessageCircle } from "lucide-react";
import { siteConfig } from "@/data/config";
import { formatPhone, formatPhoneLink } from "@/lib/utils";

export function FloatingElements() {
  return (
    <>
      {/* Floating Phone Button - Mobile */}
      <a
        href={formatPhoneLink(siteConfig.company.phone)}
        className="fixed bottom-6 right-6 z-50 lg:hidden flex items-center justify-center h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:scale-105 transition-transform"
        aria-label="Call us"
      >
        <Phone className="h-6 w-6" />
      </a>

      {/* Floating Call Bar - Desktop */}
      <div className="fixed bottom-6 right-6 z-50 hidden lg:flex items-center gap-3 bg-primary text-white rounded-full shadow-lg pl-5 pr-2 py-2">
        <span className="text-sm font-medium">Call Now:</span>
        <a
          href={formatPhoneLink(siteConfig.company.phone)}
          className="flex items-center gap-2 bg-white text-primary rounded-full px-4 py-2 font-semibold hover:bg-gray-100 transition-colors"
        >
          <Phone className="h-4 w-4" />
          {formatPhone(siteConfig.company.phone)}
        </a>
      </div>

      {/* GHL Chat Widget - injected via script */}
      {siteConfig.ghl.chatWidget && (
        <div
          dangerouslySetInnerHTML={{ __html: siteConfig.ghl.chatWidget }}
        />
      )}
    </>
  );
}
