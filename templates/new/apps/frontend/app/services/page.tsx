"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { services, siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";
import { PageHero } from "@/components/sections/PageHero";

// Individual service card for Cover Flow
function CoverFlowServiceCard({ 
  service, 
  index, 
  activeIndex, 
  totalServices,
  onClick 
}: { 
  service: any; 
  index: number; 
  activeIndex: number;
  totalServices: number;
  onClick: () => void;
}) {
  const placeholderUrl = `https://placehold.co/600x400/1a1a2e/ffffff?text=${encodeURIComponent(service.name)}`;
  const [imgSrc, setImgSrc] = useState(service.image || placeholderUrl);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(placeholderUrl);
    }
  };

  // Calculate position relative to active index
  const offset = index - activeIndex;
  const absOffset = Math.abs(offset);
  
  // Calculate 3D transforms for cover flow effect
  const rotateY = offset * -40; // Rotate side cards
  const translateX = offset * 300; // Spread cards horizontally
  const translateZ = absOffset === 0 ? 0 : -150 - (absOffset * 50); // Push side cards back
  const scale = absOffset === 0 ? 1 : 0.75 - (absOffset * 0.1); // Scale down side cards
  const opacity = absOffset > 2 ? 0 : 1 - (absOffset * 0.2); // Fade distant cards
  const zIndex = totalServices - absOffset;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        width: '400px',
        height: '480px',
        transformStyle: 'preserve-3d',
      }}
      animate={{
        rotateY,
        x: translateX,
        z: translateZ,
        scale: Math.max(0.5, scale),
        opacity: Math.max(0, opacity),
        zIndex,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      onClick={onClick}
      whileHover={absOffset === 0 ? { scale: 1.03 } : {}}
    >
      <div 
        className={`relative w-full h-full rounded-2xl overflow-hidden ${
          absOffset === 0 ? 'ring-4 ring-primary/40' : ''
        }`}
        style={{
          boxShadow: absOffset === 0 
            ? '0 30px 60px -15px rgba(0, 0, 0, 0.5)' 
            : '0 15px 35px -10px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Service Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={imgSrc}
            alt={service.name}
            onError={handleError}
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Service Icon Badge */}
          {absOffset === 0 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg"
            >
              <ArrowRight className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </div>

        {/* Service Content */}
        <div 
          className="p-6 h-[calc(100%-14rem)]"
          style={{
            background: absOffset === 0 
              ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' 
              : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          }}
        >
          <h2 className={`text-xl font-heading font-bold mb-3 ${
            absOffset === 0 ? 'text-gray-900' : 'text-gray-600'
          }`}>
            {service.name}
          </h2>
          
          <p className={`text-sm leading-relaxed mb-4 line-clamp-3 ${
            absOffset === 0 ? 'text-gray-600' : 'text-gray-500'
          }`}>
            {service.shortDescription || service.description}
          </p>
          
          {/* Active card shows CTA */}
          <AnimatePresence>
            {absOffset === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Link
                  href={`/services/${service.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Reflection effect */}
      <div 
        className="absolute top-full left-0 right-0 h-24 overflow-hidden rounded-2xl opacity-20"
        style={{
          transform: 'scaleY(-1)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
        }}
      >
        <img
          src={imgSrc}
          alt=""
          className="w-full h-56 object-cover"
          draggable={false}
        />
      </div>
    </motion.div>
  );
}

export default function ServicesPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Start in middle of services
    if (services.length > 0) {
      setActiveIndex(Math.floor(services.length / 2));
    }
  }, []);

  const goToPrevious = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : services.length - 1));
  }, []);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev < services.length - 1 ? prev + 1 : 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <PageHero>
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
              Our {siteConfig.industry.type} Services
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Professional {siteConfig.industry.type.toLowerCase()} solutions for
              residential and commercial properties in {siteConfig.serviceArea.primaryCity}{" "}
              and surrounding areas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/free-estimate">Get Free Estimate</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900" asChild>
                <a href={formatPhoneLink(siteConfig.company.phone)}>
                  <Phone className="h-5 w-5 mr-2" />
                  {formatPhone(siteConfig.company.phone)}
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </PageHero>

      {/* Services Cover Flow */}
      <section className="section-padding bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="container-custom">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                What We Offer
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
                Browse Our Services
              </h2>
              <p className="text-lg text-gray-600">
                Use the arrows or click on a service to explore what we offer
              </p>
            </motion.div>
          </div>

          {/* Cover Flow Container */}
          <div 
            className="relative h-[580px] flex items-center justify-center"
            style={{ perspective: '1200px' }}
          >
            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 md:left-12 z-50 p-4 rounded-full bg-white/95 shadow-xl hover:bg-white hover:scale-110 transition-all"
              aria-label="Previous service"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 md:right-12 z-50 p-4 rounded-full bg-white/95 shadow-xl hover:bg-white hover:scale-110 transition-all"
              aria-label="Next service"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>

            {/* Services Container */}
            <div 
              className="relative flex items-center justify-center"
              style={{ 
                transformStyle: 'preserve-3d',
                width: '100%',
                height: '100%',
              }}
            >
              {services.map((service: any, index: number) => (
                <CoverFlowServiceCard
                  key={service.slug || index}
                  service={service}
                  index={index}
                  activeIndex={activeIndex}
                  totalServices={services.length}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {services.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeIndex 
                    ? 'w-8 bg-primary' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to service ${index + 1}`}
              />
            ))}
          </div>

          {/* Active Service Info */}
          {services[activeIndex] && (
            <motion.div 
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-8"
            >
              <p className="text-gray-500">
                Viewing: <span className="font-semibold text-gray-900">{services[activeIndex].name}</span>
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Need {siteConfig.industry.type} Help?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Contact us today for a free estimate. Our expert team is ready to help
            with all your {siteConfig.industry.type.toLowerCase()} needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link href="/free-estimate">Get Your Free Estimate</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
              <a href={formatPhoneLink(siteConfig.company.phone)}>
                <Phone className="h-5 w-5 mr-2" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
