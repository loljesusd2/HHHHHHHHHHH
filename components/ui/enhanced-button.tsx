
'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'

const enhancedButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: 'beauty-gradient text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-sm hover:shadow-md',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  hapticFeedback?: boolean
  hapticPattern?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText = 'Loading...',
    hapticFeedback = false,
    hapticPattern = 'light',
    leftIcon,
    rightIcon,
    children,
    onClick,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const { trigger } = useHapticFeedback()

    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return
      
      if (hapticFeedback) {
        trigger(hapticPattern)
      }
      
      onClick?.(e)
    }, [loading, disabled, hapticFeedback, hapticPattern, onClick, trigger])

    const isDisabled = disabled || loading

    return (
      <Comp
        className={cn(enhancedButtonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {loading ? loadingText : children}
        {!loading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </Comp>
    )
  }
)

EnhancedButton.displayName = 'EnhancedButton'

export { EnhancedButton, enhancedButtonVariants }
