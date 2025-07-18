
import { PrismaClient } from '@prisma/client'
import { POINT_VALUES, BADGE_LEVELS, BADGE_TYPES } from './types'

const prisma = new PrismaClient()

// Award points to user
export async function awardPoints(
  userId: string,
  action: string,
  points: number,
  description: string,
  bookingId?: string
) {
  try {
    // Create points record
    await prisma.beautyPoints.create({
      data: {
        userId,
        action,
        points,
        description,
        bookingId
      }
    })

    // Check and update badges
    await checkAndUpdateBadges(userId)

    return { success: true }
  } catch (error) {
    console.error('Error awarding points:', error)
    return { success: false, error: 'Failed to award points' }
  }
}

// Get user's total points
export async function getUserPoints(userId: string) {
  try {
    const result = await prisma.beautyPoints.aggregate({
      where: { userId },
      _sum: { points: true }
    })
    return result._sum.points || 0
  } catch (error) {
    console.error('Error getting user points:', error)
    return 0
  }
}

// Get user's current level based on points
export async function getUserLevel(userId: string) {
  const totalPoints = await getUserPoints(userId)
  
  if (totalPoints >= BADGE_LEVELS.PLATINUM.min) return 'PLATINUM'
  if (totalPoints >= BADGE_LEVELS.GOLD.min) return 'GOLD'
  if (totalPoints >= BADGE_LEVELS.SILVER.min) return 'SILVER'
  return 'BRONZE'
}

// Check and update user badges
export async function checkAndUpdateBadges(userId: string) {
  try {
    const totalPoints = await getUserPoints(userId)
    const currentLevel = await getUserLevel(userId)
    
    // Check if user already has this level badge
    const existingBadge = await prisma.userBadge.findFirst({
      where: {
        userId,
        badgeType: BADGE_TYPES.LEVEL,
        level: currentLevel
      }
    })

    // Award level badge if not exists
    if (!existingBadge) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeType: BADGE_TYPES.LEVEL,
          level: currentLevel
        }
      })
    }

    // Check for special badges
    await checkSpecialBadges(userId)

    return { success: true }
  } catch (error) {
    console.error('Error checking badges:', error)
    return { success: false }
  }
}

// Check for special badges
async function checkSpecialBadges(userId: string) {
  try {
    // Check referral champion badge (5+ successful referrals)
    const referralCount = await prisma.referral.count({
      where: { referrerId: userId, status: 'completed' }
    })
    
    if (referralCount >= 5) {
      const existingBadge = await prisma.userBadge.findFirst({
        where: { userId, badgeType: BADGE_TYPES.REFERRAL_CHAMPION }
      })
      
      if (!existingBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeType: BADGE_TYPES.REFERRAL_CHAMPION,
            level: 'SPECIAL'
          }
        })
      }
    }

    // Check review master badge (10+ reviews written)
    const reviewCount = await prisma.review.count({
      where: { reviewerId: userId }
    })
    
    if (reviewCount >= 10) {
      const existingBadge = await prisma.userBadge.findFirst({
        where: { userId, badgeType: BADGE_TYPES.REVIEW_MASTER }
      })
      
      if (!existingBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeType: BADGE_TYPES.REVIEW_MASTER,
            level: 'SPECIAL'
          }
        })
      }
    }

    // Check social butterfly badge (5+ social shares)
    const shareCount = await prisma.beautyPoints.count({
      where: { userId, action: 'social_share' }
    })
    
    if (shareCount >= 5) {
      const existingBadge = await prisma.userBadge.findFirst({
        where: { userId, badgeType: BADGE_TYPES.SOCIAL_BUTTERFLY }
      })
      
      if (!existingBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeType: BADGE_TYPES.SOCIAL_BUTTERFLY,
            level: 'SPECIAL'
          }
        })
      }
    }

  } catch (error) {
    console.error('Error checking special badges:', error)
  }
}

// Generate unique referral code
export function generateReferralCode(userName: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  const namePrefix = userName.substring(0, 3).toUpperCase()
  return `${namePrefix}${randomSuffix}`
}

// Create flash deal
export async function createFlashDeal(
  serviceId: string,
  discount: number,
  durationHours: number,
  neighborhood: string,
  maxUses: number = 10
) {
  try {
    const startTime = new Date()
    const endTime = new Date()
    endTime.setHours(startTime.getHours() + durationHours)

    const flashDeal = await prisma.flashDeal.create({
      data: {
        serviceId,
        discount,
        startTime,
        endTime,
        neighborhood,
        maxUses,
        currentUses: 0
      }
    })

    return { success: true, flashDeal }
  } catch (error) {
    console.error('Error creating flash deal:', error)
    return { success: false, error: 'Failed to create flash deal' }
  }
}

// Get active flash deals
export async function getActiveFlashDeals(neighborhood?: string) {
  try {
    const now = new Date()
    
    const deals = await prisma.flashDeal.findMany({
      where: {
        isActive: true,
        startTime: { lte: now },
        endTime: { gte: now },
        currentUses: { lt: prisma.flashDeal.fields.maxUses },
        ...(neighborhood && { neighborhood })
      },
      include: {
        service: {
          include: {
            professional: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return deals
  } catch (error) {
    console.error('Error getting flash deals:', error)
    return []
  }
}

// Use flash deal
export async function useFlashDeal(dealId: string) {
  try {
    const deal = await prisma.flashDeal.findUnique({
      where: { id: dealId }
    })

    if (!deal || !deal.isActive || deal.currentUses >= deal.maxUses) {
      return { success: false, error: 'Deal not available' }
    }

    const now = new Date()
    if (now > deal.endTime) {
      return { success: false, error: 'Deal expired' }
    }

    await prisma.flashDeal.update({
      where: { id: dealId },
      data: {
        currentUses: deal.currentUses + 1
      }
    })

    return { success: true, discount: deal.discount }
  } catch (error) {
    console.error('Error using flash deal:', error)
    return { success: false, error: 'Failed to use deal' }
  }
}
