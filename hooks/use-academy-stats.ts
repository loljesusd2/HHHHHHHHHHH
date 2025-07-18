
'use client'

import { useState, useEffect } from 'react'
import { AcademyStats } from '@/lib/types'

interface UserStats {
  totalEnrollments: number
  coursesCompleted: number
  totalWatchTimeHours: number
  certificationsEarned: number
  totalSpent: number
  completionRate: number
}

interface InstructorStats {
  totalCourses: number
  totalStudents: number
  totalRevenue: number
  averageRating: number
  totalEarnings: number
}

interface GlobalStats {
  totalCourses: number
  totalStudents: number
  totalInstructors: number
  totalRevenue: number
  averageRating: number
  totalCertifications: number
  conversionRate: number
}

type StatsType = 'user' | 'instructor' | 'global'

export function useAcademyStats(type: StatsType = 'user') {
  const [stats, setStats] = useState<UserStats | InstructorStats | GlobalStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/academy/stats?type=${type}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const refreshStats = () => {
    fetchStats()
  }

  useEffect(() => {
    fetchStats()
  }, [type])

  return {
    stats,
    loading,
    error,
    refreshStats
  }
}

export function useUserAcademyStats() {
  const { stats, loading, error, refreshStats } = useAcademyStats('user')
  
  return {
    stats: stats as UserStats | null,
    loading,
    error,
    refreshStats
  }
}

export function useInstructorAcademyStats() {
  const { stats, loading, error, refreshStats } = useAcademyStats('instructor')
  
  return {
    stats: stats as InstructorStats | null,
    loading,
    error,
    refreshStats
  }
}

export function useGlobalAcademyStats() {
  const { stats, loading, error, refreshStats } = useAcademyStats('global')
  
  return {
    stats: stats as GlobalStats | null,
    loading,
    error,
    refreshStats
  }
}
