
'use client'

import { motion } from 'framer-motion'
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingState({ message = 'Loading...', size = 'md' }: LoadingStateProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center p-8"
    >
      <Loader2 className={`${sizeMap[size]} animate-spin text-amber-600 mb-4`} />
      <p className="text-gray-600 text-sm">{message}</p>
    </motion.div>
  )
}

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  showRetry?: boolean
}

export function ErrorState({ 
  title = 'Something went wrong',
  message = 'Please try again later',
  onRetry,
  showRetry = true
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col items-center justify-center p-8"
    >
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <XCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm text-center mb-4">{message}</p>
      {showRetry && onRetry && (
        <Button onClick={onRetry} className="bg-amber-600 hover:bg-amber-700">
          Try Again
        </Button>
      )}
    </motion.div>
  )
}

interface EmptyStateProps {
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
}

export function EmptyState({ 
  title = 'No data available',
  message = 'There\'s nothing to show here yet',
  action,
  icon
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col items-center justify-center p-8"
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon || <AlertCircle className="w-8 h-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm text-center mb-4">{message}</p>
      {action && (
        <Button onClick={action.onClick} className="bg-amber-600 hover:bg-amber-700">
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}

interface SuccessStateProps {
  title?: string
  message?: string
  onContinue?: () => void
}

export function SuccessState({ 
  title = 'Success!',
  message = 'Your action was completed successfully',
  onContinue
}: SuccessStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center p-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
      >
        <CheckCircle className="w-8 h-8 text-green-600" />
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm text-center mb-4">{message}</p>
      {onContinue && (
        <Button onClick={onContinue} className="bg-green-600 hover:bg-green-700">
          Continue
        </Button>
      )}
    </motion.div>
  )
}

// Network Error State
export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <Card className="bg-red-50 border-red-200">
      <CardContent className="p-6">
        <ErrorState
          title="Network Error"
          message="Unable to connect to the server. Please check your internet connection and try again."
          onRetry={onRetry}
        />
      </CardContent>
    </Card>
  )
}

// Page Loading State
export function PageLoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
      <LoadingState message="Loading page..." size="lg" />
    </div>
  )
}
