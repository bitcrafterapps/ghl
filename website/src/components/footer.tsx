"use client";

import { Zap, Mail, Phone } from "lucide-react";

const footerLinks = [
  { label: "The Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Footer() {
  return (
    <footer className="border-t border-steel-800 bg-steel-950">
      <div className="container-custom py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <Zap className="h-7 w-7 text-safety-500" strokeWidth={2.5} />
              <span className="font-display text-xl tracking-wide text-white">
                JOBCAPTURE
              </span>
            </a>
            <p className="text-steel-400 max-w-md mb-6">
              AI-powered booking & follow-up systems for construction and service contractors. Recover missed calls, book more estimates, and grow your business 24/7.
            </p>
            <div className="flex flex-col gap-2 text-sm text-steel-400">
              <a href="mailto:hello@jobcapture.ai" className="flex items-center gap-2 hover:text-safety-400 transition-colors">
                <Mail className="h-4 w-4" />
                hello@jobcapture.ai
              </a>
              <a href="tel:+19496154035" className="flex items-center gap-2 hover:text-safety-400 transition-colors">
                <Phone className="h-4 w-4" />
                (949) 615-4035
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-steel-400 hover:text-safety-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h4 className="font-heading text-lg text-white mb-4">Industries</h4>
            <ul className="space-y-2 text-steel-400">
              <li>General Contractors</li>
              <li>HVAC Companies</li>
              <li>Plumbing Companies</li>
              <li>Electrical Contractors</li>
              <li>Roofing Companies</li>
              <li>Restoration Services</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-steel-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-steel-500">
            © {new Date().getFullYear()} JobCapture. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-steel-500">
            <a href="#" className="hover:text-safety-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-safety-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

