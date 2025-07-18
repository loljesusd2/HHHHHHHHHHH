
'use client'

import Head from 'next/head'
import { usePathname } from 'next/navigation'

interface MetaTagsProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  noIndex?: boolean
}

export function MetaTags({
  title = 'Beauty GO - Professional Beauty Services',
  description = 'Connect with professional beauty service providers in Florida. Book appointments, discover services, and transform your beauty routine.',
  image = '/icon-512x512.png',
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noIndex = false
}: MetaTagsProps) {
  const pathname = usePathname()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beautygo.app'
  const fullUrl = url || `${baseUrl}${pathname}`
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="author" content={author || 'Beauty GO'} />
      <meta name="keywords" content={tags.join(', ')} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Beauty GO" />
      <meta property="og:locale" content="en_US" />
      
      {/* Article specific Open Graph */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@BeautyGO" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#B45309" />
      <meta name="apple-mobile-web-app-title" content="Beauty GO" />
      <meta name="application-name" content="Beauty GO" />
      <meta name="msapplication-TileColor" content="#B45309" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Beauty GO',
            description: 'Professional beauty services platform',
            url: baseUrl,
            applicationCategory: 'Beauty & Personal Care',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              category: 'Beauty Services',
              areaServed: 'Florida, USA'
            }
          })
        }}
      />
    </Head>
  )
}
