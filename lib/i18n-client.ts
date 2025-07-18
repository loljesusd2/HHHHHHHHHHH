
'use client'

import { createContext, useContext } from 'react'

interface I18nContextType {
  locale: string
  t: (key: string, params?: Record<string, string | number>) => string
}

export const I18nContext = createContext<I18nContextType | null>(null)

export function useTranslations() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslations must be used within an I18nProvider')
  }
  return context.t
}

export function useLocale() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useLocale must be used within an I18nProvider')
  }
  return context.locale
}

// Helper function to get nested translation keys
export function getNestedTranslation(
  messages: Record<string, any>,
  key: string,
  params?: Record<string, string | number>
): string {
  const keys = key.split('.')
  let value: any = messages
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key // Return key if translation not found
    }
  }
  
  if (typeof value !== 'string') {
    return key
  }
  
  // Replace parameters in the translation
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match: string, paramKey: string) => {
      return params[paramKey]?.toString() || match
    })
  }
  
  return value
}
