export const dynamic = 'force-dynamic'

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
        { error: 'Only professionals can access earnings' },
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

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const period = searchParams.get('period') || 'month' // month, week, year

    // Build date filter
    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    } else {
      // Default to current month
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      dateFilter = {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    }

    // Get completed bookings with payments
    const completedBookings = await prisma.booking.findMany({
      where: {
        professionalId: authUser.userId, // Corregido: usar userId directamente
        status: 'COMPLETED',
        ...dateFilter
      },
      include: {
        payment: true,
        service: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            avatar: true
          }
        }
      }
    }) as any[]

    // Calculate earnings
    const totalEarnings = completedBookings.reduce((sum: number, booking: typeof completedBookings[0]) => {
      return sum + (booking.payment?.professionalAmount || 0)
    }, 0)

    const totalBookings = completedBookings.length
    const averageBookingValue = totalBookings > 0 ? totalEarnings / totalBookings : 0

    // Group by service for breakdown
    const serviceBreakdown = completedBookings.reduce((acc: Record<string, { count: number; earnings: number }>, booking: typeof completedBookings[0]) => {
      const serviceName = booking.service.name
      if (!acc[serviceName]) {
        acc[serviceName] = {
          count: 0,
          earnings: 0
        }
      }
      acc[serviceName].count++
      acc[serviceName].earnings += booking.payment?.professionalAmount || 0
      return acc
    }, {})

    // Group by date for chart data
    const dailyEarnings = completedBookings.reduce((acc: Record<string, number>, booking: typeof completedBookings[0]) => {
      const date = booking.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = 0
      }
      acc[date] += booking.payment?.professionalAmount || 0
      return acc
    }, {})

    // Convert to chart format
    const chartData = Object.entries(dailyEarnings).map(([date, earnings]) => ({
      date,
      earnings
    })).sort((a, b) => a.date.localeCompare(b.date))

    // Convert serviceBreakdown to array format expected by frontend
    const serviceBreakdownArray = Object.entries(serviceBreakdown).map(([name, data]: [string, { count: number; earnings: number }]) => ({
      name,
      count: data.count,
      earnings: data.earnings
    }))

    const earningsData = {
      totalEarnings,
      totalBookings,
      averageBookingValue,
      serviceBreakdown: serviceBreakdownArray,
      chartData,
      recentBookings: completedBookings.map(booking => ({
        id: booking.id,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
        totalAmount: booking.totalAmount,
        service: {
          name: booking.service.name,
          duration: booking.service.duration
        },
        client: {
          name: booking.client.name,
          avatar: booking.client.avatar
        },
        payment: {
          professionalAmount: booking.payment?.professionalAmount || 0,
          status: booking.payment?.status || 'PENDING'
        }
      }))
    }

    return NextResponse.json(earningsData)
  } catch (error) {
    console.error('Earnings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings data' },
      { status: 500 }
    )
  }
}
