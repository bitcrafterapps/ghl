"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { siteConfig } from "@/data/config";
import { getApiUrl, getSiteId } from "@/lib/api";
import { PageHero } from "@/components/sections/PageHero";

interface GalleryImage {
  id: number;
  title: string;
  description?: string;
  altText?: string;
  blobUrl: string;
  thumbnailUrl?: string;
  category?: string;
  status: string;
}

// Individual gallery image for Cover Flow
function CoverFlowImage({ 
  image, 
  index, 
  activeIndex, 
  totalImages,
  onClick 
}: { 
  image: GalleryImage; 
  index: number; 
  activeIndex: number;
  totalImages: number;
  onClick: () => void;
}) {
  const placeholderUrl = `https://placehold.co/600x400/1a1a2e/ffffff?text=Project+${index + 1}`;
  const [imgSrc, setImgSrc] = useState(image.blobUrl || image.thumbnailUrl || placeholderUrl);
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
  const rotateY = offset * -45;
  const translateX = offset * 280;
  const translateZ = absOffset === 0 ? 0 : -150 - (absOffset * 50);
  const scale = absOffset === 0 ? 1 : 0.75 - (absOffset * 0.1);
  const opacity = absOffset > 3 ? 0 : 1 - (absOffset * 0.2);
  const zIndex = totalImages - absOffset;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        width: '400px',
        height: '320px',
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
          alt={image.altText || image.title || `${siteConfig.industry.type} project`}
          onError={handleError}
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
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
              {image.category && (
                <span className="inline-block mt-2 px-2 py-1 bg-primary/80 text-white text-xs rounded-full">
                  {image.category}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Reflection effect */}
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

export default function GalleryPage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const apiUrl = getApiUrl();
        const siteId = getSiteId();
        const headers: HeadersInit = siteId ? { 'x-site-id': siteId } : {};

        // Fetch gallery images - siteId header handles multi-tenant filtering
        const response = await fetch(`${apiUrl}/api/v1/gallery-images?status=active`, { headers });
        if (response.ok) {
          const result = await response.json();
          const imagesData = result.data || result;
          const images = Array.isArray(imagesData) ? imagesData : [];
          setGalleryImages(images);
          
          if (images.length > 0) {
            setActiveIndex(Math.floor(images.length / 2));
          }

          const uniqueCategories = Array.from(
            new Set(images.map((img: GalleryImage) => img.category).filter(Boolean))
          ) as string[];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  const filteredImages = selectedCategory
    ? galleryImages.filter(img => img.category === selectedCategory)
    : galleryImages;

  const goToPrevious = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredImages.length - 1));
  }, [filteredImages.length]);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev < filteredImages.length - 1 ? prev + 1 : 0));
  }, [filteredImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === 'Escape') setLightboxOpen(false);
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
      } else {
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'Enter') setLightboxOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, lightboxOpen]);

  // Reset active index when category changes
  useEffect(() => {
    if (filteredImages.length > 0) {
      setActiveIndex(Math.floor(filteredImages.length / 2));
    }
  }, [selectedCategory, filteredImages.length]);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <PageHero
        title="Our Work Gallery"
        description={`Browse our portfolio of completed ${siteConfig.industry.type.toLowerCase()} projects. Quality workmanship you can trust.`}
      />

      {/* Category Filter */}
      {categories.length > 0 && (
        <section className="bg-gray-50 py-6 border-b border-gray-200">
          <div className="container-custom">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === null
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cover Flow Gallery */}
      <section className="section-padding bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="container-custom">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredImages.length > 0 ? (
            <>
              {/* Section Header */}
              <div className="text-center max-w-3xl mx-auto mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                    Our Portfolio
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
                    {filteredImages.length} {siteConfig.industry.type} Project{filteredImages.length !== 1 ? 's' : ''}
                  </h2>
                  <p className="text-lg text-gray-600">
                    Use the arrows to browse or click an image to view details
                  </p>
                </motion.div>
              </div>

              {/* Cover Flow Container */}
              <div 
                className="relative h-[450px] flex items-center justify-center"
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
                  {filteredImages.map((image, index) => (
                    <CoverFlowImage
                      key={image.id || index}
                      image={image}
                      index={index}
                      activeIndex={activeIndex}
                      totalImages={filteredImages.length}
                      onClick={() => {
                        if (index === activeIndex) {
                          setLightboxOpen(true);
                        } else {
                          setActiveIndex(index);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-8 flex-wrap">
                {filteredImages.map((_, index) => (
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

              {/* Image Counter */}
              <div className="text-center mt-6">
                <span className="text-gray-500">
                  {activeIndex + 1} of {filteredImages.length}
                </span>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg mb-4">
                Gallery coming soon! Check back later for photos of our {siteConfig.industry.type.toLowerCase()} projects.
              </p>
              <p className="text-gray-500">
                In the meantime, contact us for references and to discuss your project.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && filteredImages[activeIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Navigation */}
            {filteredImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                  className="absolute left-4 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronLeft className="h-12 w-12" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="absolute right-4 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronRight className="h-12 w-12" />
                </button>
              </>
            )}

            {/* Image */}
            <motion.div
              key={activeIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-5xl max-h-[85vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filteredImages[activeIndex].blobUrl || ''}
                alt={filteredImages[activeIndex].altText || filteredImages[activeIndex].title || ''}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              {filteredImages[activeIndex].title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-6 rounded-b-lg">
                  <p className="font-semibold text-xl">{filteredImages[activeIndex].title}</p>
                  {filteredImages[activeIndex].description && (
                    <p className="text-white/80 mt-1">{filteredImages[activeIndex].description}</p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
              {activeIndex + 1} / {filteredImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PublicLayout>
  );
}
