
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Mock data for client dashboard
    const upcomingBookings: any[] = []
    const favorites: any[] = []
    const featuredServices: any[] = []
    const nearbyProfessionals: any[] = []

    return NextResponse.json({
      upcomingBookings,
      favorites,
      featuredServices,
      nearbyProfessionals
    })

  } catch (error) {
    console.error('Error fetching client dashboard data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
