"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { galleryImages, siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";

export function GalleryPreview() {
  if (!galleryImages || galleryImages.length === 0) {
    return null;
  }

  return (
    <section id="gallery" className="section-padding bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-primary font-semibold uppercase tracking-wide">
            Our Work
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mt-2 mb-4">
            Project Gallery
          </h2>
          <p className="text-lg text-gray-600">
            Browse our portfolio of completed projects. Quality craftsmanship
            you can see.
          </p>
        </motion.div>

        {/* Gallery Grid - Asymmetric Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryImages.slice(0, 6).map((image: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative group overflow-hidden rounded-xl ${
                index === 0 || index === 3
                  ? "col-span-2 row-span-2 aspect-square"
                  : "aspect-[4/3]"
              }`}
            >
              <Image
                src={image.src || `https://placehold.co/600x600/1a1a2e/ffffff?text=Project+${index + 1}`}
                alt={image.alt || `${siteConfig.industry.type} project ${index + 1}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Hover Overlay Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                {image.title && (
                  <h4 className="font-heading font-semibold">{image.title}</h4>
                )}
                {image.category && (
                  <p className="text-sm text-white/80">{image.category}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" asChild>
            <Link href="/gallery">
              View Full Gallery
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
