

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

    if (authUser.role !== 'PROFESSIONAL') {
      return NextResponse.json(
        { error: 'Only professionals can access dashboard stats' },
        { status: 403 }
      )
    }

    // Get professional profile
    const professional = await prisma.professionalProfile.findUnique({
      where: { userId: authUser.userId }
    })

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional profile not found' },
        { status: 404 }
      )
    }

    // Get bookings for this professional
    const bookings = await prisma.booking.findMany({
      where: { professionalId: authUser.userId }, // Corregido: usar userId directamente
      include: {
        payment: true,
        service: true
      }
    }) as (Booking & { payment?: any; service: any })[]

    // Calculate total earnings from completed bookings only
    const completedBookings = bookings.filter((b: typeof bookings[0]) => b.status === 'COMPLETED')
    const totalEarnings = completedBookings.reduce((total: number, booking: typeof bookings[0]) => {
      return total + (booking.payment?.professionalAmount || 0)
    }, 0)

    // Calculate monthly stats (only completed bookings)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyCompletedBookings = completedBookings.filter((booking: typeof bookings[0]) => {
      const bookingDate = new Date(booking.scheduledDate)
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
    })

    const monthlyEarnings = monthlyCompletedBookings.reduce((total: number, booking: typeof bookings[0]) => {
      return total + (booking.payment?.professionalAmount || 0)
    }, 0)

    const pendingBookings = bookings.filter((b: typeof bookings[0]) => b.status === 'PENDING').length

    const stats = {
      totalEarnings, // Calculado dinámicamente desde bookings completados
      monthlyEarnings,
      totalBookings: bookings.length,
      monthlyBookings: monthlyCompletedBookings.length,
      pendingBookings,
      averageRating: professional.averageRating,
      totalReviews: professional.totalReviews
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
