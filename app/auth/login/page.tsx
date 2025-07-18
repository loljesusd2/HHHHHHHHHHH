
'use client'

import { EnhancedLoginForm } from '@/components/forms/enhanced-login-form'
import { ErrorBoundary } from '@/components/error-boundary'
import { ResponsiveContainer } from '@/components/ui/responsive-container'
import { LanguageSelector } from '@/components/language-selector'
import { ConnectionStatus } from '@/components/ui/connection-status'
import { HapticSettings } from '@/components/ui/haptic-settings'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useTranslations } from '@/lib/i18n-client'
import Link from 'next/link'

export default function LoginPage() {
  const { isOnline } = useOnlineStatus()
  const t = useTranslations()

  return (
    <ErrorBoundary>
      <ResponsiveContainer
        className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center p-4"
        mobileClassName="p-2"
        tabletClassName="p-6"
        desktopClassName="p-8"
      >
        <div className="w-full max-w-md space-y-6">
          {/* Language Selector */}
          <div className="flex justify-end">
            <LanguageSelector />
          </div>
          
          {/* Connection Status */}
          {!isOnline && (
            <div className="mb-4">
              <ConnectionStatus />
            </div>
          )}
          
          {/* Logo */}
          <div className="text-center">
            <div className="beauty-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">BG</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{t('auth.welcomeBack')}</h1>
            <p className="text-gray-600">{t('home.appName')}</p>
          </div>

          {/* Login Form */}
          <EnhancedLoginForm />
          
          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('auth.dontHaveAccount')}{' '}
              <Link href="/auth/register" className="text-amber-700 hover:text-amber-800 font-medium">
                {t('auth.signUpHere')}
              </Link>
            </p>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <HapticSettings />
          </div>
        </div>
      </ResponsiveContainer>
    </ErrorBoundary>
  )
}
