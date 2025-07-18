
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

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: { professionalProfile: true }
    })

    if (!user || user.role !== 'PROFESSIONAL' || !user.professionalProfile) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    const services = await prisma.service.findMany({
      where: { professionalId: user.professionalProfile.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Services fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: { professionalProfile: true }
    })

    if (!user || user.role !== 'PROFESSIONAL' || !user.professionalProfile) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    const { name, description, category, price, duration, images } = await request.json()

    if (!name || !description || !category || !price || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const service = await prisma.service.create({
      data: {
        professionalId: user.professionalProfile.id,
        name,
        description,
        category,
        price: parseFloat(price),
        duration: parseInt(duration),
        images: images || []
      }
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Service creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
