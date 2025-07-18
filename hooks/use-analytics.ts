
'use client'

import { useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  userId?: string
  customProperties?: Record<string, any>
}

export function useAnalytics() {
  const { data: session } = useSession()

  useEffect(() => {
    // Initialize analytics if not already done
    if (typeof window !== 'undefined' && !(window as any).gtag) {
      // Load Google Analytics
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`
      script.async = true
      document.head.appendChild(script)

      script.onload = () => {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).gtag = function() {
          (window as any).dataLayer.push(arguments)
        };
        (window as any).gtag('js', new Date());
        (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_title: document.title,
          page_location: window.location.href
        })
      }
    }
  }, [])

  const track = useCallback((event: AnalyticsEvent) => {
    try {
      // Google Analytics 4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
          custom_map: event.customProperties
        })
      }

      // Console logging for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Event:', event)
      }

      // Custom analytics endpoint for internal tracking
      if (typeof window !== 'undefined') {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...event,
            userId: session?.user?.email || 'anonymous',
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
          })
        }).catch(error => {
          console.debug('Analytics tracking failed:', error)
        })
      }
    } catch (error) {
      console.debug('Analytics tracking failed:', error)
    }
  }, [session])

  const trackPageView = useCallback((page: string) => {
    track({
      action: 'page_view',
      category: 'navigation',
      label: page
    })
  }, [track])

  const trackUserAction = useCallback((action: string, category: string = 'user_action', label?: string) => {
    track({
      action,
      category,
      label
    })
  }, [track])

  const trackError = useCallback((error: string, category: string = 'error') => {
    track({
      action: 'error',
      category,
      label: error
    })
  }, [track])

  const trackConversion = useCallback((type: string, value?: number) => {
    track({
      action: 'conversion',
      category: 'business',
      label: type,
      value
    })
  }, [track])

  return {
    track,
    trackPageView,
    trackUserAction,
    trackError,
    trackConversion
  }
}
