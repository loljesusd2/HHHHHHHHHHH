
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    let dateFilter = {}
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0)
      dateFilter = {
        scheduledDate: {
          gte: startDate,
          lte: endDate
        }
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: { professionalProfile: true }
    })

    let bookings
    if (user?.role === 'PROFESSIONAL') {
      bookings = await prisma.booking.findMany({
        where: {
          professionalId: authUser.userId,
          ...dateFilter
        },
        include: {
          client: true,
          service: true,
          payment: true
        },
        orderBy: { scheduledDate: 'asc' }
      })
    } else {
      bookings = await prisma.booking.findMany({
        where: {
          clientId: authUser.userId,
          ...dateFilter
        },
        include: {
          professional: {
            include: {
              professionalProfile: true
            }
          },
          service: true,
          payment: true
        },
        orderBy: { scheduledDate: 'asc' }
      })
    }

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Calendar fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
