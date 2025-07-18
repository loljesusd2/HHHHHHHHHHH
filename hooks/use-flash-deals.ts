
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FlashDeal } from '@/lib/types'

export interface FlashDealWithTimeRemaining extends FlashDeal {
  timeRemaining: {
    hours: number
    minutes: number
    total: number
  }
  usesRemaining: number
}

export interface UseFlashDealsReturn {
  deals: FlashDealWithTimeRemaining[]
  loading: boolean
  error: string | null
  refetch: () => void
  createDeal: (dealData: CreateDealData) => Promise<FlashDeal>
  useDeal: (dealId: string) => Promise<{ success: boolean; discount: number }>
  deactivateDeal: (dealId: string) => Promise<void>
  setFilters: (filters: FlashDealFilters) => void
  filters: FlashDealFilters
}

export interface CreateDealData {
  serviceId: string
  discount: number
  durationHours: number
  neighborhood: string
  maxUses: number
}

export interface FlashDealFilters {
  neighborhood?: string
  category?: string
}

export function useFlashDeals(initialFilters?: FlashDealFilters): UseFlashDealsReturn {
  const { data: session } = useSession()
  const [deals, setDeals] = useState<FlashDealWithTimeRemaining[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<FlashDealFilters>(initialFilters || {})

  const fetchDeals = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        ...(filters.neighborhood && { neighborhood: filters.neighborhood }),
        ...(filters.category && { category: filters.category })
      })

      const response = await fetch(`/api/gamification/flash-deals?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch flash deals')
      }
      
      const data = await response.json()
      setDeals(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createDeal = async (dealData: CreateDealData) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      const response = await fetch('/api/gamification/flash-deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          ...dealData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create flash deal')
      }

      const deal = await response.json()
      
      // Refetch deals after creating
      await fetchDeals()
      
      return deal
    } catch (err) {
      throw err
    }
  }

  const useDeal = async (dealId: string) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      const response = await fetch('/api/gamification/flash-deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'use',
          dealId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to use flash deal')
      }

      const result = await response.json()
      
      // Refetch deals after using
      await fetchDeals()
      
      return result
    } catch (err) {
      throw err
    }
  }

  const deactivateDeal = async (dealId: string) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      const response = await fetch('/api/gamification/flash-deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deactivate',
          dealId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to deactivate flash deal')
      }

      // Refetch deals after deactivating
      await fetchDeals()
    } catch (err) {
      throw err
    }
  }

  const setFilters = (newFilters: FlashDealFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }

  useEffect(() => {
    fetchDeals()
  }, [filters])

  // Auto-refresh every 60 seconds to update time remaining
  useEffect(() => {
    const interval = setInterval(fetchDeals, 60000)
    return () => clearInterval(interval)
  }, [filters])

  return {
    deals,
    loading,
    error,
    refetch: fetchDeals,
    createDeal,
    useDeal,
    deactivateDeal,
    setFilters,
    filters
  }
}
