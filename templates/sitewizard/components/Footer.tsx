import Link from 'next/link';
import { siteConfig, services } from '@/data/config';
import { formatPhone, formatPhoneLink } from '@/lib/utils';
import { Facebook, Instagram, Twitter, Linkedin, Phone, Mail, MapPin, Globe } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    google: Globe,
    yelp: Globe, // Use Globe for generic fallback or specific if available
    bbb: Globe,
    nextdoor: Globe
  };

  return (
    <footer className="py-16 bg-zinc-950 border-t border-zinc-900 text-zinc-400">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-white">Site Wizard</span>
            </Link>
  
            {/* Social Links */}
            <div className="flex gap-4">
              {Object.entries(siteConfig.social).map(([key, url]) => {
                if (!url) return null;
                const Icon = socialIcons[key as keyof typeof socialIcons] || Globe;
                return (
                  <a 
                    key={key} 
                    href={url as string} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
          
          {/* Services Links */}
          
          
          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-4 text-sm">
              {siteConfig.company.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 shrink-0 text-zinc-500" />
                  <span>
                    {siteConfig.company.address}<br />
                    {siteConfig.company.city}, {siteConfig.company.state} {siteConfig.company.zip}
                  </span>
                </li>
              )}
              
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-900 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-sm">
            &copy; {currentYear} Site Wizard. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
             <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">Privacy</Link>
             <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};