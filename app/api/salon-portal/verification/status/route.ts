
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's salon
    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Get verification requests/documents
    const verificationRequests = await prisma.verificationRequest.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Group documents by type
    const documents = verificationRequests.map(req => ({
      id: req.id,
      type: req.documentType,
      fileName: req.documentName,
      status: req.status,
      uploadedAt: req.createdAt,
      reviewedAt: req.reviewedAt,
      notes: req.adminNotes
    }))

    const verificationStatus = {
      status: salon.isVerified ? 'APPROVED' : 'PENDING',
      isVerified: salon.isVerified,
      verifiedAt: salon.verifiedAt,
      documents
    }

    return NextResponse.json(verificationStatus)
  } catch (error) {
    console.error('Verification status API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
