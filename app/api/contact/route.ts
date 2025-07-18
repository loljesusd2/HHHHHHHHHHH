

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // For now, just create a notification for admins instead of a separate contact submission
    // Get all admin users for notifications
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      }
    })

    // Create notifications for all admin users
    const notifications = adminUsers.map((admin) => ({
      userId: admin.id,
      title: `New Contact Form Submission`,
      message: `${name} (${email}) sent a message: ${subject} - ${message}`,
      type: 'GENERAL' as const,
      isRead: false
    }))

    // Create notifications in batch
    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications
      })
    }

    return NextResponse.json({
      message: 'Contact form submitted successfully'
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Return general notifications instead since there's no contactSubmission table
    const notifications = await prisma.notification.findMany({
      where: {
        type: 'GENERAL'
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({
      submissions: notifications
    })
  } catch (error) {
    console.error('Get contact submissions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact submissions' },
      { status: 500 }
    )
  }
}
