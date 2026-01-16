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
  metadataBase: new URL('' || 'https://example.com'),
  title: {
    default: 'Amazon Electric | Roofing Services in Rancho Santa Margarita, CA',
    template: '%s | Amazon Electric',
  },
  description: 'Amazon Electric provides professional roofing services in Rancho Santa Margarita, CA. 10+ years experience. Licensed & insured. Call for a free estimate!',
  keywords: 'roofing, Rancho Santa Margarita, CA, roof repair, roof replacement, storm damage repair, commercial roofing, gutter services, roof inspection',
  authors: [{ name: 'Amazon Electric' }],
  openGraph: {
    title: 'Amazon Electric | Roofing Services',
    description: 'Amazon Electric provides professional roofing services in Rancho Santa Margarita, CA. 10+ years experience. Licensed & insured. Call for a free estimate!',
    url: '',
    siteName: 'Amazon Electric',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amazon Electric | Roofing Services',
    description: 'Amazon Electric provides professional roofing services in Rancho Santa Margarita, CA. 10+ years experience. Licensed & insured. Call for a free estimate!',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// JSON-LD Schema for Local Business
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Amazon Electric',
  image: '',
  url: '',
  telephone: '9492923136',
  email: 'time@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '15 Las Castanetas',
    addressLocality: 'Rancho Santa Margarita',
    addressRegion: 'CA',
    postalCode: '92688',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 0, // Will be replaced with actual coords if available
    longitude: 0,
  },
  areaServed: ''.split(',').map(area => ({
    '@type': 'City',
    name: area.trim(),
  })),
  priceRange: '$$',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '100',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
