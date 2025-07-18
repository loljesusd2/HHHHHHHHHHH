
'use client'

import { createContext, useContext, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAnalytics } from '@/hooks/use-analytics'

interface AnalyticsContextType {
  trackPageView: (page: string) => void
  trackUserAction: (action: string, category?: string, label?: string) => void
  trackError: (error: string, category?: string) => void
  trackConversion: (type: string, value?: number) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const analytics = useAnalytics()

  // Track page views
  useEffect(() => {
    analytics.trackPageView(pathname)
  }, [pathname, analytics])

  // Track user sessions
  useEffect(() => {
    if (session?.user) {
      analytics.trackUserAction('user_session', 'auth', 'logged_in')
    }
  }, [session, analytics])

  // Track performance metrics
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Track page load time
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      if (loadTime > 0) {
        analytics.track({
          action: 'page_load_time',
          category: 'performance',
          value: loadTime
        })
      }

      // Track connection type
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        analytics.track({
          action: 'connection_type',
          category: 'performance',
          label: connection.effectiveType || 'unknown'
        })
      }
    }
  }, [analytics])

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider')
  }
  return context
}
