
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { UserBadge } from '@/lib/types'

export interface BadgeDefinition {
  badgeType: string
  name: string
  description: string
  icon: string
  color: string
  earned: boolean
  progress?: number
  isNew?: boolean
}

export interface UseBadgesReturn {
  earned: BadgeDefinition[]
  available: BadgeDefinition[]
  total: number
  recentlyEarned: BadgeDefinition[]
  loading: boolean
  error: string | null
  refetch: () => void
  checkAndUpdateBadges: () => Promise<{ newBadges: UserBadge[] }>
}

export function useBadges(userId?: string): UseBadgesReturn {
  const { data: session } = useSession()
  const [earned, setEarned] = useState<BadgeDefinition[]>([])
  const [available, setAvailable] = useState<BadgeDefinition[]>([])
  const [total, setTotal] = useState(0)
  const [recentlyEarned, setRecentlyEarned] = useState<BadgeDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const targetUserId = userId || session?.user?.id

  const fetchBadges = async () => {
    if (!targetUserId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        ...(userId && { userId })
      })

      const response = await fetch(`/api/gamification/badges?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch badges')
      }
      
      const data = await response.json()
      setEarned(data.earned || [])
      setAvailable(data.available || [])
      setTotal(data.total || 0)
      setRecentlyEarned(data.recentlyEarned || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const checkAndUpdateBadges = async () => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      const response = await fetch('/api/gamification/badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update badges')
      }

      const data = await response.json()
      
      // Refetch badges after updating
      await fetchBadges()
      
      return {
        newBadges: data.newBadges || []
      }
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchBadges()
  }, [targetUserId])

  return {
    earned,
    available,
    total,
    recentlyEarned,
    loading,
    error,
    refetch: fetchBadges,
    checkAndUpdateBadges
  }
}
