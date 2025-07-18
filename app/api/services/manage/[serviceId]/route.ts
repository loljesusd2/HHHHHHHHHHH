
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function PUT(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
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

    const { serviceId } = params
    const { name, description, category, price, duration, images, isActive } = await request.json()

    // Verify service belongs to this professional
    const existingService = await prisma.service.findFirst({
      where: {
        id: serviceId,
        professionalId: user.professionalProfile.id
      }
    })

    if (!existingService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name,
        description,
        category,
        price: price ? parseFloat(price) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        images,
        isActive
      }
    })

    return NextResponse.json(updatedService)
  } catch (error) {
    console.error('Service update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
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

    const { serviceId } = params

    // Verify service belongs to this professional
    const existingService = await prisma.service.findFirst({
      where: {
        id: serviceId,
        professionalId: user.professionalProfile.id
      }
    })

    if (!existingService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    await prisma.service.delete({
      where: { id: serviceId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Service deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
