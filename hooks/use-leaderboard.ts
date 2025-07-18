
'use client'

import { useState, useEffect } from 'react'
import { LeaderboardEntry } from '@/lib/types'

export interface UseLeaderboardReturn {
  leaderboard: LeaderboardEntry[]
  loading: boolean
  error: string | null
  refetch: () => void
  setFilters: (filters: LeaderboardFilters) => void
  filters: LeaderboardFilters
}

export interface LeaderboardFilters {
  type: 'all' | 'professionals' | 'clients'
  period: 'all' | 'weekly' | 'monthly'
  neighborhood?: string
  limit: number
}

export function useLeaderboard(initialFilters?: Partial<LeaderboardFilters>): UseLeaderboardReturn {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<LeaderboardFilters>({
    type: 'all',
    period: 'weekly',
    limit: 20,
    ...initialFilters
  })

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        type: filters.type,
        period: filters.period,
        limit: filters.limit.toString(),
        ...(filters.neighborhood && { neighborhood: filters.neighborhood })
      })

      const response = await fetch(`/api/gamification/leaderboard?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }
      
      const data = await response.json()
      setLeaderboard(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const setFilters = (newFilters: Partial<LeaderboardFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [filters])

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [filters])

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard,
    setFilters,
    filters
  }
}
