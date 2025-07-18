
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            name: true,
            email: true,
            instructorProfile: {
              select: {
                bio: true,
                specializations: true,
                averageRating: true
              }
            }
          }
        },
        _count: {
          select: {
            modules: true,
            enrollments: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const data = await request.json()
    
    // Find admin user to use as instructor
    const adminUser = await prisma.user.findUnique({
      where: { id: (session.user as any).id }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
    }

    const course = await prisma.course.create({
      data: {
        instructorId: adminUser.id,
        title: data.title,
        description: data.description,
        category: data.category,
        level: data.level,
        price: data.price,
        originalPrice: data.originalPrice,
        duration: data.duration,
        thumbnailUrl: data.thumbnailUrl,
        previewVideoUrl: data.previewVideoUrl,
        syllabus: data.syllabus,
        tags: data.tags,
        badges: data.badges,
        requirements: data.requirements,
        skillsYouWillLearn: data.skillsYouWillLearn,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        allowReviews: data.allowReviews,
        totalRevenue: 0
      }
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: (session.user as any).id,
        action: 'course_create',
        entityType: 'course',
        entityId: course.id,
        details: {
          title: course.title,
          category: course.category,
          price: course.price
        }
      }
    })

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
