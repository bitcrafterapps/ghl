"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig, services } from "@/data/config";
import { cn, formatPhone, formatPhoneLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services", hasDropdown: true },
  { href: "/gallery", label: "Gallery" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/about", label: "About" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Bar */}
      <div className="hidden lg:block bg-primary text-white py-2">
        <div className="container-custom flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <span>Serving {siteConfig.serviceArea.primaryCity} & Surrounding Areas</span>
            {siteConfig.industry.emergencyService && (
              <span className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                24/7 Emergency Service
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>Licensed & Insured {siteConfig.company.license && `• Lic# ${siteConfig.company.license}`}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white shadow-md py-2"
            : "bg-white/95 backdrop-blur py-4"
        )}
      >
        <div className="container-custom">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              {siteConfig.branding.logoUrl ? (
                <Image
                  src={siteConfig.branding.logoUrl}
                  alt={siteConfig.company.name}
                  width={200}
                  height={60}
                  className="h-12 w-auto"
                  priority
                />
              ) : (
                <span className="text-2xl font-heading font-bold text-primary">
                  {siteConfig.company.name}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <div key={link.href} className="relative">
                  {link.hasDropdown ? (
                    <div
                      className="relative"
                      onMouseEnter={() => setIsServicesOpen(true)}
                      onMouseLeave={() => setIsServicesOpen(false)}
                    >
                      <button className="flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium">
                        {link.label}
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <AnimatePresence>
                        {isServicesOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border py-2"
                          >
                            {services.map((service: any) => (
                              <Link
                                key={service.slug}
                                href={`/services/${service.slug}`}
                                className="block px-4 py-2 text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                              >
                                {service.name}
                              </Link>
                            ))}
                            <div className="border-t my-2" />
                            <Link
                              href="/services"
                              className="block px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                            >
                              View All Services →
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-foreground hover:text-primary transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href={formatPhoneLink(siteConfig.company.phone)}
                className="flex items-center gap-2 text-primary font-semibold"
              >
                <Phone className="h-5 w-5" />
                {formatPhone(siteConfig.company.phone)}
              </a>
              <Button asChild>
                <Link href="/free-estimate">Get Free Estimate</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t"
          >
            <div className="container-custom py-4">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2 border-b"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <a
                  href={formatPhoneLink(siteConfig.company.phone)}
                  className="flex items-center gap-2 text-primary font-semibold text-lg py-2"
                >
                  <Phone className="h-5 w-5" />
                  {formatPhone(siteConfig.company.phone)}
                </a>
                <Button asChild className="w-full">
                  <Link href="/free-estimate">Get Free Estimate</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
