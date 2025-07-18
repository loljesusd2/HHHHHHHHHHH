
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let whereClause: any = {}

    if (authUser.role === 'ADMIN') {
      // Admins can see all requests
      if (status) {
        whereClause.status = status
      }
    } else {
      // Users can only see their own requests
      whereClause.userId = authUser.userId
      if (status) {
        whereClause.status = status
      }
    }

    const verificationRequests = await prisma.verificationRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            verificationStatus: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(verificationRequests)

  } catch (error) {
    console.error('Verification requests fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
