
'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { I18nProvider } from '@/components/i18n-provider'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/error-boundary'
import { AnalyticsProvider } from '@/components/analytics/analytics-provider'
import { OfflineIndicator } from '@/components/offline-indicator'
import { useState, useEffect } from 'react'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ErrorBoundary>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <I18nProvider>
            <AnalyticsProvider>
              <OfflineIndicator />
              <div className="mobile-container bg-gradient-to-br from-stone-50 to-amber-50 min-h-screen max-w-6xl mx-auto">
                {children}
              </div>
              <Toaster />
            </AnalyticsProvider>
          </I18nProvider>
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
}
