
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { parseFormData, uploadFile } from '@/lib/upload'

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { files, fields } = await parseFormData(request)
    const { documentType } = fields

    if (!documentType || files.length === 0) {
      return NextResponse.json(
        { error: 'Document type and file are required' },
        { status: 400 }
      )
    }

    const file = files[0]
    
    // Upload file
    const documentUrl = await uploadFile(file, 'verification')

    // Create verification request
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        userId: authUser.userId,
        documentType,
        documentUrl,
        documentName: file.name,
        status: 'PENDING'
      }
    })

    // Update user verification status to pending if not already verified
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId }
    })

    if (user?.verificationStatus === 'UNVERIFIED') {
      await prisma.user.update({
        where: { id: authUser.userId },
        data: { verificationStatus: 'PENDING' }
      })
    }

    // Notify admins
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    })

    for (const admin of adminUsers) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'New Verification Request',
          message: `${user?.name} has submitted a ${documentType} for verification`,
          type: 'GENERAL',
          data: {
            verificationRequestId: verificationRequest.id,
            userId: authUser.userId,
            documentType
          }
        }
      })
    }

    return NextResponse.json({
      message: 'Document uploaded successfully',
      verificationRequest
    })

  } catch (error) {
    console.error('Verification upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
