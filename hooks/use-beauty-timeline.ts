
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { BeautyTimeline } from '@/lib/types'

export interface TimelineStats {
  totalEntries: number
  publicEntries: number
  privateEntries: number
  servicesUsed: number
  favoriteService: string | null
  timelineStarted: Date | null
}

export interface GroupedTimeline {
  [monthKey: string]: BeautyTimeline[]
}

export interface UseBeautyTimelineReturn {
  timeline: GroupedTimeline
  stats: TimelineStats | null
  totalEntries: number
  loading: boolean
  error: string | null
  refetch: () => void
  addEntry: (entryData: AddTimelineEntryData) => Promise<BeautyTimeline>
  updateEntry: (timelineId: string, entryData: UpdateTimelineEntryData) => Promise<BeautyTimeline>
  deleteEntry: (timelineId: string) => Promise<void>
}

export interface AddTimelineEntryData {
  bookingId: string
  beforePhoto?: string
  afterPhoto?: string
  notes?: string
  isPublic?: boolean
}

export interface UpdateTimelineEntryData {
  beforePhoto?: string
  afterPhoto?: string
  notes?: string
  isPublic?: boolean
}

export function useBeautyTimeline(userId?: string, isPublic?: boolean): UseBeautyTimelineReturn {
  const { data: session } = useSession()
  const [timeline, setTimeline] = useState<GroupedTimeline>({})
  const [stats, setStats] = useState<TimelineStats | null>(null)
  const [totalEntries, setTotalEntries] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const targetUserId = userId || session?.user?.id

  const fetchTimeline = async () => {
    if (!targetUserId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        ...(userId && { userId }),
        ...(isPublic && { public: 'true' })
      })

      const response = await fetch(`/api/gamification/timeline?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch timeline')
      }
      
      const data = await response.json()
      setTimeline(data.timeline || {})
      setStats(data.stats || null)
      setTotalEntries(data.totalEntries || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addEntry = async (entryData: AddTimelineEntryData) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      const response = await fetch('/api/gamification/timeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add timeline entry')
      }

      const entry = await response.json()
      
      // Refetch timeline after adding
      await fetchTimeline()
      
      return entry
    } catch (err) {
      throw err
    }
  }

  const updateEntry = async (timelineId: string, entryData: UpdateTimelineEntryData) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      const response = await fetch('/api/gamification/timeline', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timelineId,
          ...entryData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update timeline entry')
      }

      const entry = await response.json()
      
      // Refetch timeline after updating
      await fetchTimeline()
      
      return entry
    } catch (err) {
      throw err
    }
  }

  const deleteEntry = async (timelineId: string) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      const response = await fetch(`/api/gamification/timeline?id=${timelineId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete timeline entry')
      }

      // Refetch timeline after deleting
      await fetchTimeline()
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchTimeline()
  }, [targetUserId, isPublic])

  return {
    timeline,
    stats,
    totalEntries,
    loading,
    error,
    refetch: fetchTimeline,
    addEntry,
    updateEntry,
    deleteEntry
  }
}
