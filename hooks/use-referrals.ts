
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Referral } from '@/lib/types'

export interface ReferralStats {
  totalReferrals: number
  completedReferrals: number
  pendingReferrals: number
  totalRewardPoints: number
  unclaimedRewards: number
}

export interface ReferralMilestone {
  count: number
  progress: number
  reward: string
}

export interface UseReferralsReturn {
  code: string | null
  stats: ReferralStats | null
  nextMilestone: ReferralMilestone | null
  referrals: Referral[]
  loading: boolean
  error: string | null
  refetch: () => void
  useReferralCode: (code: string) => Promise<void>
  claimRewards: () => Promise<{ rewardsClaimed: number; pointsAwarded: number }>
}

export function useReferrals(): UseReferralsReturn {
  const { data: session } = useSession()
  const [code, setCode] = useState<string | null>(null)
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [nextMilestone, setNextMilestone] = useState<ReferralMilestone | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReferralData = async () => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/gamification/referrals')
      if (!response.ok) {
        throw new Error('Failed to fetch referral data')
      }
      
      const data = await response.json()
      setCode(data.code)
      setStats(data.stats)
      setNextMilestone(data.nextMilestone)
      setReferrals(data.referrals)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const useReferralCode = async (referralCode: string) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      const response = await fetch('/api/gamification/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: referralCode,
          action: 'use_code'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to use referral code')
      }

      // Refetch data after using code
      await fetchReferralData()
    } catch (err) {
      throw err
    }
  }

  const claimRewards = async () => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      const response = await fetch('/api/gamification/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'claim_reward'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to claim rewards')
      }

      const data = await response.json()
      
      // Refetch data after claiming rewards
      await fetchReferralData()
      
      return {
        rewardsClaimed: data.rewardsClaimed,
        pointsAwarded: data.pointsAwarded
      }
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchReferralData()
  }, [session])

  return {
    code,
    stats,
    nextMilestone,
    referrals,
    loading,
    error,
    refetch: fetchReferralData,
    useReferralCode,
    claimRewards
  }
}
