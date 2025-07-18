
'use client'

import { useState, useEffect } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return
    }

    // Set initial state
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      // Track if we were offline before
      if (wasOffline) {
        setWasOffline(false)
        // Trigger analytics event
        if ((window as any).gtag) {
          (window as any).gtag('event', 'network_status', {
            event_category: 'connectivity',
            event_label: 'back_online'
          })
        }
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
      // Trigger analytics event
      if ((window as any).gtag) {
        (window as any).gtag('event', 'network_status', {
          event_category: 'connectivity',
          event_label: 'went_offline'
        })
      }
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  return { isOnline, wasOffline }
}
