
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#B45309',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://beautygo.app'),
  title: {
    default: 'Beauty GO - Professional Beauty Services',
    template: '%s | Beauty GO'
  },
  description: 'Connect with professional beauty service providers in Florida. Book appointments, discover services, and transform your beauty routine.',
  keywords: ['beauty services', 'professional beauty', 'Florida beauty', 'beauty appointments', 'beauty salon', 'beauty booking'],
  authors: [{ name: 'Beauty GO Team' }],
  creator: 'Beauty GO',
  publisher: 'Beauty GO',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://beautygo.app',
    title: 'Beauty GO - Professional Beauty Services',
    description: 'Connect with professional beauty service providers in Florida. Book appointments, discover services, and transform your beauty routine.',
    siteName: 'Beauty GO',
    images: [
      {
        url: '/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Beauty GO Logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beauty GO - Professional Beauty Services',
    description: 'Connect with professional beauty service providers in Florida. Book appointments, discover services, and transform your beauty routine.',
    images: ['/icon-512x512.png'],
    creator: '@BeautyGO'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Beauty GO" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Beauty GO',
              description: 'Professional beauty services platform connecting clients with verified beauty professionals in Florida',
              url: 'https://beautygo.app',
              applicationCategory: 'LifestyleApplication',
              operatingSystem: 'Web',
              browserRequirements: 'Requires JavaScript. Requires HTML5.',
              offers: {
                '@type': 'Offer',
                category: 'Beauty Services',
                areaServed: {
                  '@type': 'State',
                  name: 'Florida',
                  containedInPlace: {
                    '@type': 'Country',
                    name: 'United States'
                  }
                }
              },
              featureList: [
                'Book beauty appointments',
                'Discover professional services',
                'Professional verification',
                'Secure payments',
                'Real-time scheduling'
              ],
              author: {
                '@type': 'Organization',
                name: 'Beauty GO Team'
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
