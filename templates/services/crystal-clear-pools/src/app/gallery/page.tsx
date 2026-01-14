"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Phone, X, ChevronLeft, ChevronRight } from "lucide-react";
import { siteConfig, galleryImages } from "@/data/config";
import { Button } from "@/components/ui/button";
import { formatPhone, formatPhoneLink } from "@/lib/utils";

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(galleryImages.map((img: any) => img.category).filter(Boolean)))];

  // Filter images
  const filteredImages = filter === "all"
    ? galleryImages
    : galleryImages.filter((img: any) => img.category === filter);

  const openLightbox = (index: number) => setSelectedImage(index);
  const closeLightbox = () => setSelectedImage(null);

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredImages.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
              Our Work
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Browse our portfolio of completed {siteConfig.industry.type.toLowerCase()} projects.
              Quality craftsmanship you can see.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          {galleryImages && galleryImages.length > 0 ? (
            <>
              {/* Filter Bar */}
              {categories.length > 2 && (
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {categories.map((category: string) => (
                    <button
                      key={category}
                      onClick={() => setFilter(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        filter === category
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {category === "all" ? "All Projects" : category}
                    </button>
                  ))}
                </div>
              )}

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="relative aspect-square group cursor-pointer overflow-hidden rounded-xl"
                    onClick={() => openLightbox(index)}
                  >
                      <Image
                      src={image.src || `https://placehold.co/600x600/1a1a2e/ffffff?text=Project+${index + 1}`}
                      alt={image.alt || `Project ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4">
                      {image.title && (
                        <p className="font-heading font-semibold text-center">{image.title}</p>
                      )}
                      {image.category && (
                        <p className="text-sm text-white/80">{image.category}</p>
                      )}
                      <p className="text-sm mt-2">Click to enlarge</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📷</div>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                Gallery Coming Soon
              </h2>
              <p className="text-gray-600 mb-6">
                We&apos;re working on adding photos of our recent projects.
                Check back soon!
              </p>
              <Button asChild>
                <Link href="/free-estimate">Request an Estimate</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && filteredImages[selectedImage] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
              onClick={closeLightbox}
            >
              <X className="h-8 w-8" />
            </button>

            {/* Navigation Buttons */}
            {filteredImages.length > 1 && (
              <>
                <button
                  className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            {/* Image */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl max-h-[80vh] w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={filteredImages[selectedImage].src || `https://placehold.co/1200x800/1a1a2e/ffffff?text=Project+${selectedImage + 1}`}
                alt={filteredImages[selectedImage].alt || `Project ${selectedImage + 1}`}
                width={1200}
                height={800}
                className="object-contain w-full h-full max-h-[80vh]"
              />

              {/* Caption */}
              {(filteredImages[selectedImage].title || filteredImages[selectedImage].category) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  {filteredImages[selectedImage].title && (
                    <p className="font-heading font-semibold text-lg">
                      {filteredImages[selectedImage].title}
                    </p>
                  )}
                  {filteredImages[selectedImage].category && (
                    <p className="text-white/80">{filteredImages[selectedImage].category}</p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {selectedImage + 1} / {filteredImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Let us bring this same level of quality to your home. Contact us today
            for a free estimate.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link href="/free-estimate">Get Your Free Estimate</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
              <a href={formatPhoneLink(siteConfig.company.phone)}>
                <Phone className="h-5 w-5 mr-2" />
                {formatPhone(siteConfig.company.phone)}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
