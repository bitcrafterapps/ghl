"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from "lucide-react";
import { siteConfig, services } from "@/data/config";
import { formatPhone, formatPhoneLink, formatEmailLink, formatAddressLink } from "@/lib/utils";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Company Info */}
          <div>
            {siteConfig.branding.logoUrl ? (
              <Image
                src={siteConfig.branding.logoUrl}
                alt={siteConfig.company.name}
                width={180}
                height={54}
                className="h-12 w-auto mb-4 brightness-0 invert"
              />
            ) : (
              <h3 className="text-xl font-heading font-bold mb-4">
                {siteConfig.company.name}
              </h3>
            )}
            <p className="text-gray-400 mb-4">
              Trusted {siteConfig.industry.type.toLowerCase()} services in{" "}
              {siteConfig.company.city} and surrounding areas. Serving the
              community for {siteConfig.company.yearsInBusiness}+ years.
            </p>
            {siteConfig.company.license && (
              <p className="text-sm text-gray-500">
                License #{siteConfig.company.license}
              </p>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-white transition-colors">
                  Services
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
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
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
                  Free Estimate
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Our Services</h4>
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

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={formatPhoneLink(siteConfig.company.phone)}
                  className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{formatPhone(siteConfig.company.phone)}</span>
                </a>
              </li>
              <li>
                <a
                  href={formatEmailLink(siteConfig.company.email)}
                  className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{siteConfig.company.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={formatAddressLink(
                    siteConfig.company.address,
                    siteConfig.company.city,
                    siteConfig.company.state,
                    siteConfig.company.zip
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>
                    {siteConfig.company.address}
                    <br />
                    {siteConfig.company.city}, {siteConfig.company.state}{" "}
                    {siteConfig.company.zip}
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Clock className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p>Mon-Fri: {siteConfig.hours.weekdays}</p>
                  <p>Sat: {siteConfig.hours.saturday}</p>
                  <p>Sun: {siteConfig.hours.sunday}</p>
                  {siteConfig.industry.emergencyService && (
                    <p className="text-primary mt-1">24/7 Emergency Service</p>
                  )}
                </div>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              {siteConfig.social.facebook && (
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {siteConfig.social.instagram && (
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {siteConfig.social.google && (
                <a
                  href={siteConfig.social.google}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors"
                  aria-label="Google Business"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>
              © {currentYear} {siteConfig.company.name}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/sitemap.xml" className="hover:text-white transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
