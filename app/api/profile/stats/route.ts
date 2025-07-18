

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { Booking } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let stats: any = {
      totalBookings: 0,
      completedBookings: 0,
      averageRating: 0,
      totalReviews: 0,
      totalEarnings: 0
    }

    if (authUser.role === 'CLIENT') {
      const bookings = await prisma.booking.findMany({
        where: { clientId: authUser.userId }
      }) as Booking[]
      
      stats.totalBookings = bookings.length
      stats.completedBookings = bookings.filter((b: Booking) => b.status === 'COMPLETED').length
    } else if (authUser.role === 'PROFESSIONAL') {
      const professional = await prisma.professionalProfile.findUnique({
        where: { userId: authUser.userId }
      })

      if (professional) {
        const bookings = await prisma.booking.findMany({
          where: { professionalId: professional.id }
        }) as Booking[]

        stats.totalBookings = bookings.length
        stats.completedBookings = bookings.filter((b: Booking) => b.status === 'COMPLETED').length
        stats.averageRating = professional?.averageRating || 0
        stats.totalReviews = professional?.totalReviews || 0
        stats.totalEarnings = professional?.totalEarnings || 0
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Profile stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile stats' },
      { status: 500 }
    )
  }
}
