
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/academy/reviews - Reviews de cursos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    if (courseId) {
      where.courseId = courseId
    }

    const reviews = await prisma.courseReview.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true
          }
        }
      },
      orderBy: [
        { isVerified: 'desc' },
        { helpfulVotes: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    const totalCount = await prisma.courseReview.count({ where })

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/academy/reviews - Crear nueva review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, rating, title, comment } = body

    // Verificar que el usuario esté inscrito y haya completado el curso
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      }
    })

    if (!enrollment || !enrollment.isCompleted) {
      return NextResponse.json({ 
        error: 'Must complete course to leave review' 
      }, { status: 403 })
    }

    // Verificar que no haya review previa
    const existingReview = await prisma.courseReview.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      }
    })

    if (existingReview) {
      return NextResponse.json({ 
        error: 'Review already exists' 
      }, { status: 409 })
    }

    // Crear review
    const review = await prisma.courseReview.create({
      data: {
        userId: session.user.id,
        courseId,
        rating,
        title,
        comment,
        isVerified: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    // Actualizar rating promedio del curso
    await updateCourseRating(courseId)

    // Otorgar puntos por review
    await prisma.beautyPoints.create({
      data: {
        userId: session.user.id,
        points: 25,
        action: 'course_review',
        description: `Reviewed course: ${review.course.title}`
      }
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Función auxiliar para actualizar rating del curso
async function updateCourseRating(courseId: string) {
  try {
    const reviews = await prisma.courseReview.findMany({
      where: { courseId },
      select: { rating: true }
    })

    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
      : 0

    await prisma.course.update({
      where: { id: courseId },
      data: {
        averageRating,
        totalReviews
      }
    })
  } catch (error) {
    console.error('Error updating course rating:', error)
  }
}
