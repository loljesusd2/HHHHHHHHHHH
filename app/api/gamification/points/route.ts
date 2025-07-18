
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { awardPoints, getUserPoints, getUserLevel } from '@/lib/gamification-utils'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET /api/gamification/points - Get user's gamification stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get total points
    const totalPoints = await getUserPoints(userId)
    
    // Get current level
    const currentLevel = await getUserLevel(userId)
    
    // Get next level info
    const nextLevelInfo = getNextLevelInfo(totalPoints)
    
    // Get user badges
    const badges = await prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' }
    })

    // Get recent activity
    const recentActivity = await prisma.beautyPoints.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get referral count
    const referralCount = await prisma.referral.count({
      where: { referrerId: userId }
    })

    // Get timeline entries count
    const timelineEntries = await prisma.beautyTimeline.count({
      where: { userId }
    })

    const stats = {
      totalPoints,
      currentLevel,
      nextLevel: nextLevelInfo.level,
      pointsToNextLevel: nextLevelInfo.pointsNeeded,
      badges,
      recentActivity,
      referralCount,
      timelineEntries
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error getting gamification stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/gamification/points - Award points to user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, points, description, bookingId } = await request.json()

    if (!action || !points || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await awardPoints(
      session.user.id,
      action,
      points,
      description,
      bookingId
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error awarding points:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getNextLevelInfo(currentPoints: number) {
  if (currentPoints < 200) {
    return { level: 'SILVER', pointsNeeded: 200 - currentPoints }
  } else if (currentPoints < 500) {
    return { level: 'GOLD', pointsNeeded: 500 - currentPoints }
  } else if (currentPoints < 1000) {
    return { level: 'PLATINUM', pointsNeeded: 1000 - currentPoints }
  } else {
    return { level: 'PLATINUM', pointsNeeded: 0 }
  }
}
