
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const userId = params.id

    // Update user verification status
    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: 'APPROVED',
        verifiedAt: new Date()
      }
    })

    // Update professional profile if exists
    const professionalProfile = await prisma.professionalProfile.findUnique({
      where: { userId }
    })

    if (professionalProfile) {
      await prisma.professionalProfile.update({
        where: { userId },
        data: {
          isVerified: true
        }
      })
    }

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: (session.user as any).id,
        action: 'user_verified',
        entityType: 'user',
        entityId: userId,
        details: {
          verifiedAt: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error verifying user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
