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
  metadataBase: new URL('https://test-6.com' || 'https://example.com'),
  title: {
    default: 'Test 6 | Plumbing Services in Irivne, CA',
    template: '%s | Test 6',
  },
  description: 'Test 6 provides professional plumbing services in Irivne, CA. 12+ years experience. Licensed & insured. Call for a free estimate!',
  keywords: 'plumbing, Irivne, CA, drain cleaning, water heater repair, water heater installation, leak detection, pipe repair, sewer line services',
  authors: [{ name: 'Test 6' }],
  openGraph: {
    title: 'Test 6 | Plumbing Services',
    description: 'Test 6 provides professional plumbing services in Irivne, CA. 12+ years experience. Licensed & insured. Call for a free estimate!',
    url: 'https://test-6.com',
    siteName: 'Test 6',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test 6 | Plumbing Services',
    description: 'Test 6 provides professional plumbing services in Irivne, CA. 12+ years experience. Licensed & insured. Call for a free estimate!',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// JSON-LD Schema for Local Business
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Plumber',
  name: 'Test 6',
  image: '',
  url: 'https://test-6.com',
  telephone: '2343535',
  email: 'sansd@cfv.m',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Mian',
    addressLocality: 'Irivne',
    addressRegion: 'CA',
    postalCode: '92688',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 0, // Will be replaced with actual coords if available
    longitude: 0,
  },
  areaServed: 'Irivne'.split(',').map(area => ({
    '@type': 'City',
    name: area.trim(),
  })),
  priceRange: '$$',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '100',
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Google Analytics - Only if ID provided */}
        {'' && ''.startsWith('G-') && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '');
              `}
            </Script>
          </>
        )}
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
