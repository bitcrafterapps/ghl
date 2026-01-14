import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "../styles/globals.css";
import { siteConfig } from "@/data/config";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingElements } from "@/components/layout/floating-elements";

const fontHeading = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: siteConfig.branding.primaryColor,
};

export const metadata: Metadata = {
  metadataBase: siteConfig.siteUrl ? new URL(siteConfig.siteUrl) : undefined,
  title: {
    default: `${siteConfig.company.name} | ${siteConfig.industry.type} Services in ${siteConfig.company.city}, ${siteConfig.company.state}`,
    template: `%s | ${siteConfig.company.name}`,
  },
  description: siteConfig.seo.metaDescription,
  keywords: siteConfig.seo.metaKeywords,
  authors: [{ name: siteConfig.company.name }],
  creator: siteConfig.company.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.siteUrl || undefined,
    siteName: siteConfig.company.name,
    title: `${siteConfig.company.name} | Trusted ${siteConfig.industry.type} Services`,
    description: siteConfig.seo.metaDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.company.name,
    description: siteConfig.seo.metaDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

// JSON-LD Schema
const jsonLd = {
  "@context": "https://schema.org",
  "@type": siteConfig.industry.schemaType,
  name: siteConfig.company.name,
  image: siteConfig.branding.logoUrl,
  telephone: siteConfig.company.phone,
  email: siteConfig.company.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.company.address,
    addressLocality: siteConfig.company.city,
    addressRegion: siteConfig.company.state,
    postalCode: siteConfig.company.zip,
    addressCountry: "US",
  },
  url: siteConfig.siteUrl,
  priceRange: "$$",
  areaServed: siteConfig.serviceArea.areas.map((area) => ({
    "@type": "City",
    name: area,
  })),
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: siteConfig.reviews.rating,
    reviewCount: siteConfig.reviews.count,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Analytics */}
        {siteConfig.seo.googleAnalyticsId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.seo.googleAnalyticsId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${siteConfig.seo.googleAnalyticsId}');
                `,
              }}
            />
          </>
        )}
        {/* GHL Chat Widget */}
        {siteConfig.ghl.chatWidget && (
          <script
            dangerouslySetInnerHTML={{ __html: siteConfig.ghl.chatWidget }}
          />
        )}
      </head>
      <body className={`${fontHeading.variable} ${fontBody.variable} font-body`}>
        <Header />
        <main>{children}</main>
        <Footer />
        <FloatingElements />
      </body>
    </html>
  );
}
