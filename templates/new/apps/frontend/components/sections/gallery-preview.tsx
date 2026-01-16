"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { galleryImages as staticGalleryImages, siteConfig } from "@/data/config";
import { getApiUrl, getSiteId } from "@/lib/api";

export function GalleryPreview() {
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const apiUrl = getApiUrl();
        const siteId = getSiteId();
        const headers: HeadersInit = siteId ? { 'x-site-id': siteId } : {};
        
        const response = await fetch(`${apiUrl}/api/v1/gallery-images?limit=6&status=active`, { headers });
        if (response.ok) {
          const result = await response.json();
          const apiImages = result.data || result || [];
          if (apiImages.length > 0) {
            setImages(apiImages);
          } else {
             // Fallback to static if API empty
             setImages(staticGalleryImages);
          }
        } else {
          setImages(staticGalleryImages);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        setImages(staticGalleryImages);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Show only first 6 images on homepage
  const displayImages = images.slice(0, 6);

  // If no gallery images, don't show section
  if (!isLoading && (!images || images.length === 0)) {
    return null;
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
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

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayImages.map((image: any, index: number) => (
            <motion.div
              key={image.id || index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-xl group cursor-pointer ${
                index === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-square"
              }`}
            >
              <Image
                src={image.blobUrl || image.src || image.url || `https://placehold.co/600x400/1a1a2e/ffffff?text=Project+${index + 1}`}
                alt={image.altText || image.alt || image.title || `${siteConfig.industry.type} project`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {image.title && (
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white font-medium">{image.title}</p>
                  {image.description && (
                    <p className="text-white/80 text-sm">{image.description}</p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        {images.length > 6 && (
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
