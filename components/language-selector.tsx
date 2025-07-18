
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLocale } from '@/lib/i18n-client'

interface Language {
  code: string
  name: string
  flag: string
  nativeName: string
}

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English'
  },
  {
    code: 'es',
    name: 'Spanish',
    flag: '🇪🇸',
    nativeName: 'Español'
  }
]

export function LanguageSelector() {
  const currentLocale = useLocale()
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const language = languages.find(lang => lang.code === currentLocale) || languages[0]
    setCurrentLanguage(language)
  }, [currentLocale])

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language)
    
    // Save to localStorage
    localStorage.setItem('beauty-go-language', language.code)
    
    // Set cookie for server-side detection
    document.cookie = `beauty-go-language=${language.code}; path=/; max-age=31536000`
    
    // Dispatch custom event to notify I18nProvider
    window.dispatchEvent(new CustomEvent('languageChange', { 
      detail: { locale: language.code } 
    }))
    
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-3 text-amber-700 hover:text-amber-800 hover:bg-amber-50 border border-amber-200 bg-white/80 backdrop-blur-sm"
        >
          <Globe className="h-4 w-4 mr-2" />
          <span className="text-lg mr-1">{currentLanguage.flag}</span>
          <span className="hidden sm:inline font-medium">{currentLanguage.nativeName}</span>
          <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white/95 backdrop-blur-sm border-amber-200 shadow-lg"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language)}
            className={`cursor-pointer px-3 py-2 hover:bg-amber-50 focus:bg-amber-50 ${
              currentLanguage.code === language.code 
                ? 'bg-amber-50 text-amber-800' 
                : 'text-stone-700'
            }`}
          >
            <motion.div
              className="flex items-center w-full"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-xl mr-3">{language.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{language.nativeName}</span>
                <span className="text-xs text-stone-500">{language.name}</span>
              </div>
              {currentLanguage.code === language.code && (
                <motion.div
                  className="ml-auto w-2 h-2 bg-amber-600 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
