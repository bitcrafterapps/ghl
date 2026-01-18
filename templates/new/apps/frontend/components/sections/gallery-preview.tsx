"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { galleryImages as staticGalleryImages, siteConfig } from "@/data/config";
import { getApiUrl, getSiteId } from "@/lib/api";

// Individual gallery image component with error handling
function CoverFlowImage({ 
  image, 
  index, 
  activeIndex, 
  totalImages,
  onClick 
}: { 
  image: any; 
  index: number; 
  activeIndex: number;
  totalImages: number;
  onClick: () => void;
}) {
  const placeholderUrl = `https://placehold.co/600x400/1a1a2e/ffffff?text=Project+${index + 1}`;
  const [imgSrc, setImgSrc] = useState(image.blobUrl || image.src || image.url || placeholderUrl);
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
  const rotateY = offset * -45; // Rotate side images
  const translateX = offset * 220; // Spread images horizontally
  const translateZ = absOffset === 0 ? 0 : -150 - (absOffset * 50); // Push side images back
  const scale = absOffset === 0 ? 1 : 0.75 - (absOffset * 0.1); // Scale down side images
  const opacity = absOffset > 2 ? 0 : 1 - (absOffset * 0.2); // Fade distant images
  const zIndex = totalImages - absOffset;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        width: '320px',
        height: '240px',
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
      whileHover={absOffset === 0 ? { scale: 1.05 } : {}}
    >
      <div 
        className={`relative w-full h-full rounded-xl overflow-hidden shadow-2xl ${
          absOffset === 0 ? 'ring-4 ring-primary/50' : ''
        }`}
        style={{
          boxShadow: absOffset === 0 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
            : '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
        }}
      >
        <img
          src={imgSrc}
          alt={image.altText || image.alt || image.title || `${siteConfig.industry.type} project`}
          onError={handleError}
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Reflection gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        
        {/* Title overlay for active image */}
        <AnimatePresence>
          {absOffset === 0 && image.title && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
            >
              <p className="text-white font-semibold text-lg">{image.title}</p>
              {image.description && (
                <p className="text-white/80 text-sm">{image.description}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Reflection effect (optional, adds to Apple aesthetic) */}
      <div 
        className="absolute top-full left-0 right-0 h-24 overflow-hidden rounded-xl opacity-30"
        style={{
          transform: 'scaleY(-1)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)',
        }}
      >
        <img
          src={imgSrc}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    </motion.div>
  );
}

export function GalleryPreview() {
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const apiUrl = getApiUrl();
        const siteId = getSiteId();
        const headers: HeadersInit = siteId ? { 'x-site-id': siteId } : {};
        
        const response = await fetch(`${apiUrl}/api/v1/gallery-images?limit=10&status=active`, { headers });
        if (response.ok) {
          const result = await response.json();
          const apiImages = result.data || result || [];
          if (apiImages.length > 0) {
            setImages(apiImages);
            setActiveIndex(Math.floor(apiImages.length / 2)); // Start in middle
          } else {
            setImages(staticGalleryImages);
            setActiveIndex(Math.floor(staticGalleryImages.length / 2));
          }
        } else {
          setImages(staticGalleryImages);
          setActiveIndex(Math.floor(staticGalleryImages.length / 2));
        }
      } catch (error) {
        console.warn('Failed to fetch gallery images (using static fallback):', error);
        setImages(staticGalleryImages);
        setActiveIndex(Math.floor(staticGalleryImages.length / 2));
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  const goToPrevious = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  // If no gallery images, don't show section
  if (!isLoading && (!images || images.length === 0)) {
    return null;
  }

  return (
    <section className="section-padding bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Our Work
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
              Recent {siteConfig.industry.type} Projects
            </h2>
            <p className="text-lg text-gray-600">
              Take a look at some of our recent projects. We take pride in delivering 
              quality workmanship on every job.
            </p>
          </motion.div>
        </div>

        {/* Cover Flow Container */}
        <div 
          className="relative h-[400px] flex items-center justify-center"
          style={{ perspective: '1000px' }}
        >
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 md:left-8 z-50 p-3 rounded-full bg-white/90 shadow-lg hover:bg-white hover:scale-110 transition-all"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 md:right-8 z-50 p-3 rounded-full bg-white/90 shadow-lg hover:bg-white hover:scale-110 transition-all"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>

          {/* Images Container */}
          <div 
            className="relative flex items-center justify-center"
            style={{ 
              transformStyle: 'preserve-3d',
              width: '100%',
              height: '100%',
            }}
          >
            {images.map((image, index) => (
              <CoverFlowImage
                key={image.id || index}
                image={image}
                index={index}
                activeIndex={activeIndex}
                totalImages={images.length}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeIndex 
                  ? 'w-8 bg-primary' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>

        {/* View All Link */}
        {images.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
            >
              View Full Gallery
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
