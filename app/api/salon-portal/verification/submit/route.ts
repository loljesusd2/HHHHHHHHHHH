
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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

    // Check if all required documents are uploaded
    const requiredDocuments = ['business_license', 'insurance', 'tax_id', 'professional_license']
    const uploadedDocuments = await prisma.verificationRequest.findMany({
      where: {
        userId: session.user.id,
        documentType: {
          in: requiredDocuments
        }
      }
    })

    if (uploadedDocuments.length < requiredDocuments.length) {
      return NextResponse.json({ 
        error: 'Please upload all required documents before submitting' 
      }, { status: 400 })
    }

    // Create notification for admin review
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'VERIFICATION_APPROVED', // This will be updated by admin
        title: 'Verification Submitted',
        message: `Salon "${salon.name}" has submitted verification documents for review.`
      }
    })

    // Update salon verification status to pending
    await prisma.salon.update({
      where: {
        id: salon.id
      },
      data: {
        // Keep isVerified as false until admin approves
        // In a real system, you might have a separate 'verificationStatus' field
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Verification submitted successfully. You will be notified once the review is complete.'
    })
  } catch (error) {
    console.error('Verification submit API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
