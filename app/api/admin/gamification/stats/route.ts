
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const [totalPointsAwarded, totalRewardsRedeemed, totalBadgesEarned, totalReferrals, activeUsers] = await Promise.all([
      prisma.beautyPoints.aggregate({
        _sum: {
          points: true
        }
      }),
      prisma.userReward.count({
        where: {
          status: 'redeemed'
        }
      }),
      prisma.userBadge.count(),
      prisma.referral.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ])

    // Top users by points
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        beautyPoints: {
          select: {
            points: true
          }
        },
        userBadges: {
          select: {
            level: true
          }
        }
      },
      orderBy: {
        beautyPoints: {
          _count: 'desc'
        }
      },
      take: 10
    })

    const topUsersWithStats = topUsers.map(user => ({
      userId: user.id,
      user: { name: user.name },
      totalPoints: user.beautyPoints.reduce((sum, bp) => sum + bp.points, 0),
      weeklyPoints: user.beautyPoints.reduce((sum, bp) => sum + bp.points, 0), // Simplified for demo
      monthlyPoints: user.beautyPoints.reduce((sum, bp) => sum + bp.points, 0), // Simplified for demo
      rank: 1,
      badges: user.userBadges.length,
      level: user.userBadges[0]?.level || 'BRONZE'
    }))

    return NextResponse.json({
      totalPointsAwarded: totalPointsAwarded._sum.points || 0,
      totalRewardsRedeemed,
      totalBadgesEarned,
      totalReferrals,
      activeUsers,
      topUsers: topUsersWithStats,
      pointsDistribution: [
        { action: 'Booking Completed', totalPoints: 2500, count: 50 },
        { action: 'Review Written', totalPoints: 1250, count: 50 },
        { action: 'Referral Successful', totalPoints: 1000, count: 10 }
      ],
      rewardStats: [
        { rewardName: 'Descuento 20%', redemptions: 25, pointsSpent: 2500 },
        { rewardName: 'Servicio Gratis', redemptions: 10, pointsSpent: 5000 }
      ]
    })
  } catch (error) {
    console.error('Error fetching gamification stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
