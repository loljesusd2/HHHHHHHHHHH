
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { generateReferralCode, awardPoints } from '@/lib/gamification-utils'
import { POINT_VALUES } from '@/lib/types'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET /api/gamification/referrals - Get user's referral data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get or create referral code
    let userReferral = await prisma.referral.findFirst({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' }
    })

    if (!userReferral) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const referralCode = generateReferralCode(user.name)
      
      userReferral = await prisma.referral.create({
        data: {
          referrerId: userId,
          code: referralCode,
          status: 'pending'
        }
      })
    }

    // Get all referrals made by user
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stats
    const stats = {
      totalReferrals: referrals.length,
      completedReferrals: referrals.filter(r => r.status === 'completed').length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      totalRewardPoints: referrals.filter(r => r.status === 'completed' && r.rewardClaimed).length * POINT_VALUES.REFERRAL_SUCCESSFUL,
      unclaimedRewards: referrals.filter(r => r.status === 'completed' && !r.rewardClaimed).length
    }

    // Calculate progress to next milestone
    const nextMilestone = getNextMilestone(stats.completedReferrals)

    return NextResponse.json({
      code: userReferral.code,
      stats,
      nextMilestone,
      referrals: referrals.map(r => ({
        id: r.id,
        status: r.status,
        rewardClaimed: r.rewardClaimed,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
        referred: r.referred
      }))
    })
  } catch (error) {
    console.error('Error getting referral data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/gamification/referrals - Process referral completion
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code, action } = await request.json()

    if (action === 'use_code') {
      // User is using someone else's referral code
      const referral = await prisma.referral.findFirst({
        where: { code, status: 'pending' }
      })

      if (!referral) {
        return NextResponse.json({ error: 'Invalid or expired referral code' }, { status: 400 })
      }

      // Update referral
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          referredId: session.user.id,
          status: 'completed',
          completedAt: new Date()
        }
      })

      // Award points to referrer
      await awardPoints(
        referral.referrerId,
        'referral',
        POINT_VALUES.REFERRAL_SUCCESSFUL,
        'Successful referral',
        undefined
      )

      // Award points to new user
      await awardPoints(
        session.user.id,
        'first_time',
        POINT_VALUES.FIRST_TIME_USER,
        'Welcome bonus',
        undefined
      )

      return NextResponse.json({ success: true })
    } else if (action === 'claim_reward') {
      // User is claiming rewards for completed referrals
      const unclaimedReferrals = await prisma.referral.findMany({
        where: {
          referrerId: session.user.id,
          status: 'completed',
          rewardClaimed: false
        }
      })

      if (unclaimedReferrals.length === 0) {
        return NextResponse.json({ error: 'No rewards to claim' }, { status: 400 })
      }

      // Mark rewards as claimed
      await prisma.referral.updateMany({
        where: {
          referrerId: session.user.id,
          status: 'completed',
          rewardClaimed: false
        },
        data: {
          rewardClaimed: true
        }
      })

      return NextResponse.json({ 
        success: true, 
        rewardsClaimed: unclaimedReferrals.length,
        pointsAwarded: unclaimedReferrals.length * POINT_VALUES.REFERRAL_SUCCESSFUL
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing referral:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getNextMilestone(completedReferrals: number) {
  const milestones = [1, 3, 5, 10, 25, 50]
  const nextMilestone = milestones.find(m => m > completedReferrals)
  
  if (!nextMilestone) {
    return { count: 50, progress: 100, reward: 'Referral Master Badge' }
  }
  
  const progress = Math.round((completedReferrals / nextMilestone) * 100)
  const rewards = {
    1: 'First Referral Badge',
    3: 'Referral Enthusiast Badge',
    5: 'Referral Champion Badge',
    10: 'Referral Expert Badge',
    25: 'Referral Master Badge',
    50: 'Referral Legend Badge'
  }
  
  return {
    count: nextMilestone,
    progress,
    reward: rewards[nextMilestone as keyof typeof rewards]
  }
}
