
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/academy/courses/[id] - Detalle de curso
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
        isActive: true
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            instructorProfile: {
              select: {
                bio: true,
                specializations: true,
                yearsExperience: true,
                certifications: true,
                portfolioImages: true,
                averageRating: true,
                totalStudents: true,
                totalCourses: true
              }
            }
          }
        },
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                description: true,
                order: true,
                duration: true,
                videoThumbnail: true,
                isFree: true,
                isActive: true
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Verificar si el usuario está inscrito
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: params.id
        }
      }
    })

    return NextResponse.json({
      ...course,
      isEnrolled: !!enrollment,
      enrollment
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT /api/academy/courses/[id] - Actualizar curso (solo el instructor)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Verificar que el usuario es el instructor del curso
    const course = await prisma.course.findUnique({
      where: { id: params.id }
    })

    if (!course || course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedAt: new Date()
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            instructorProfile: true
          }
        }
      }
    })

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/academy/courses/[id] - Eliminar curso (solo el instructor)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar que el usuario es el instructor del curso
    const course = await prisma.course.findUnique({
      where: { id: params.id }
    })

    if (!course || course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Soft delete - marcar como inactivo
    await prisma.course.update({
      where: { id: params.id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
