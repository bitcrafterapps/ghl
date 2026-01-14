"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { siteConfig } from "@/data/config";
import { getApiUrl } from "@/lib/api";

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

export default function GalleryPage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/api/v1/gallery-images?status=active`);
        if (response.ok) {
          const result = await response.json();
          // API returns data directly or wrapped in data property
          const imagesData = result.data || result;
          const images = Array.isArray(imagesData) ? imagesData : [];
          setGalleryImages(images);

          // Extract unique categories
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

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const nextImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % filteredImages.length);
    }
  };

  const prevImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
              Our Work Gallery
            </h1>
            <p className="text-xl text-white/80">
              Browse our portfolio of completed {siteConfig.industry.type.toLowerCase()} projects.
              Quality workmanship you can trust.
            </p>
          </motion.div>
        </div>
      </section>

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

      {/* Gallery Grid */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group"
                  onClick={() => openLightbox(index)}
                >
                  <Image
                    src={image.thumbnailUrl || image.blobUrl || `https://placehold.co/600x600/1a1a2e/ffffff?text=Project+${index + 1}`}
                    alt={image.altText || image.title || `${siteConfig.industry.type} project`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized={image.blobUrl?.includes('localhost')}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      View Image
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
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
        {selectedIndex !== null && filteredImages[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Navigation */}
            {filteredImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronLeft className="h-10 w-10" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronRight className="h-10 w-10" />
                </button>
              </>
            )}

            {/* Image */}
            <motion.div
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl max-h-[80vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={filteredImages[selectedIndex].blobUrl || ''}
                alt={filteredImages[selectedIndex].altText || filteredImages[selectedIndex].title || ''}
                width={1200}
                height={800}
                className="max-w-full max-h-[80vh] object-contain"
                unoptimized={filteredImages[selectedIndex].blobUrl?.includes('localhost')}
              />
              {filteredImages[selectedIndex].title && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                  <p className="font-medium">{filteredImages[selectedIndex].title}</p>
                  {filteredImages[selectedIndex].description && (
                    <p className="text-sm text-white/80">{filteredImages[selectedIndex].description}</p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {selectedIndex + 1} / {filteredImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PublicLayout>
  );
}
