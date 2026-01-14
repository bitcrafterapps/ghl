import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jobcapture.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  return [
    {
      url: siteUrl,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    // Add more pages as you create them
    // {
    //   url: `${siteUrl}/about`,
    //   lastModified: currentDate,
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
    // {
    //   url: `${siteUrl}/pricing`,
    //   lastModified: currentDate,
    //   changeFrequency: "weekly",
    //   priority: 0.9,
    // },
    // {
    //   url: `${siteUrl}/contact`,
    //   lastModified: currentDate,
    //   changeFrequency: "monthly",
    //   priority: 0.7,
    // },
    
    // Industry-specific landing pages (create these for SEO)
    // {
    //   url: `${siteUrl}/hvac-automation`,
    //   lastModified: currentDate,
    //   changeFrequency: "monthly",
    //   priority: 0.9,
    // },
    // {
    //   url: `${siteUrl}/plumbing-automation`,
    //   lastModified: currentDate,
    //   changeFrequency: "monthly",
    //   priority: 0.9,
    // },
    // {
    //   url: `${siteUrl}/roofing-automation`,
    //   lastModified: currentDate,
    //   changeFrequency: "monthly",
    //   priority: 0.9,
    // },
    // {
    //   url: `${siteUrl}/electrical-contractor-automation`,
    //   lastModified: currentDate,
    //   changeFrequency: "monthly",
    //   priority: 0.9,
    // },
  ];
}

