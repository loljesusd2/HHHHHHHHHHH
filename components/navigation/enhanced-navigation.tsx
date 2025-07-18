
'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, Home, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import { useAnalytics } from '@/hooks/use-analytics'

interface EnhancedNavigationProps {
  showBackButton?: boolean
  showHomeButton?: boolean
  showCloseButton?: boolean
  title?: string
  onBack?: () => void
  onHome?: () => void
  onClose?: () => void
  className?: string
}

export function EnhancedNavigation({
  showBackButton = true,
  showHomeButton = false,
  showCloseButton = false,
  title,
  onBack,
  onHome,
  onClose,
  className
}: EnhancedNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { trigger } = useHapticFeedback()
  const { trackUserAction } = useAnalytics()

  const handleBack = () => {
    trigger('light')
    trackUserAction('navigation_back', 'navigation', pathname)
    
    if (onBack) {
      onBack()
    } else {
      // Smart back navigation
      if (window.history.length > 1) {
        router.back()
      } else {
        router.push('/')
      }
    }
  }

  const handleHome = () => {
    trigger('light')
    trackUserAction('navigation_home', 'navigation', pathname)
    
    if (onHome) {
      onHome()
    } else {
      router.push('/')
    }
  }

  const handleClose = () => {
    trigger('light')
    trackUserAction('navigation_close', 'navigation', pathname)
    
    if (onClose) {
      onClose()
    } else {
      router.back()
    }
  }

  // Keyboard navigation
  useKeyboardNavigation({
    onEscape: showCloseButton ? handleClose : showBackButton ? handleBack : undefined,
    enabled: true
  })

  return (
    <div className={`flex items-center justify-between p-4 ${className}`}>
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-white hover:bg-white/20"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
        )}
        
        {showHomeButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHome}
            className="text-white hover:bg-white/20"
            aria-label="Go to home"
          >
            <Home size={20} className="mr-2" />
            Home
          </Button>
        )}
      </div>

      {title && (
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      )}

      <div className="flex items-center gap-2">
        {showCloseButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X size={20} />
          </Button>
        )}
        
        {!showBackButton && !showHomeButton && !showCloseButton && (
          <div className="w-20" />
        )}
      </div>
    </div>
  )
}
