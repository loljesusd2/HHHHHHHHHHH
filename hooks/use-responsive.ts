
'use client'

import { useState, useEffect } from 'react'

interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLandscape: boolean
  isPortrait: boolean
  screenWidth: number
  screenHeight: number
}

export function useResponsive() {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLandscape: false,
    isPortrait: true,
    screenWidth: 0,
    screenHeight: 0
  })

  useEffect(() => {
    const updateResponsiveState = () => {
      if (typeof window === 'undefined') return

      const width = window.innerWidth
      const height = window.innerHeight
      
      setState({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isLandscape: width > height,
        isPortrait: height > width,
        screenWidth: width,
        screenHeight: height
      })
    }

    // Initial check
    updateResponsiveState()

    // Listen for resize events
    window.addEventListener('resize', updateResponsiveState)
    window.addEventListener('orientationchange', updateResponsiveState)

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateResponsiveState)
      window.removeEventListener('orientationchange', updateResponsiveState)
    }
  }, [])

  return state
}
