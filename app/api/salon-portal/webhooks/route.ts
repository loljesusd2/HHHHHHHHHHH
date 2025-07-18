
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { randomBytes } from 'crypto'

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
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Get webhooks
    const webhooks = await prisma.salonWebhook.findMany({
      where: {
        salonId: salon.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(webhooks)
  } catch (error) {
    console.error('Webhooks API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { url, events, description, isActive } = body

    // Get user's salon
    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Generate webhook secret
    const secret = randomBytes(32).toString('hex')

    // Create webhook
    const webhook = await prisma.salonWebhook.create({
      data: {
        salonId: salon.id,
        url,
        events,
        description,
        isActive: isActive !== false,
        secret
      }
    })

    return NextResponse.json(webhook)
  } catch (error) {
    console.error('Create webhook API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
