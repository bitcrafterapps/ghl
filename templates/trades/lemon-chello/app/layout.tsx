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
  metadataBase: new URL('https://lemon-chello.com' || 'https://example.com'),
  title: {
    default: 'Lemon Chello | HVAC Services in Irvine, CA',
    template: '%s | Lemon Chello',
  },
  description: 'Lemon Chello provides professional hvac services in Irvine, CA. 12+ years experience. Licensed & insured. Call for a free estimate!',
  keywords: 'hvac, Irvine, CA, ac repair, ac installation, heating repair, furnace installation, hvac maintenance, duct cleaning',
  authors: [{ name: 'Lemon Chello' }],
  openGraph: {
    title: 'Lemon Chello | HVAC Services',
    description: 'Lemon Chello provides professional hvac services in Irvine, CA. 12+ years experience. Licensed & insured. Call for a free estimate!',
    url: 'https://lemon-chello.com',
    siteName: 'Lemon Chello',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lemon Chello | HVAC Services',
    description: 'Lemon Chello provides professional hvac services in Irvine, CA. 12+ years experience. Licensed & insured. Call for a free estimate!',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// JSON-LD Schema for Local Business
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HVACBusiness',
  name: 'Lemon Chello',
  image: '',
  url: 'https://lemon-chello.com',
  telephone: '949 292 31356',
  email: 's@s.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Main',
    addressLocality: 'Irvine',
    addressRegion: 'CA',
    postalCode: '92668',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 0, // Will be replaced with actual coords if available
    longitude: 0,
  },
  areaServed: 'Irvine'.split(',').map(area => ({
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
