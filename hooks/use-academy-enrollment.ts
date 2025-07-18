
'use client'

import { useState, useEffect } from 'react'
import { CourseEnrollment } from '@/lib/types'

interface EnrollmentWithProgress extends Omit<CourseEnrollment, 'course'> {
  course: {
    id: string
    title: string
    thumbnailUrl: string
    category: string
    duration: number
    instructor?: {
      name: string
      avatar?: string
    }
  }
}

export function useAcademyEnrollments(status: 'active' | 'completed' | 'all' = 'all') {
  const [enrollments, setEnrollments] = useState<EnrollmentWithProgress[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (status !== 'all') {
        params.append('status', status)
      }

      const response = await fetch(`/api/academy/enrollments?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch enrollments')
      }

      const data: EnrollmentWithProgress[] = await response.json()
      setEnrollments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createEnrollment = async (courseId: string, enrollmentType: string = 'INDIVIDUAL') => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/academy/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          enrollmentType
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create enrollment')
      }

      await fetchEnrollments() // Refresh enrollments
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnrollments()
  }, [status])

  return {
    enrollments,
    loading,
    error,
    createEnrollment,
    refreshEnrollments: fetchEnrollments
  }
}

export function useAcademyEnrollment(courseId: string) {
  const [enrollment, setEnrollment] = useState<EnrollmentWithProgress | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEnrollment = async () => {
    if (!courseId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/academy/enrollments?courseId=${courseId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch enrollment')
      }

      const data: EnrollmentWithProgress[] = await response.json()
      setEnrollment(data[0] || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnrollment()
  }, [courseId])

  return {
    enrollment,
    loading,
    error,
    refreshEnrollment: fetchEnrollment
  }
}
