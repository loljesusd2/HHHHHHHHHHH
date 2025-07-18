
'use client'

import { useState, useEffect } from 'react'
import { AcademyCertification } from '@/lib/types'

interface CertificationProgress {
  category: string
  currentLevel: string | null
  nextLevel: string
  progress: {
    coursesCompleted: number
    averageScore: number
    totalHours: number
  }
  requirements: {
    coursesCompleted?: number
    averageScore?: number
    totalHours?: number
  }
  eligible: boolean
}

export function useAcademyCertifications() {
  const [certifications, setCertifications] = useState<AcademyCertification[]>([])
  const [progressToNext, setProgressToNext] = useState<CertificationProgress[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCertifications = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/academy/certifications')
      
      if (!response.ok) {
        throw new Error('Failed to fetch certifications')
      }

      const data = await response.json()
      setCertifications(data.certifications)
      setProgressToNext(data.progressToNext)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createCertification = async (category: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/academy/certifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create certification')
      }

      const newCertification = await response.json()
      
      // Refresh certifications
      await fetchCertifications()
      
      return newCertification
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getCertificationLevel = (coursesCompleted: number, averageScore: number, totalHours: number) => {
    if (coursesCompleted >= 10 && averageScore >= 90 && totalHours >= 80) {
      return 'PLATINUM'
    } else if (coursesCompleted >= 6 && averageScore >= 85 && totalHours >= 50) {
      return 'GOLD'
    } else if (coursesCompleted >= 3 && averageScore >= 80 && totalHours >= 25) {
      return 'SILVER'
    } else if (coursesCompleted >= 1 && averageScore >= 70 && totalHours >= 10) {
      return 'BRONZE'
    }
    return null
  }

  const getEligibleCategories = () => {
    return progressToNext.filter(p => p.eligible)
  }

  useEffect(() => {
    fetchCertifications()
  }, [])

  return {
    certifications,
    progressToNext,
    loading,
    error,
    createCertification,
    getCertificationLevel,
    getEligibleCategories,
    refreshCertifications: fetchCertifications
  }
}

export function useCertificationVerification(certificateNumber: string) {
  const [certification, setCertification] = useState<AcademyCertification | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verifyCertification = async () => {
    if (!certificateNumber) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/academy/certifications/verify?number=${certificateNumber}`)
      
      if (!response.ok) {
        throw new Error('Certification not found')
      }

      const data = await response.json()
      setCertification(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    verifyCertification()
  }, [certificateNumber])

  return {
    certification,
    loading,
    error,
    verifyCertification
  }
}
