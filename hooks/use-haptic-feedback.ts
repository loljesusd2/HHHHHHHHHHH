
'use client'

import { useCallback, useEffect, useState } from 'react'

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning'

interface HapticOptions {
  pattern?: HapticPattern
  enabled?: boolean
}

export function useHapticFeedback(options: HapticOptions = {}) {
  const [isSupported, setIsSupported] = useState(false)
  const [isEnabled, setIsEnabled] = useState(options.enabled ?? true)

  useEffect(() => {
    // Check if haptic feedback is supported
    if (typeof window !== 'undefined') {
      const supported = 'vibrate' in navigator || 'hapticFeedback' in navigator
      setIsSupported(supported)
      
      // Check user preference for haptic feedback
      const preference = localStorage.getItem('haptic-feedback-enabled')
      if (preference !== null) {
        setIsEnabled(preference === 'true')
      }
    }
  }, [])

  const getVibrationPattern = useCallback((pattern: HapticPattern): number | number[] => {
    switch (pattern) {
      case 'light':
        return 50
      case 'medium':
        return 100
      case 'heavy':
        return 200
      case 'success':
        return [100, 50, 100]
      case 'error':
        return [200, 100, 200, 100, 200]
      case 'warning':
        return [100, 50, 100, 50, 100]
      default:
        return 100
    }
  }, [])

  const trigger = useCallback((pattern: HapticPattern = 'medium') => {
    if (!isSupported || !isEnabled) return

    try {
      const vibrationPattern = getVibrationPattern(pattern)
      
      // Use modern Vibration API
      if ('vibrate' in navigator) {
        navigator.vibrate(vibrationPattern)
      }
      
      // Fallback for iOS Safari with haptic feedback
      if ('hapticFeedback' in navigator) {
        (navigator as any).hapticFeedback.impact('medium')
      }
    } catch (error) {
      console.debug('Haptic feedback failed:', error)
    }
  }, [isSupported, isEnabled, getVibrationPattern])

  const toggleEnabled = useCallback(() => {
    const newEnabled = !isEnabled
    setIsEnabled(newEnabled)
    localStorage.setItem('haptic-feedback-enabled', newEnabled.toString())
    
    // Provide feedback for the toggle action
    if (newEnabled) {
      trigger('light')
    }
  }, [isEnabled, trigger])

  return {
    trigger,
    isSupported,
    isEnabled,
    toggleEnabled
  }
}
