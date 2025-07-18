
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { createFlashDeal, getActiveFlashDeals, useFlashDeal } from '@/lib/gamification-utils'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET /api/gamification/flash-deals - Get active flash deals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const neighborhood = searchParams.get('neighborhood')
    const serviceCategory = searchParams.get('category')

    let deals = await getActiveFlashDeals(neighborhood || undefined)

    // Filter by service category if specified
    if (serviceCategory) {
      deals = deals.filter(deal => deal.service.category === serviceCategory)
    }

    // Add time remaining for each deal
    const dealsWithTimeRemaining = deals.map(deal => {
      const now = new Date()
      const timeRemaining = deal.endTime.getTime() - now.getTime()
      const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)))
      const minutesRemaining = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)))

      return {
        ...deal,
        timeRemaining: {
          hours: hoursRemaining,
          minutes: minutesRemaining,
          total: timeRemaining
        },
        usesRemaining: deal.maxUses - deal.currentUses
      }
    })

    return NextResponse.json(dealsWithTimeRemaining)
  } catch (error) {
    console.error('Error getting flash deals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/gamification/flash-deals - Create or use flash deal
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, dealId, serviceId, discount, durationHours, neighborhood, maxUses } = await request.json()

    if (action === 'create') {
      // Only professionals can create flash deals
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { professionalProfile: true }
      })

      if (!user?.professionalProfile) {
        return NextResponse.json({ error: 'Only professionals can create flash deals' }, { status: 403 })
      }

      // Verify the service belongs to the professional
      const service = await prisma.service.findFirst({
        where: {
          id: serviceId,
          professionalId: user.professionalProfile.id
        }
      })

      if (!service) {
        return NextResponse.json({ error: 'Service not found or unauthorized' }, { status: 404 })
      }

      const result = await createFlashDeal(
        serviceId,
        discount,
        durationHours || 2,
        neighborhood || user.professionalProfile.city,
        maxUses || 10
      )

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      return NextResponse.json(result.flashDeal)
    } else if (action === 'use') {
      // Use flash deal
      const result = await useFlashDeal(dealId)

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      return NextResponse.json({ success: true, discount: result.discount })
    } else if (action === 'deactivate') {
      // Deactivate flash deal (only by creator)
      const deal = await prisma.flashDeal.findUnique({
        where: { id: dealId },
        include: {
          service: {
            include: {
              professional: true
            }
          }
        }
      })

      if (!deal) {
        return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
      }

      // Check if user owns this deal
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { professionalProfile: true }
      })

      if (!user?.professionalProfile || deal.service.professionalId !== user.professionalProfile.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      await prisma.flashDeal.update({
        where: { id: dealId },
        data: { isActive: false }
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing flash deal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
