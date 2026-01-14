"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram,
  Star 
} from "lucide-react";
import { siteConfig, services } from "@/data/config";
import { formatPhone, formatPhoneLink } from "@/lib/utils";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="text-white"
      style={{
        backgroundColor: 'var(--footer-bg)',
        color: 'var(--footer-text)',
      }}
    >
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            {siteConfig.branding.logoUrl ? (
              <Image
                src={siteConfig.branding.logoUrl}
                alt={siteConfig.company.name}
                width={180}
                height={60}
                className="h-12 w-auto mb-4"
              />
            ) : (
              <h3 className="text-2xl font-heading font-bold text-white mb-4">
                {siteConfig.company.name}
              </h3>
            )}
            <p className="text-gray-400 mb-4">
              Professional {siteConfig.industry.type.toLowerCase()} services in{" "}
              {siteConfig.serviceArea.primaryCity} and surrounding areas. 
              Licensed, insured, and committed to quality.
            </p>
            
            {/* Rating Badge */}
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 inline-flex">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium">{siteConfig.reviews.rating}</span>
              <span className="text-sm text-gray-400">({siteConfig.reviews.count}+ reviews)</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2">
              {services.slice(0, 6).map((service: any) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
              {services.length > 6 && (
                <li>
                  <Link
                    href="/services"
                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    View All Services →
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-400 hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/service-areas" className="text-gray-400 hover:text-white transition-colors">
                  Service Areas
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-gray-400 hover:text-white transition-colors">
                  Reviews
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/free-estimate" className="text-primary hover:text-primary/80 transition-colors font-medium">
                  Free Estimate →
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={formatPhoneLink(siteConfig.company.phone)}
                  className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                  <span>{formatPhone(siteConfig.company.phone)}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.company.email}`}
                  className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                  <span>{siteConfig.company.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                <span>
                  {siteConfig.company.address}<br />
                  {siteConfig.company.city}, {siteConfig.company.state} {siteConfig.company.zip}
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Clock className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                <div>
                  <p>Mon-Fri: {siteConfig.hours.weekdays}</p>
                  <p>Sat: {siteConfig.hours.saturday}</p>
                  <p>Sun: {siteConfig.hours.sunday}</p>
                  {siteConfig.hours.emergencyNote && (
                    <p className="text-primary text-sm mt-1">{siteConfig.hours.emergencyNote}</p>
                  )}
                </div>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {siteConfig.social.facebook && (
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {siteConfig.social.instagram && (
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {siteConfig.social.google && (
                <a
                  href={siteConfig.social.google}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all"
                >
                  <span className="text-sm font-bold">G</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} {siteConfig.company.name}. All rights reserved.
              {siteConfig.company.license && (
                <span className="block md:inline md:ml-2">
                  License #{siteConfig.company.license}
                </span>
              )}
            </p>
            <div className="flex gap-4 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
