
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { isActive, commissionRate, role } = body

    // Get user's salon
    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Update professional
    const updatedProfessional = await prisma.salonProfessional.update({
      where: {
        id: id,
        salonId: salon.id
      },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(commissionRate !== undefined && { commissionRate }),
        ...(role !== undefined && { role })
      },
      include: {
        user: true,
        professional: true,
        salon: true
      }
    })

    return NextResponse.json(updatedProfessional)
  } catch (error) {
    console.error('Professional update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get user's salon
    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Remove professional from salon
    await prisma.salonProfessional.delete({
      where: {
        id: id,
        salonId: salon.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Professional delete API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
