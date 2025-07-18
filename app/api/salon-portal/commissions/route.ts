
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
        }
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Get recent payouts (mock data for now)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentBookings = await prisma.booking.findMany({
      where: {
        professionalId: {
          in: salon.professionals.map(p => p.userId)
        },
        createdAt: {
          gte: thirtyDaysAgo
        },
        status: 'COMPLETED'
      },
      include: {
        payment: true,
        professional: {
          include: {
            professionalProfile: true
          }
        }
      }
    })

    // Calculate payouts by professional
    const payoutsByProfessional: { [key: string]: any } = {}
    
    recentBookings.forEach(booking => {
      if (booking.payment && booking.professional) {
        const professionalId = booking.professionalId
        if (!payoutsByProfessional[professionalId]) {
          const salonProfessional = salon.professionals.find(p => p.userId === professionalId)
          payoutsByProfessional[professionalId] = {
            professionalName: booking.professional.name,
            businessName: booking.professional.professionalProfile?.businessName || '',
            amount: 0,
            bookings: 0,
            commissionRate: salonProfessional?.commissionRate || 0.70,
            period: 'Last 30 days',
            status: 'pending'
          }
        }
        
        const commissionRate = payoutsByProfessional[professionalId].commissionRate
        const professionalEarnings = booking.payment.amount * commissionRate
        
        payoutsByProfessional[professionalId].amount += professionalEarnings
        payoutsByProfessional[professionalId].bookings += 1
      }
    })

    const payouts = Object.values(payoutsByProfessional)

    const settings = {
      platformFeeRate: salon.platformFeeRate,
      salonCommissionRate: salon.salonCommissionRate,
      professionalCommissionRate: 1 - salon.platformFeeRate - salon.salonCommissionRate
    }

    return NextResponse.json({
      settings,
      payouts
    })
  } catch (error) {
    console.error('Commissions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
