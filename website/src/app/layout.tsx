import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/components/modal-provider";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jobcapture.ai";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0c10",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  
  // Primary Meta Tags
  title: {
    default: "AI Automation for Contractors | Missed Call Recovery & Booking System | JobCapture",
    template: "%s | JobCapture - AI for Contractors",
  },
  description:
    "Stop losing 20-40% of jobs to missed calls. Our AI-powered system automatically responds to missed calls, qualifies leads, and books estimates 24/7. Built for HVAC, plumbing, electrical, roofing & general contractors. $497/mo, no contracts.",
  
  // Keywords optimized for contractor searches
  keywords: [
    // Primary keywords
    "contractor automation software",
    "missed call text back for contractors",
    "AI booking system for contractors",
    "contractor lead management",
    "HVAC lead generation",
    "plumbing lead management software",
    "roofing contractor CRM",
    "electrical contractor software",
    
    // Long-tail keywords
    "how to get more contractor jobs",
    "missed call recovery for service businesses",
    "automated follow up for contractors",
    "contractor appointment booking software",
    "24/7 lead capture for contractors",
    "AI receptionist for contractors",
    "contractor quote follow up automation",
    "Google review automation for contractors",
    
    // Industry specific
    "HVAC missed call text back",
    "plumber lead automation",
    "roofer CRM software",
    "electrician booking system",
    "general contractor lead management",
    "home service business automation",
    "restoration company CRM",
    "carpet cleaning lead software",
    
    // Pain point keywords
    "stop losing contractor leads",
    "recover missed calls contractor",
    "book more estimates automatically",
    "contractor after hours answering",
  ],
  
  // Authorship & Publisher
  authors: [{ name: "JobCapture", url: siteUrl }],
  creator: "JobCapture",
  publisher: "JobCapture",
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "JobCapture",
    title: "AI Automation for Contractors | Book 20-40% More Jobs",
    description:
      "Stop losing jobs to missed calls. Our AI responds instantly, qualifies leads, and books estimates 24/7. Built for HVAC, plumbing, electrical, roofing contractors. See a demo →",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "JobCapture - AI Automation for Contractors",
        type: "image/png",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "AI Automation for Contractors | Book 20-40% More Jobs",
    description:
      "Stop losing jobs to missed calls. AI responds instantly, qualifies leads, books estimates 24/7. Built for contractors.",
    images: [`${siteUrl}/og-image.png`],
    creator: "@jobcapture",
    site: "@jobcapture",
  },
  
  // Verification (add your actual codes)
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  
  // Alternate languages (if applicable)
  alternates: {
    canonical: siteUrl,
  },
  
  // App-specific
  applicationName: "JobCapture",
  category: "Business Software",
  
  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  
  // Manifest
  manifest: "/manifest.json",
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    // Organization
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "JobCapture",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
        width: 200,
        height: 200,
      },
      description:
        "AI-powered automation for construction and service contractors. Recover missed calls, book more estimates, and follow up automatically 24/7.",
      sameAs: [
        "https://twitter.com/jobcapture",
        "https://linkedin.com/company/jobcapture",
        "https://facebook.com/jobcapture",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+1-949-615-4035",
        contactType: "sales",
        availableLanguage: "English",
      },
    },
    // Website
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "JobCapture",
      description: "AI Automation for Contractors",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    // Software Application
    {
      "@type": "SoftwareApplication",
      name: "JobCapture",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "AI-powered missed call recovery and booking system for contractors",
      offers: {
        "@type": "Offer",
        price: "497",
        priceCurrency: "USD",
        priceValidUntil: "2025-12-31",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "47",
        bestRating: "5",
        worstRating: "1",
      },
    },
    // Service
    {
      "@type": "Service",
      name: "Contractor AI Automation",
      provider: { "@id": `${siteUrl}/#organization` },
      description:
        "Done-for-you AI booking and follow-up system for construction and service contractors. Includes missed call text-back, AI lead qualification, automatic booking, quote follow-up, and review generation.",
      serviceType: "Business Automation",
      areaServed: {
        "@type": "Country",
        name: "United States",
      },
      audience: {
        "@type": "BusinessAudience",
        audienceType: "Contractors",
      },
      offers: {
        "@type": "Offer",
        price: "497",
        priceCurrency: "USD",
        description: "Monthly subscription, no long-term contracts",
      },
    },
    // FAQ Page
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Do I need to switch my phone system or CRM?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Not necessarily. Our platform can sit alongside your current tools, or we can consolidate everything into one system. Most clients love having everything in one place once they see how seamless it is.",
          },
        },
        {
          "@type": "Question",
          name: "Will this replace my office staff?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. This system supports your staff by catching what they can't get to — after-hours calls, peak times, and follow-ups that slip through the cracks. Think of it as giving your team superpowers, not replacing them.",
          },
        },
        {
          "@type": "Question",
          name: "How fast can we be live?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Most companies are live within 7 days, often faster if you already have clear services and pricing. We handle all the setup and configuration — you just need to review and approve.",
          },
        },
        {
          "@type": "Question",
          name: "What if the AI says something wrong?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We use tested scripts and guardrails built specifically for contractors. You approve all messaging, and we monitor and adjust in the first weeks after launch. The AI follows your rules.",
          },
        },
        {
          "@type": "Question",
          name: "Is this compliant with TCPA and SMS regulations?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. We build your flows to follow opt-in and messaging best practices. We'll walk you through the basics during setup and make sure everything is compliant from day one.",
          },
        },
        {
          "@type": "Question",
          name: "What do you need from us to start?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Typically just access to your existing numbers or call routing, a short list of services and service areas, and a point person who can approve messaging and see the first leads come in. Usually takes about 30 minutes of your time total.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch for analytics (add your domains) */}
        {/* <link rel="dns-prefetch" href="https://www.googletagmanager.com" /> */}
      </head>
      <body
        className={`${bebasNeue.variable} ${outfit.variable} ${dmSans.variable} font-body`}
      >
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}
