
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

    // Deactivate all active bans for this user
    await prisma.userBan.updateMany({
      where: {
        userId,
        isActive: true
      },
      data: {
        isActive: false
      }
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: (session.user as any).id,
        action: 'user_unban',
        entityType: 'user',
        entityId: userId,
        details: {
          unbannedAt: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unbanning user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
