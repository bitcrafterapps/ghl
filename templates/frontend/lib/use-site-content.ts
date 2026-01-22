"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "./api";
import { siteConfig } from "@/data/config";
import { formatPhone } from "@/lib/utils";

interface ContentItem {
  id: string;
  siteId: string;
  page: string;
  section: string;
  contentKey: string;
  content: string;
}

interface UseSiteContentResult {
  content: Record<string, string>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Replace dynamic tokens with actual values from siteConfig
 */
function replaceTokens(content: string): string {
  if (!content) return content;

  const tokenMap: Record<string, string> = {
    '{company_name}': siteConfig.company?.name || '',
    '{primary_city}': siteConfig.serviceArea?.primaryCity || '',
    '{state}': siteConfig.company?.state || '',
    '{phone}': formatPhone(siteConfig.company?.phone || ''),
    '{email}': siteConfig.company?.email || '',
    '{industry}': siteConfig.industry?.type || '',
    '{years_in_business}': siteConfig.company?.yearsInBusiness?.toString() || '',
    '{service_radius}': siteConfig.serviceArea?.radius?.toString() || '',
    '{license}': siteConfig.company?.license || '',
    '{tagline}': siteConfig.branding?.tagline || '',
  };

  let result = content;
  for (const [token, value] of Object.entries(tokenMap)) {
    result = result.replace(new RegExp(token.replace(/[{}]/g, '\\$&'), 'g'), value);
  }

  return result;
}

/**
 * Hook to fetch dynamic site content for a specific section
 * Falls back to empty strings if content not found
 */
export function useSiteContent(page: string, section: string): UseSiteContentResult {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // fetchApi automatically includes x-site-id header from NEXT_PUBLIC_SITE_ID
        const response = await fetchApi(`/api/v1/site-content/${page}/${section}`);

        if (response.ok) {
          const result = await response.json();
          // Handle both wrapped {data: [...]} and direct [...] response formats
          const items: ContentItem[] = Array.isArray(result) ? result : (result.data || []);

          // Build content map with token replacement
          const contentMap: Record<string, string> = {};
          items.forEach(item => {
            contentMap[item.contentKey] = replaceTokens(item.content);
          });

          setContent(contentMap);
        }
      } catch (e) {
        console.warn(`Failed to fetch site content for ${page}/${section}:`, e);
        setError(e instanceof Error ? e.message : "Failed to fetch content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [page, section]);

  return { content, isLoading, error };
}

/**
 * Utility to strip HTML tags for plain text display
 */
export function stripHtml(html: string): string {
  if (typeof window === "undefined") {
    // Server-side: basic regex strip
    return html.replace(/<[^>]*>/g, "").trim();
  }
  // Client-side: use DOM parser for accurate stripping
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

/**
 * Utility to render HTML content safely
 * Use with dangerouslySetInnerHTML
 */
export function renderHtmlContent(html: string): { __html: string } {
  return { __html: html };
}
