
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

    const users = await prisma.user.findMany({
      include: {
        professionalProfile: {
          select: {
            businessName: true,
            averageRating: true,
            totalEarnings: true,
            totalReviews: true,
            isVerified: true
          }
        },
        userBans: {
          where: { isActive: true },
          select: {
            reason: true,
            bannedAt: true,
            expiresAt: true
          }
        },
        _count: {
          select: {
            bookingsAsClient: true,
            bookingsAsProfessional: true,
            reviewsGiven: true,
            reviewsReceived: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const usersWithBanStatus = users.map(user => ({
      ...user,
      isBanned: user.userBans.length > 0,
      banReason: user.userBans[0]?.reason || null
    }))

    return NextResponse.json({ users: usersWithBanStatus })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
