
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

    const { reason, duration } = await request.json()
    const userId = params.id

    let expiresAt: Date | null = null
    if (duration !== 'permanent') {
      const now = new Date()
      switch (duration) {
        case '1day':
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
          break
        case '1week':
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          break
        case '1month':
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          break
        case '3months':
          expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
          break
      }
    }

    // Create ban record
    await prisma.userBan.create({
      data: {
        userId,
        reason,
        bannedBy: (session.user as any).id,
        expiresAt,
        isActive: true
      }
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: (session.user as any).id,
        action: 'user_ban',
        entityType: 'user',
        entityId: userId,
        details: {
          reason,
          duration,
          expiresAt: expiresAt?.toISOString()
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error banning user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
