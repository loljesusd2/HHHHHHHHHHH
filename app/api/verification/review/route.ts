
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { verificationRequestId, status, adminNotes } = await request.json()

    if (!verificationRequestId || !status) {
      return NextResponse.json(
        { error: 'Verification request ID and status are required' },
        { status: 400 }
      )
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be APPROVED or REJECTED' },
        { status: 400 }
      )
    }

    // Get verification request
    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id: verificationRequestId },
      include: { user: true }
    })

    if (!verificationRequest) {
      return NextResponse.json(
        { error: 'Verification request not found' },
        { status: 404 }
      )
    }

    // Update verification request
    const updatedRequest = await prisma.verificationRequest.update({
      where: { id: verificationRequestId },
      data: {
        status,
        adminNotes,
        reviewedBy: authUser.userId,
        reviewedAt: new Date()
      }
    })

    // Update user verification status
    let userVerificationStatus = 'PENDING'
    
    if (status === 'APPROVED') {
      // Check if user has any other pending requests
      const pendingRequests = await prisma.verificationRequest.count({
        where: {
          userId: verificationRequest.userId,
          status: 'PENDING',
          id: { not: verificationRequestId }
        }
      })

      if (pendingRequests === 0) {
        userVerificationStatus = 'APPROVED'
      }
    } else if (status === 'REJECTED') {
      // Check if user has any approved requests
      const approvedRequests = await prisma.verificationRequest.count({
        where: {
          userId: verificationRequest.userId,
          status: 'APPROVED'
        }
      })

      if (approvedRequests === 0) {
        userVerificationStatus = 'REJECTED'
      }
    }

    // Update user
    await prisma.user.update({
      where: { id: verificationRequest.userId },
      data: {
        verificationStatus: userVerificationStatus as any,
        verificationNotes: adminNotes,
        verifiedAt: status === 'APPROVED' ? new Date() : null
      }
    })

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: verificationRequest.userId,
        title: status === 'APPROVED' ? 'Verification Approved' : 'Verification Rejected',
        message: status === 'APPROVED' 
          ? 'Your verification has been approved! You now have a verified badge.'
          : `Your verification was rejected. ${adminNotes || 'Please contact support for more information.'}`,
        type: status === 'APPROVED' ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED'
      }
    })

    return NextResponse.json({
      message: `Verification ${status.toLowerCase()} successfully`,
      verificationRequest: updatedRequest
    })

  } catch (error) {
    console.error('Verification review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
