
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

    // Get overview stats
    const [totalUsers, totalProfessionals, totalClients, totalBookings] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'PROFESSIONAL' } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.booking.count()
    ])

    // Get revenue stats
    const revenueResult = await prisma.payment.aggregate({
      _sum: {
        platformFee: true
      },
      where: {
        status: 'COMPLETED'
      }
    })

    const totalRevenue = revenueResult._sum.platformFee || 0

    // Get booking counts
    const [pendingBookings, completedBookings, totalServices, pendingVerifications] = await Promise.all([
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.service.count(),
      prisma.verificationRequest.count({ where: { status: 'PENDING' } })
    ])

    // Get monthly stats (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyBookings = await prisma.booking.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      }
    })

    const monthlyRevenue = await prisma.payment.groupBy({
      by: ['createdAt'],
      _sum: {
        platformFee: true
      },
      where: {
        createdAt: {
          gte: sixMonthsAgo
        },
        status: 'COMPLETED'
      }
    })

    const monthlyUsers = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      }
    })

    // Format monthly stats
    const monthlyStats = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().slice(0, 7)
      
      return {
        month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        bookings: monthlyBookings.filter(b => b.createdAt.toISOString().slice(0, 7) === monthKey).length,
        revenue: monthlyRevenue.filter(r => r.createdAt.toISOString().slice(0, 7) === monthKey).reduce((sum, r) => sum + (r._sum.platformFee || 0), 0),
        newUsers: monthlyUsers.filter(u => u.createdAt.toISOString().slice(0, 7) === monthKey).length
      }
    }).reverse()

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
            averageRating: true,
            totalReviews: true,
            isVerified: true
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
      totalEarnings: prof.professionalProfile?.totalEarnings || 0,
      totalBookings: prof._count.bookingsAsProfessional,
      averageRating: prof.professionalProfile?.averageRating || 0,
      isVerified: prof.professionalProfile?.isVerified || false
    }))

    return NextResponse.json({
      overview: {
        totalUsers,
        totalProfessionals,
        totalClients,
        totalBookings,
        totalRevenue,
        pendingBookings,
        completedBookings,
        totalServices,
        pendingVerifications
      },
      monthlyStats,
      topProfessionals: formattedTopProfessionals
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
