"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/data/config";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  align?: "center" | "left";
  noContainer?: boolean;
}

export function PageHero({ 
  className, 
  children, 
  title, 
  description,
  align = "center",
  noContainer = false
}: PageHeroProps) {
  // Get hero gradient colors from branding, fallback to default dark gradient
  const heroBgFrom = siteConfig.branding.heroBgFrom || '';
  const heroBgTo = siteConfig.branding.heroBgTo || '';
  const heroPattern = siteConfig.branding.heroPattern || 'none';
  const hasCustomGradient = heroBgFrom && heroBgTo && heroBgFrom !== '' && heroBgTo !== '';
  
  // Build gradient style
  const gradientStyle = hasCustomGradient 
    ? { background: `linear-gradient(135deg, ${heroBgFrom} 0%, ${heroBgTo} 100%)` }
    : undefined;

  // Pattern SVG options
  const patterns: Record<string, string> = {
    crosses: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    dots: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
    grid: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.2'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
    diagonal: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.15'%3E%3Cpath d='M0 40L40 0M-10 10L10 -10M30 50L50 30'/%3E%3C/g%3E%3C/svg%3E")`,
    waves: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q25 0, 50 10 T100 10' stroke='%23ffffff' stroke-opacity='0.15' fill='none'/%3E%3C/svg%3E")`,
    hexagons: `url("data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.15'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.35 11-6.35V17.9l-11-6.35L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/svg%3E")`,
    circles: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='12' stroke='%23ffffff' stroke-opacity='0.12' fill='none'/%3E%3C/svg%3E")`,
  };

  return (
    <section 
      className={cn(
        "relative py-20 overflow-hidden", 
        !hasCustomGradient && "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
        className
      )}
      style={gradientStyle}
    >
      {/* Background - Default gradient if no custom one */}
      {!hasCustomGradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      )}
      
      {/* Background Pattern - Only if pattern is selected */}
      {heroPattern !== 'none' && patterns[heroPattern] && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: patterns[heroPattern],
          }} />
        </div>
      )}

      {children ? (
        noContainer ? children : (
          <div className="container-custom relative z-10">
            {children}
          </div>
        )
      ) : (
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "max-w-3xl",
              align === "center" ? "mx-auto text-center" : ""
            )}
          >
            {title && (
              <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-xl text-white/80">
                {description}
              </p>
            )}
          </motion.div>
        </div>
      )}

    </section>
  );
}
