
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'

export interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
  hapticFeedback?: boolean
  inputMode?: 'text' | 'tel' | 'email' | 'url' | 'search' | 'numeric' | 'decimal'
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    className, 
    type = 'text', 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    showPasswordToggle = false,
    hapticFeedback = false,
    inputMode,
    enterKeyHint,
    onFocus,
    onBlur,
    onChange,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const { trigger } = useHapticFeedback()

    const handleFocus = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      if (hapticFeedback) {
        trigger('light')
      }
      onFocus?.(e)
    }, [hapticFeedback, onFocus, trigger])

    const handleBlur = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    }, [onBlur])

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      if (hapticFeedback && e.target.value) {
        trigger('light')
      }
    }, [onChange, hapticFeedback, trigger])

    const togglePasswordVisibility = React.useCallback(() => {
      setShowPassword(!showPassword)
      if (hapticFeedback) {
        trigger('light')
      }
    }, [showPassword, hapticFeedback, trigger])

    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            inputMode={inputMode}
            enterKeyHint={enterKeyHint}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              leftIcon && 'pl-10',
              (rightIcon || showPasswordToggle) && 'pr-10',
              isFocused && 'ring-2 ring-amber-500 border-amber-500',
              error && 'border-red-500 focus-visible:ring-red-500',
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
          
          {showPasswordToggle && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          
          {rightIcon && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p id={`${props.id}-error`} className="text-sm text-red-600 flex items-center gap-1">
            <span className="text-red-500">⚠</span>
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${props.id}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = 'EnhancedInput'

export { EnhancedInput }
