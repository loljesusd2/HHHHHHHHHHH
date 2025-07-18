
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { checkAndUpdateBadges } from '@/lib/gamification-utils'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET /api/gamification/badges - Get user's badges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const targetUserId = userId || session.user.id

    // Get user badges
    const badges = await prisma.userBadge.findMany({
      where: { userId: targetUserId },
      orderBy: { earnedAt: 'desc' }
    })

    // Get badge definitions and descriptions
    const badgeDefinitions = {
      bronze: {
        name: 'Bronze Beauty',
        description: 'Reached Bronze level (0-199 points)',
        icon: '🥉',
        color: '#CD7F32'
      },
      silver: {
        name: 'Silver Star',
        description: 'Reached Silver level (200-499 points)',
        icon: '🥈',
        color: '#C0C0C0'
      },
      gold: {
        name: 'Gold Goddess',
        description: 'Reached Gold level (500-999 points)',
        icon: '🥇',
        color: '#FFD700'
      },
      platinum: {
        name: 'Platinum Pro',
        description: 'Reached Platinum level (1000+ points)',
        icon: '💎',
        color: '#E5E4E2'
      },
      trendsetter: {
        name: 'Trendsetter',
        description: 'Always ahead of beauty trends',
        icon: '🌟',
        color: '#FF69B4'
      },
      loyal_client: {
        name: 'Loyal Client',
        description: 'Consistent beauty enthusiast',
        icon: '💖',
        color: '#9370DB'
      },
      social_butterfly: {
        name: 'Social Butterfly',
        description: 'Shared 5+ beauty transformations',
        icon: '🦋',
        color: '#FF6347'
      },
      referral_champion: {
        name: 'Referral Champion',
        description: 'Referred 5+ friends to Beauty GO',
        icon: '🏆',
        color: '#32CD32'
      },
      review_master: {
        name: 'Review Master',
        description: 'Written 10+ helpful reviews',
        icon: '⭐',
        color: '#FFA500'
      },
      early_adopter: {
        name: 'Early Adopter',
        description: 'Among the first to join Beauty GO',
        icon: '🚀',
        color: '#1E90FF'
      }
    }

    // Enrich badges with definitions
    const enrichedBadges = badges.map(badge => ({
      ...badge,
      ...badgeDefinitions[badge.badgeType as keyof typeof badgeDefinitions],
      isNew: (new Date().getTime() - badge.earnedAt.getTime()) < (24 * 60 * 60 * 1000) // New if earned within 24 hours
    }))

    // Get available badges (not yet earned)
    const earnedBadgeTypes = badges.map(b => b.badgeType)
    const availableBadgesEntries = Object.entries(badgeDefinitions)
      .filter(([type]) => !earnedBadgeTypes.includes(type))
    
    const availableBadges = await Promise.all(
      availableBadgesEntries.map(async ([type, definition]) => ({
        badgeType: type,
        ...definition,
        earned: false,
        progress: await getBadgeProgress(targetUserId, type)
      }))
    )

    return NextResponse.json({
      earned: enrichedBadges,
      available: availableBadges,
      total: enrichedBadges.length,
      recentlyEarned: enrichedBadges.filter(b => b.isNew)
    })
  } catch (error) {
    console.error('Error getting badges:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/gamification/badges - Check and update user badges
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await checkAndUpdateBadges(session.user.id)

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to update badges' }, { status: 500 })
    }

    // Get updated badges
    const badges = await prisma.userBadge.findMany({
      where: { userId: session.user.id },
      orderBy: { earnedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      badges,
      newBadges: badges.filter(b => 
        (new Date().getTime() - b.earnedAt.getTime()) < (5 * 60 * 1000) // New if earned within 5 minutes
      )
    })
  } catch (error) {
    console.error('Error updating badges:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getBadgeProgress(userId: string, badgeType: string): Promise<number> {
  try {
    switch (badgeType) {
      case 'referral_champion':
        const referralCount = await prisma.referral.count({
          where: { referrerId: userId, status: 'completed' }
        })
        return Math.min(100, (referralCount / 5) * 100)

      case 'review_master':
        const reviewCount = await prisma.review.count({
          where: { reviewerId: userId }
        })
        return Math.min(100, (reviewCount / 10) * 100)

      case 'social_butterfly':
        const shareCount = await prisma.beautyPoints.count({
          where: { userId, action: 'social_share' }
        })
        return Math.min(100, (shareCount / 5) * 100)

      case 'loyal_client':
        const bookingCount = await prisma.booking.count({
          where: { clientId: userId, status: 'COMPLETED' }
        })
        return Math.min(100, (bookingCount / 10) * 100)

      case 'trendsetter':
        const trendingServicesCount = await prisma.booking.count({
          where: { 
            clientId: userId, 
            status: 'COMPLETED',
            service: {
              category: { in: ['MAKEUP', 'HAIR_STYLING'] }
            }
          }
        })
        return Math.min(100, (trendingServicesCount / 5) * 100)

      default:
        return 0
    }
  } catch (error) {
    console.error('Error calculating badge progress:', error)
    return 0
  }
}
