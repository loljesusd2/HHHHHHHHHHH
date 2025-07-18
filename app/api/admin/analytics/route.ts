
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get overview stats
    const [totalUsers, totalBookings, totalProfessionals] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.user.count({ where: { role: 'PROFESSIONAL' } })
    ])

    const revenueResult = await prisma.payment.aggregate({
      _sum: {
        platformFee: true
      },
      where: {
        status: 'COMPLETED'
      }
    })

    const totalRevenue = revenueResult._sum.platformFee || 0

    // Mock growth data (in a real app, you'd calculate this from historical data)
    const overview = {
      totalUsers,
      totalBookings,
      totalRevenue,
      totalProfessionals,
      growth: {
        users: 12.5,
        bookings: 8.3,
        revenue: 15.2,
        professionals: 6.7
      }
    }

    // Generate user growth data
    const userGrowth = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      return {
        date: date.toISOString().split('T')[0],
        clients: Math.floor(Math.random() * 50) + 20,
        professionals: Math.floor(Math.random() * 10) + 5,
        total: Math.floor(Math.random() * 60) + 25
      }
    })

    // Generate revenue data
    const revenueData = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      return {
        month: date.toLocaleDateString('es-ES', { month: 'short' }),
        revenue: Math.floor(Math.random() * 5000) + 2000,
        bookings: Math.floor(Math.random() * 200) + 100,
        averageBookingValue: Math.floor(Math.random() * 100) + 50
      }
    }).reverse()

    // Generate service categories data
    const serviceCategories = [
      { category: 'HAIR_STYLING', count: 45, revenue: 12500, percentage: 35 },
      { category: 'MAKEUP', count: 30, revenue: 8000, percentage: 23 },
      { category: 'MANICURE', count: 25, revenue: 6500, percentage: 19 },
      { category: 'SKINCARE', count: 20, revenue: 5200, percentage: 15 },
      { category: 'EYEBROWS', count: 10, revenue: 2800, percentage: 8 }
    ]

    // Generate geographic data
    const geographicData = [
      { city: 'Miami', state: 'FL', users: 1250, bookings: 450, revenue: 25000 },
      { city: 'Orlando', state: 'FL', users: 800, bookings: 300, revenue: 15000 },
      { city: 'Tampa', state: 'FL', users: 600, bookings: 220, revenue: 12000 },
      { city: 'Jacksonville', state: 'FL', users: 400, bookings: 150, revenue: 8000 },
      { city: 'Fort Lauderdale', state: 'FL', users: 350, bookings: 120, revenue: 6500 }
    ]

    // Generate conversion funnel
    const conversionFunnel = [
      { stage: 'Visitantes', count: 10000, percentage: 100 },
      { stage: 'Registros', count: 2500, percentage: 25 },
      { stage: 'Perfiles Completos', count: 2000, percentage: 20 },
      { stage: 'Primera Búsqueda', count: 1500, percentage: 15 },
      { stage: 'Primera Cita', count: 800, percentage: 8 },
      { stage: 'Usuarios Activos', count: 600, percentage: 6 }
    ]

    // Active users
    const activeUsers = {
      daily: Math.floor(Math.random() * 500) + 200,
      weekly: Math.floor(Math.random() * 1500) + 800,
      monthly: Math.floor(Math.random() * 3000) + 2000
    }

    // Generate booking trends
    const bookingTrends = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      return {
        date: date.toISOString().split('T')[0],
        bookings: Math.floor(Math.random() * 50) + 20,
        completionRate: Math.floor(Math.random() * 30) + 70,
        cancelationRate: Math.floor(Math.random() * 20) + 5
      }
    })

    // Get top professionals
    const topProfessionals = await prisma.user.findMany({
      where: {
        role: 'PROFESSIONAL',
        professionalProfile: {
          isNot: null
        }
      },
      include: {
        professionalProfile: {
          select: {
            businessName: true,
            totalEarnings: true,
            averageRating: true
          }
        },
        _count: {
          select: {
            bookingsAsProfessional: true
          }
        }
      },
      orderBy: {
        professionalProfile: {
          totalEarnings: 'desc'
        }
      },
      take: 5
    })

    const formattedTopProfessionals = topProfessionals.map(prof => ({
      id: prof.id,
      name: prof.name,
      businessName: prof.professionalProfile?.businessName || '',
      totalBookings: prof._count.bookingsAsProfessional,
      totalRevenue: prof.professionalProfile?.totalEarnings || 0,
      averageRating: prof.professionalProfile?.averageRating || 0
    }))

    return NextResponse.json({
      overview,
      userGrowth,
      revenueData,
      serviceCategories,
      geographicData,
      topProfessionals: formattedTopProfessionals,
      conversionFunnel,
      activeUsers,
      bookingTrends
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
