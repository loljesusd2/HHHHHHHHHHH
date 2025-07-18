
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  animated?: boolean
}

export function EnhancedSkeleton({ className, animated = true }: SkeletonProps) {
  return (
    <motion.div
      className={cn(
        'animate-pulse rounded-md bg-muted relative overflow-hidden',
        className
      )}
      initial={animated ? { opacity: 0.3 } : undefined}
      animate={animated ? { opacity: [0.3, 0.6, 0.3] } : undefined}
      transition={animated ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {animated && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  )
}

// Service Card Skeleton
export function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
      <EnhancedSkeleton className="h-20 w-full" />
      <EnhancedSkeleton className="h-4 w-3/4" />
      <EnhancedSkeleton className="h-3 w-1/2" />
      <div className="flex justify-between items-center">
        <EnhancedSkeleton className="h-4 w-16" />
        <EnhancedSkeleton className="h-4 w-12" />
      </div>
    </div>
  )
}

// Professional Card Skeleton
export function ProfessionalCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
      <div className="flex flex-col items-center">
        <EnhancedSkeleton className="h-16 w-16 rounded-full mb-2" />
        <EnhancedSkeleton className="h-4 w-24" />
        <EnhancedSkeleton className="h-3 w-20" />
        <EnhancedSkeleton className="h-3 w-16 mt-2" />
        <EnhancedSkeleton className="h-8 w-full mt-2" />
      </div>
    </div>
  )
}

// Booking Card Skeleton
export function BookingCardSkeleton() {
  return (
    <div className="bg-amber-50 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-3">
        <EnhancedSkeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <EnhancedSkeleton className="h-4 w-32" />
          <EnhancedSkeleton className="h-3 w-24" />
          <EnhancedSkeleton className="h-3 w-28" />
        </div>
        <EnhancedSkeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  )
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white/10 rounded-lg p-4 space-y-2">
        <EnhancedSkeleton className="h-4 w-20 bg-white/20" />
        <EnhancedSkeleton className="h-8 w-12 bg-white/20" />
      </div>
      <div className="bg-white/10 rounded-lg p-4 space-y-2">
        <EnhancedSkeleton className="h-4 w-24 bg-white/20" />
        <EnhancedSkeleton className="h-8 w-16 bg-white/20" />
      </div>
    </div>
  )
}

// List Skeleton
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <BookingCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Form Skeleton
export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <EnhancedSkeleton className="h-4 w-20" />
        <EnhancedSkeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <EnhancedSkeleton className="h-4 w-24" />
        <EnhancedSkeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <EnhancedSkeleton className="h-4 w-28" />
        <EnhancedSkeleton className="h-20 w-full" />
      </div>
      <EnhancedSkeleton className="h-10 w-full" />
    </div>
  )
}
