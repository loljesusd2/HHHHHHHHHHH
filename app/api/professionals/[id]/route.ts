

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { Booking } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const professionalId = params.id

    if (!professionalId) {
      return NextResponse.json(
        { error: 'Professional ID is required' },
        { status: 400 }
      )
    }

    // Get professional profile with services
    const professional = await prisma.professionalProfile.findUnique({
      where: { id: professionalId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true
          }
        },
        services: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    // Get reviews separately
    const reviews = await prisma.review.findMany({
      where: { revieweeId: professional?.userId },
      include: {
        reviewer: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional not found' },
        { status: 404 }
      )
    }

    // Get upcoming bookings for availability
    const now = new Date()
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        professionalId: professional.id,
        scheduledDate: {
          gte: now
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      select: {
        scheduledDate: true,
        scheduledTime: true
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    }) as Pick<Booking, 'scheduledDate' | 'scheduledTime'>[]

    // Format response
    const response = {
      id: professional.id,
      user: professional.user,
      businessName: professional.businessName,
      bio: professional.bio,
      yearsExperience: professional.yearsExperience,
      certifications: professional.certifications,
      address: professional.address,
      city: professional.city,
      state: professional.state,
      zipCode: professional.zipCode,
      isVerified: professional.isVerified,
      services: professional.services,
      reviews: reviews,
      stats: {
        averageRating: professional.averageRating,
        totalReviews: professional.totalReviews
      },
      upcomingBookings: upcomingBookings.map((booking: typeof upcomingBookings[0]) => ({
        date: booking.scheduledDate.toISOString().split('T')[0],
        time: booking.scheduledTime
      }))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Get professional error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch professional' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (authUser.role !== 'PROFESSIONAL') {
      return NextResponse.json(
        { error: 'Only professionals can update profiles' },
        { status: 403 }
      )
    }

    const professionalId = params.id
    const body = await request.json()

    // Check if the professional belongs to the authenticated user
    const professional = await prisma.professionalProfile.findUnique({
      where: { id: professionalId }
    })

    if (!professional || professional.userId !== authUser.userId) {
      return NextResponse.json(
        { error: 'Not authorized to update this profile' },
        { status: 403 }
      )
    }

    // Update professional profile
    const updated = await prisma.professionalProfile.update({
      where: { id: professionalId },
      data: body,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        services: {
          where: { isActive: true }
        }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update professional error:', error)
    return NextResponse.json(
      { error: 'Failed to update professional profile' },
      { status: 500 }
    )
  }
}
