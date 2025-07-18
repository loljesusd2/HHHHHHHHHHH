
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { SocialShareData } from '@/lib/types'

export interface ShareUrls {
  facebook: string
  twitter: string
  instagram: string
  whatsapp: string
  linkedin: string
}

export interface WatermarkConfig {
  originalImage: string
  watermarkText: string
  professionalName?: string
  logoUrl: string
  position: string
  opacity: number
  fontSize: number
  fontColor: string
  backgroundColor: string
  padding: number
}

export interface UseSocialShareReturn {
  loading: boolean
  error: string | null
  generateShareContent: (type: string, data: any) => Promise<{
    shareData: SocialShareData
    shareUrls: ShareUrls
    pointsAwarded: number
  }>
  generateWatermark: (imageUrl: string, text?: string, professionalName?: string) => Promise<WatermarkConfig>
  shareToSocial: (platform: string, shareData: SocialShareData) => void
  copyToClipboard: (text: string) => Promise<void>
}

export function useSocialShare(): UseSocialShareReturn {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateShareContent = async (type: string, data: any) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/gamification/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          ...data
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate share content')
      }

      const result = await response.json()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const generateWatermark = async (imageUrl: string, text?: string, professionalName?: string) => {
    try {
      const params = new URLSearchParams({
        image: imageUrl,
        ...(text && { text }),
        ...(professionalName && { professional: professionalName })
      })

      const response = await fetch(`/api/gamification/share/watermark?${params}`)
      if (!response.ok) {
        throw new Error('Failed to generate watermark config')
      }

      const config = await response.json()
      return config
    } catch (err) {
      throw err
    }
  }

  const shareToSocial = (platform: string, shareData: SocialShareData) => {
    const encodedText = encodeURIComponent(`${shareData.title}\n\n${shareData.description}\n\n${shareData.hashtags.join(' ')}`)
    const encodedUrl = encodeURIComponent('https://beautygo.app')
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodeURIComponent(shareData.title)}&summary=${encodeURIComponent(shareData.description)}`
    }

    const url = shareUrls[platform]
    if (url) {
      window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
    } else {
      throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
    } catch (err) {
      throw new Error('Failed to copy to clipboard')
    }
  }

  return {
    loading,
    error,
    generateShareContent,
    generateWatermark,
    shareToSocial,
    copyToClipboard
  }
}
