
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { awardPoints } from '@/lib/gamification-utils'
import { POINT_VALUES } from '@/lib/types'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET /api/gamification/timeline - Get user's beauty timeline
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const isPublic = searchParams.get('public') === 'true'
    
    const session = await getServerSession(authOptions)
    const targetUserId = userId || session?.user?.id

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // If viewing someone else's timeline, only show public entries
    const whereClause = {
      userId: targetUserId,
      ...(isPublic || (userId && userId !== session?.user?.id) ? { isPublic: true } : {})
    }

    const timeline = await prisma.beautyTimeline.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            service: {
              include: {
                professional: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Group by month for better visualization
    const groupedTimeline = timeline.reduce((acc, entry) => {
      const monthKey = entry.createdAt.toISOString().substring(0, 7) // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = []
      }
      acc[monthKey].push(entry)
      return acc
    }, {} as Record<string, typeof timeline>)

    // Calculate stats
    const stats = {
      totalEntries: timeline.length,
      publicEntries: timeline.filter(t => t.isPublic).length,
      privateEntries: timeline.filter(t => !t.isPublic).length,
      servicesUsed: [...new Set(timeline.map(t => t.booking.service.category))].length,
      favoriteService: getMostFrequentService(timeline),
      timelineStarted: timeline.length > 0 ? timeline[timeline.length - 1].createdAt : null
    }

    return NextResponse.json({
      timeline: groupedTimeline,
      stats,
      totalEntries: timeline.length
    })
  } catch (error) {
    console.error('Error getting timeline:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/gamification/timeline - Add entry to timeline
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId, beforePhoto, afterPhoto, notes, isPublic } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
    }

    // Verify booking belongs to user
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        clientId: session.user.id
      },
      include: {
        service: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found or unauthorized' }, { status: 404 })
    }

    // Check if timeline entry already exists
    const existingEntry = await prisma.beautyTimeline.findFirst({
      where: {
        bookingId,
        userId: session.user.id
      }
    })

    let timelineEntry

    if (existingEntry) {
      // Update existing entry
      timelineEntry = await prisma.beautyTimeline.update({
        where: { id: existingEntry.id },
        data: {
          beforePhoto,
          afterPhoto,
          notes,
          isPublic: isPublic ?? false
        }
      })
    } else {
      // Create new entry
      timelineEntry = await prisma.beautyTimeline.create({
        data: {
          userId: session.user.id,
          bookingId,
          beforePhoto,
          afterPhoto,
          notes,
          isPublic: isPublic ?? false,
          serviceType: booking.service.category
        }
      })

      // Award points for adding photo
      if (beforePhoto || afterPhoto) {
        await awardPoints(
          session.user.id,
          'photo_upload',
          POINT_VALUES.PHOTO_UPLOAD,
          'Added photos to beauty timeline',
          bookingId
        )
      }
    }

    return NextResponse.json(timelineEntry)
  } catch (error) {
    console.error('Error adding timeline entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/gamification/timeline - Update timeline entry
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { timelineId, beforePhoto, afterPhoto, notes, isPublic } = await request.json()

    if (!timelineId) {
      return NextResponse.json({ error: 'Timeline ID required' }, { status: 400 })
    }

    // Verify timeline entry belongs to user
    const timelineEntry = await prisma.beautyTimeline.findFirst({
      where: {
        id: timelineId,
        userId: session.user.id
      }
    })

    if (!timelineEntry) {
      return NextResponse.json({ error: 'Timeline entry not found or unauthorized' }, { status: 404 })
    }

    const updatedEntry = await prisma.beautyTimeline.update({
      where: { id: timelineId },
      data: {
        beforePhoto,
        afterPhoto,
        notes,
        isPublic
      }
    })

    return NextResponse.json(updatedEntry)
  } catch (error) {
    console.error('Error updating timeline entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/gamification/timeline - Delete timeline entry
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timelineId = searchParams.get('id')

    if (!timelineId) {
      return NextResponse.json({ error: 'Timeline ID required' }, { status: 400 })
    }

    // Verify timeline entry belongs to user
    const timelineEntry = await prisma.beautyTimeline.findFirst({
      where: {
        id: timelineId,
        userId: session.user.id
      }
    })

    if (!timelineEntry) {
      return NextResponse.json({ error: 'Timeline entry not found or unauthorized' }, { status: 404 })
    }

    await prisma.beautyTimeline.delete({
      where: { id: timelineId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting timeline entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getMostFrequentService(timeline: any[]): string | null {
  if (timeline.length === 0) return null
  
  const serviceCounts = timeline.reduce((acc, entry) => {
    const category = entry.booking.service.category
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(serviceCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0][0]
}
