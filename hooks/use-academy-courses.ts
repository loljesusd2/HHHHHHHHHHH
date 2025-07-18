
'use client'

import { useState, useEffect } from 'react'
import { Course } from '@/lib/types'

interface CoursesResponse {
  courses: Course[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    totalCount: number
  }
}

interface UseCoursesOptions {
  category?: string
  level?: string
  featured?: boolean
  search?: string
  page?: number
  limit?: number
}

export function useAcademyCourses(options: UseCoursesOptions = {}) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 0,
    totalCount: 0
  })

  const fetchCourses = async (opts: UseCoursesOptions = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (opts.category) params.append('category', opts.category)
      if (opts.level) params.append('level', opts.level)
      if (opts.featured) params.append('featured', 'true')
      if (opts.search) params.append('search', opts.search)
      if (opts.page) params.append('page', opts.page.toString())
      if (opts.limit) params.append('limit', opts.limit.toString())

      const response = await fetch(`/api/academy/courses?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }

      const data: CoursesResponse = await response.json()
      
      if (opts.page && opts.page > 1) {
        // Append to existing courses for pagination
        setCourses(prev => [...prev, ...data.courses])
      } else {
        setCourses(data.courses)
      }
      
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchCourses({ ...options, page: pagination.page + 1 })
    }
  }

  const refreshCourses = () => {
    fetchCourses(options)
  }

  useEffect(() => {
    fetchCourses(options)
  }, [options.category, options.level, options.featured, options.search])

  return {
    courses,
    loading,
    error,
    pagination,
    loadMore,
    refreshCourses,
    hasMore: pagination.page < pagination.totalPages
  }
}

export function useAcademyCourse(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)

  const fetchCourse = async () => {
    if (!courseId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/academy/courses/${courseId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch course')
      }

      const data = await response.json()
      setCourse(data)
      setIsEnrolled(data.isEnrolled)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const enrollInCourse = async () => {
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
          enrollmentType: 'INDIVIDUAL'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to enroll in course')
      }

      setIsEnrolled(true)
      await fetchCourse() // Refresh course data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourse()
  }, [courseId])

  return {
    course,
    loading,
    error,
    isEnrolled,
    enrollInCourse,
    refreshCourse: fetchCourse
  }
}
