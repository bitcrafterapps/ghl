import './globals.css'
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'
import Script from 'next/script'

// Font configuration - will be replaced with tokenized values
const fontBody = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
})

const fontHeading = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
})

// Tokenized metadata - replaced by create-site.js
export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    default: 'Acme | HVAC Services in irvine, CA',
    template: '%s | Acme',
  },
  description: 'META_DESCRIPTION',
  keywords: 'META_KEYWORDS',
  authors: [{ name: 'Acme' }],
  openGraph: {
    title: 'Acme | HVAC Services',
    description: 'META_DESCRIPTION',
    url: 'SITE_URL',
    siteName: 'Acme',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acme | HVAC Services',
    description: 'META_DESCRIPTION',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// JSON-LD Schema for Local Business
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SCHEMA_BUSINESS_TYPE',
  name: 'Acme',
  image: 'public/logo.png',
  url: 'SITE_URL',
  telephone: '8383838',
  email: 'sandy@.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123',
    addressLocality: 'irvine',
    addressRegion: 'CA',
    postalCode: '',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 0, // Will be replaced with actual coords if available
    longitude: 0,
  },
  areaServed: 'SERVICE_AREAS'.split(',').map(area => ({
    '@type': 'City',
    name: area.trim(),
  })),
  priceRange: '$$',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: 'RATING_VALUE',
    reviewCount: 'REVIEW_COUNT',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={ { __html: JSON.stringify(jsonLd) } }
        />
        
        {/* Google Analytics - Only if ID provided
        {'GOOGLE_ANALYTICS_ID' && 'GOOGLE_ANALYTICS_ID'.startsWith('G-') && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=GOOGLE_ANALYTICS_ID`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'GOOGLE_ANALYTICS_ID');
              `}
            </Script>
          </>
        )} */}
      </head>
      <body className={`${fontBody.variable} ${fontHeading.variable} font-body min-h-screen`}>
        <ThemeProvider>
          <AuthProvider>
            {children as any}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
