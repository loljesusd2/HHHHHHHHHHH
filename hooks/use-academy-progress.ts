
'use client'

import { useState, useEffect } from 'react'
import { CourseProgress, LearningProgress } from '@/lib/types'

export function useAcademyProgress(courseId?: string) {
  const [progress, setProgress] = useState<CourseProgress[] | LearningProgress[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (courseId) {
        params.append('courseId', courseId)
      }

      const response = await fetch(`/api/academy/progress?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch progress')
      }

      const data = await response.json()
      setProgress(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (lessonId: string, watchTime: number, isCompleted: boolean = false) => {
    try {
      setError(null)

      const response = await fetch('/api/academy/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          watchTime,
          isCompleted
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update progress')
      }

      // Refresh progress after update
      await fetchProgress()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    }
  }

  const markLessonComplete = async (lessonId: string) => {
    return updateProgress(lessonId, 0, true)
  }

  useEffect(() => {
    fetchProgress()
  }, [courseId])

  return {
    progress,
    loading,
    error,
    updateProgress,
    markLessonComplete,
    refreshProgress: fetchProgress
  }
}

export function useLessonProgress(lessonId: string) {
  const [progress, setProgress] = useState<CourseProgress | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateLessonProgress = async (watchTime: number, isCompleted: boolean = false) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/academy/lessons/${lessonId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          watchTime,
          isCompleted
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update lesson progress')
      }

      const data = await response.json()
      setProgress(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    progress,
    loading,
    error,
    updateLessonProgress
  }
}
