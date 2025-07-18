
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateId, professionalIds, date } = body

    // Get user's salon
    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Get template
    const template = await prisma.salonScheduleTemplate.findFirst({
      where: {
        id: templateId,
        salonId: salon.id
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Update professional schedules
    const updatePromises = professionalIds.map(async (professionalId: string) => {
      // Get professional profile
      const professional = await prisma.professionalProfile.findFirst({
        where: {
          userId: professionalId
        }
      })

      if (professional) {
        // Update working hours with template schedule
        return prisma.professionalProfile.update({
          where: {
            id: professional.id
          },
          data: {
            workingHours: template.schedule
          }
        })
      }
    })

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: `Updated schedule for ${professionalIds.length} professionals`
    })
  } catch (error) {
    console.error('Bulk schedule update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
