
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's salon
    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id
      },
      include: {
        professionals: {
          include: {
            user: true,
            professional: true
          }
        },
        analytics: {
          orderBy: {
            date: 'desc'
          },
          take: 30
        }
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Calculate stats
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentBookings = await prisma.booking.findMany({
      where: {
        professionalId: {
          in: salon.professionals.map(p => p.userId)
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        service: true,
        payment: true,
        professional: {
          include: {
            professionalProfile: true
          }
        }
      }
    })

    const totalRevenue = recentBookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, booking) => sum + (booking.payment?.amount || 0), 0)

    const totalBookings = recentBookings.length

    const averageRating = salon.professionals.reduce((sum, p) => 
      sum + (p.professional?.averageRating || 0), 0) / salon.professionals.length

    // Generate revenue chart data
    const revenueChart = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayRevenue = recentBookings
        .filter(b => {
          const bookingDate = new Date(b.createdAt)
          return bookingDate.toDateString() === date.toDateString() && 
                 b.status === 'COMPLETED'
        })
        .reduce((sum, booking) => sum + (booking.payment?.amount || 0), 0)
      
      revenueChart.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenue
      })
    }

    // Service breakdown
    const serviceBreakdown: { [key: string]: { count: number; revenue: number } } = {}
    recentBookings.forEach(booking => {
      if (booking.service && booking.status === 'COMPLETED') {
        const category = booking.service.category
        if (!serviceBreakdown[category]) {
          serviceBreakdown[category] = { count: 0, revenue: 0 }
        }
        serviceBreakdown[category].count++
        serviceBreakdown[category].revenue += booking.payment?.amount || 0
      }
    })

    const bookingsByService = Object.entries(serviceBreakdown).map(([service, data]) => ({
      service,
      count: data.count,
      revenue: data.revenue
    }))

    // Top professionals
    const topProfessionals = salon.professionals
      .map(p => {
        const professionalBookings = recentBookings.filter(b => b.professionalId === p.userId)
        const revenue = professionalBookings
          .filter(b => b.status === 'COMPLETED')
          .reduce((sum, booking) => sum + (booking.payment?.amount || 0), 0)
        
        return {
          user: p.user,
          professional: p.professional,
          revenue,
          bookings: professionalBookings.length,
          rating: p.professional?.averageRating || 0
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    const stats = {
      totalRevenue,
      totalBookings,
      totalProfessionals: salon.professionals.length,
      averageRating: Number(averageRating.toFixed(1)),
      monthlyRevenue: totalRevenue,
      weeklyBookings: recentBookings.filter(b => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(b.createdAt) >= weekAgo
      }).length,
      topProfessionals,
      revenueChart,
      bookingsByService
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
