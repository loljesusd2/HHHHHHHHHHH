
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

    const [total, unread, pending, resolved] = await Promise.all([
      prisma.adminMessage.count(),
      prisma.adminMessage.count({
        where: { status: 'unread' }
      }),
      prisma.adminMessage.count({
        where: { status: { in: ['unread', 'read'] } }
      }),
      prisma.adminMessage.count({
        where: { status: 'resolved' }
      })
    ])

    const [support, verification, report, contact] = await Promise.all([
      prisma.adminMessage.count({ where: { type: 'support' } }),
      prisma.adminMessage.count({ where: { type: 'verification' } }),
      prisma.adminMessage.count({ where: { type: 'report' } }),
      prisma.adminMessage.count({ where: { type: 'contact' } })
    ])

    const [low, normal, high, urgent] = await Promise.all([
      prisma.adminMessage.count({ where: { priority: 'low' } }),
      prisma.adminMessage.count({ where: { priority: 'normal' } }),
      prisma.adminMessage.count({ where: { priority: 'high' } }),
      prisma.adminMessage.count({ where: { priority: 'urgent' } })
    ])

    return NextResponse.json({
      total,
      unread,
      pending,
      resolved,
      byType: {
        support,
        verification,
        report,
        contact
      },
      byPriority: {
        low,
        normal,
        high,
        urgent
      }
    })
  } catch (error) {
    console.error('Error fetching message stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
