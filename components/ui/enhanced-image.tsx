
'use client'

import * as React from 'react'
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ImageIcon, Loader2 } from 'lucide-react'

interface EnhancedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  containerClassName?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: () => void
  fallback?: React.ReactNode
}

export function EnhancedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  containerClassName,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  style,
  onLoad,
  onError,
  fallback
}: EnhancedImageProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoad = () => {
    setLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
    onError?.()
  }

  const defaultFallback = (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
      <ImageIcon className="w-8 h-8" />
    </div>
  )

  if (error) {
    return (
      <div className={cn('relative overflow-hidden', containerClassName)}>
        {fallback || defaultFallback}
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={cn(
          'object-cover transition-opacity duration-300',
          loading ? 'opacity-0' : 'opacity-100',
          className
        )}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        style={style}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}

// Pre-configured variants
export function ProfileImage({ src, alt, size = 'md', className, ...props }: {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
} & Omit<EnhancedImageProps, 'src' | 'alt' | 'width' | 'height'>) {
  const sizes = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 96, height: 96 }
  }

  const { width, height } = sizes[size]

  return (
    <EnhancedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn('rounded-full', className)}
      {...props}
    />
  )
}

export function ServiceImage({ src, alt, className, ...props }: {
  src: string
  alt: string
  className?: string
} & Omit<EnhancedImageProps, 'src' | 'alt'>) {
  return (
    <EnhancedImage
      src={src}
      alt={alt}
      fill
      className={cn('rounded-lg', className)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      {...props}
    />
  )
}

export function HeroImage({ src, alt, className, ...props }: {
  src: string
  alt: string
  className?: string
} & Omit<EnhancedImageProps, 'src' | 'alt'>) {
  return (
    <EnhancedImage
      src={src}
      alt={alt}
      fill
      priority
      className={cn('object-cover', className)}
      sizes="100vw"
      {...props}
    />
  )
}
