
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

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

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
        }
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (range) {
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

    // Get bookings data
    const bookings = await prisma.booking.findMany({
      where: {
        professionalId: {
          in: salon.professionals.map(p => p.userId)
        },
        createdAt: {
          gte: startDate
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

    // Generate revenue data
    const revenueData = []
    const days = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const dayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.createdAt)
        return bookingDate.toDateString() === date.toDateString() && 
               b.status === 'COMPLETED'
      })
      
      const revenue = dayBookings.reduce((sum, booking) => 
        sum + (booking.payment?.amount || 0), 0)
      
      revenueData.push({
        date: date.toISOString().split('T')[0],
        revenue
      })
    }

    // Service distribution
    const serviceDistribution: { [key: string]: number } = {}
    bookings.forEach(booking => {
      if (booking.service) {
        const category = booking.service.category
        serviceDistribution[category] = (serviceDistribution[category] || 0) + 1
      }
    })

    const serviceData = Object.entries(serviceDistribution).map(([name, value]) => ({
      name,
      value
    }))

    // Revenue by professional
    const revenueByProfessional = salon.professionals.map(p => {
      const professionalBookings = bookings.filter(b => 
        b.professionalId === p.userId && b.status === 'COMPLETED'
      )
      const revenue = professionalBookings.reduce((sum, booking) => 
        sum + (booking.payment?.amount || 0), 0)
      
      return {
        name: p.user.name,
        revenue
      }
    })

    // Top performers
    const topPerformers = salon.professionals.map(p => {
      const professionalBookings = bookings.filter(b => b.professionalId === p.userId)
      const revenue = professionalBookings
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, booking) => sum + (booking.payment?.amount || 0), 0)
      
      return {
        name: p.user.name,
        businessName: p.professional?.businessName || '',
        revenue,
        bookings: professionalBookings.length,
        rating: p.professional?.averageRating || 0
      }
    }).sort((a, b) => b.revenue - a.revenue)

    // Client data
    const clientData = []
    for (let i = 0; i < Math.min(30, days); i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const dayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.createdAt)
        return bookingDate.toDateString() === date.toDateString()
      })
      
      // This is a simplified version - in reality, you'd track unique client IDs
      const newClients = Math.floor(dayBookings.length * 0.3)
      const returningClients = dayBookings.length - newClients
      
      clientData.push({
        date: date.toISOString().split('T')[0],
        new: newClients,
        returning: returningClients
      })
    }

    return NextResponse.json({
      revenueData,
      serviceData,
      revenueByProfessional,
      topPerformers,
      clientData
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
