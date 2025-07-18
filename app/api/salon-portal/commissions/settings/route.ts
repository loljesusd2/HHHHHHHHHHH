
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { platformFeeRate, salonCommissionRate, professionalCommissionRate } = body

    // Validate rates
    if (platformFeeRate + salonCommissionRate + professionalCommissionRate !== 1) {
      return NextResponse.json({ 
        error: 'Commission rates must sum to 100%' 
      }, { status: 400 })
    }

    // Get user's salon
    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Update salon commission settings
    const updatedSalon = await prisma.salon.update({
      where: {
        id: salon.id
      },
      data: {
        platformFeeRate,
        salonCommissionRate
      }
    })

    // Update all professionals' commission rates
    await prisma.salonProfessional.updateMany({
      where: {
        salonId: salon.id
      },
      data: {
        commissionRate: professionalCommissionRate
      }
    })

    return NextResponse.json({
      success: true,
      salon: updatedSalon
    })
  } catch (error) {
    console.error('Commission settings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
