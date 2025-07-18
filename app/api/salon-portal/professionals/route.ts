
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

    // Get salon professionals
    const professionals = await prisma.salonProfessional.findMany({
      where: {
        salonId: salon.id
      },
      include: {
        user: true,
        professional: true,
        salon: true
      }
    })

    return NextResponse.json(professionals)
  } catch (error) {
    console.error('Professionals API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
