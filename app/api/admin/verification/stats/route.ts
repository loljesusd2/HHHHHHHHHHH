
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

    const [total, pending, approved, rejected] = await Promise.all([
      prisma.verificationRequest.count(),
      prisma.verificationRequest.count({
        where: { status: 'PENDING' }
      }),
      prisma.verificationRequest.count({
        where: { status: 'APPROVED' }
      }),
      prisma.verificationRequest.count({
        where: { status: 'REJECTED' }
      })
    ])

    // Get document type distribution
    const documentTypes = await prisma.verificationRequest.groupBy({
      by: ['documentType'],
      _count: true
    })

    const byDocumentType = documentTypes.reduce((acc, item) => {
      acc[item.documentType] = item._count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      total,
      pending,
      approved,
      rejected,
      byDocumentType,
      recentActivity: [] // Could add recent activity here
    })
  } catch (error) {
    console.error('Error fetching verification stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
