
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { GamificationStats } from '@/lib/types'

export interface UseBeautyPointsReturn {
  stats: GamificationStats | null
  loading: boolean
  error: string | null
  refetch: () => void
  awardPoints: (action: string, points: number, description: string, bookingId?: string) => Promise<void>
}

export function useBeautyPoints(): UseBeautyPointsReturn {
  const { data: session } = useSession()
  const [stats, setStats] = useState<GamificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/gamification/points')
      if (!response.ok) {
        throw new Error('Failed to fetch gamification stats')
      }
      
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const awardPoints = async (action: string, points: number, description: string, bookingId?: string) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      const response = await fetch('/api/gamification/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          points,
          description,
          bookingId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to award points')
      }

      // Refetch stats after awarding points
      await fetchStats()
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchStats()
  }, [session])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    awardPoints
  }
}
