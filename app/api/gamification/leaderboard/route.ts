
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET /api/gamification/leaderboard - Get leaderboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // 'all', 'professionals', 'clients'
    const period = searchParams.get('period') || 'all' // 'all', 'weekly', 'monthly'
    const neighborhood = searchParams.get('neighborhood')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Calculate date range based on period
    let dateFilter = {}
    if (period === 'weekly') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      dateFilter = { createdAt: { gte: weekAgo } }
    } else if (period === 'monthly') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      dateFilter = { createdAt: { gte: monthAgo } }
    }

    // Get points aggregation
    const pointsAggregation = await prisma.beautyPoints.groupBy({
      by: ['userId'],
      where: dateFilter,
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: limit
    })

    // Get user details and build leaderboard
    const leaderboard = await Promise.all(
      pointsAggregation.map(async (entry, index) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
          include: {
            professionalProfile: {
              include: {
                user: true
              }
            },
            userBadges: {
              orderBy: { earnedAt: 'desc' }
            }
          }
        })

        if (!user) return null

        // Filter by type
        if (type === 'professionals' && user.role !== 'PROFESSIONAL') return null
        if (type === 'clients' && user.role !== 'CLIENT') return null

        // Filter by neighborhood for professionals
        if (neighborhood && user.professionalProfile) {
          const professionalLocation = user.professionalProfile.city?.toLowerCase()
          if (professionalLocation !== neighborhood.toLowerCase()) return null
        }

        // Get weekly and monthly points
        const weeklyPoints = await getPointsForPeriod(entry.userId, 'weekly')
        const monthlyPoints = await getPointsForPeriod(entry.userId, 'monthly')

        return {
          userId: entry.userId,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role
          },
          professional: user.professionalProfile ? {
            businessName: user.professionalProfile.businessName,
            averageRating: user.professionalProfile.averageRating,
            totalReviews: user.professionalProfile.totalReviews,
            city: user.professionalProfile.city
          } : undefined,
          totalPoints: entry._sum.points || 0,
          weeklyPoints,
          monthlyPoints,
          rank: index + 1,
          badges: user.userBadges
        }
      })
    )

    // Filter out null entries
    const filteredLeaderboard = leaderboard.filter(entry => entry !== null)

    return NextResponse.json(filteredLeaderboard)
  } catch (error) {
    console.error('Error getting leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getPointsForPeriod(userId: string, period: 'weekly' | 'monthly') {
  const now = new Date()
  let startDate = new Date()
  
  if (period === 'weekly') {
    startDate.setDate(now.getDate() - 7)
  } else if (period === 'monthly') {
    startDate.setMonth(now.getMonth() - 1)
  }

  const result = await prisma.beautyPoints.aggregate({
    where: {
      userId,
      createdAt: { gte: startDate }
    },
    _sum: { points: true }
  })

  return result._sum.points || 0
}
