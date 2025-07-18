
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Mock professional data
    const professional = {
      id: 'mock-id',
      businessName: 'Bella Beauty Studio',
      totalEarnings: 5000,
      averageRating: 4.8,
      totalReviews: 15,
      isVerified: true,
      user: {
        name: 'Isabella Rodriguez'
      }
    }

    // Mock data for professional dashboard
    const todaysBookings: any[] = []
    const monthlyEarnings = 1250
    const recentBookings: any[] = []
    const recentReviews: any[] = []
    const monthlyStats: any[] = []
    const stripeConnected = false

    return NextResponse.json({
      professional,
      todaysBookings,
      monthlyEarnings,
      recentBookings,
      recentReviews,
      monthlyStats,
      stripeConnected,
      metrics: {
        totalBookingsToday: 0,
        totalEarnings: professional.totalEarnings,
        averageRating: professional.averageRating,
        totalReviews: professional.totalReviews
      }
    })

  } catch (error) {
    console.error('Error fetching professional dashboard data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
