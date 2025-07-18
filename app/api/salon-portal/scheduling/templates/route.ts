
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
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Get schedule templates
    const templates = await prisma.salonScheduleTemplate.findMany({
      where: {
        salonId: salon.id
      },
      orderBy: {
        isDefault: 'desc'
      }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Schedule templates API error:', error)
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
    const { name, description, schedule, isDefault } = body

    // Get user's salon
    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // If setting as default, remove default from other templates
    if (isDefault) {
      await prisma.salonScheduleTemplate.updateMany({
        where: {
          salonId: salon.id,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      })
    }

    // Create new template
    const template = await prisma.salonScheduleTemplate.create({
      data: {
        salonId: salon.id,
        name,
        description,
        schedule,
        isDefault: isDefault || false
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Create schedule template API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
