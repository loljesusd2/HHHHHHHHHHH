
'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardNavigationOptions {
  onEnter?: () => void
  onEscape?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onTab?: () => void
  enabled?: boolean
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const { enabled = true } = options

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    switch (event.key) {
      case 'Enter':
        if (options.onEnter) {
          event.preventDefault()
          options.onEnter()
        }
        break
      case 'Escape':
        if (options.onEscape) {
          event.preventDefault()
          options.onEscape()
        }
        break
      case 'ArrowUp':
        if (options.onArrowUp) {
          event.preventDefault()
          options.onArrowUp()
        }
        break
      case 'ArrowDown':
        if (options.onArrowDown) {
          event.preventDefault()
          options.onArrowDown()
        }
        break
      case 'ArrowLeft':
        if (options.onArrowLeft) {
          event.preventDefault()
          options.onArrowLeft()
        }
        break
      case 'ArrowRight':
        if (options.onArrowRight) {
          event.preventDefault()
          options.onArrowRight()
        }
        break
      case 'Tab':
        if (options.onTab) {
          options.onTab()
        }
        break
    }
  }, [enabled, options])

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])

  return {
    handleKeyDown
  }
}
