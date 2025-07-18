
'use client'

import { ReactNode, useEffect, useState } from 'react'
import { I18nContext, getNestedTranslation } from '@/lib/i18n-client'

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocale] = useState('en')
  const [messages, setMessages] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true)
      
      // Get locale from localStorage or browser preference
      const savedLocale = localStorage.getItem('beauty-go-language')
      const browserLocale = navigator.language.startsWith('es') ? 'es' : 'en'
      const currentLocale = savedLocale || browserLocale
      
      setLocale(currentLocale)
      
      try {
        const messagesModule = await import(`../messages/${currentLocale}.json`)
        setMessages(messagesModule.default)
      } catch (error) {
        console.error('Failed to load messages:', error)
        // Fallback to English
        const fallbackMessages = await import('../messages/en.json')
        setMessages(fallbackMessages.default)
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()

    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent) => {
      const newLocale = event.detail.locale
      setLocale(newLocale)
      loadMessages()
    }

    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener)
    }
  }, [])

  const t = (key: string, params?: Record<string, string | number>) => {
    if (isLoading || !messages) {
      return key // Return key while loading
    }
    return getNestedTranslation(messages, key, params)
  }

  return (
    <I18nContext.Provider value={{ locale, t }}>
      {children}
    </I18nContext.Provider>
  )
}
