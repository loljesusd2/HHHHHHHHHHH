
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/academy/enrollments - Inscripciones del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'active', 'completed', 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {
      userId: session.user.id,
      paymentStatus: 'COMPLETED'
    }

    if (status === 'completed') {
      where.isCompleted = true
    } else if (status === 'active') {
      where.isCompleted = false
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where,
      include: {
        course: {
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
                    averageRating: true
                  }
                }
              }
            },
            modules: {
              select: {
                id: true,
                title: true,
                lessons: {
                  select: {
                    id: true,
                    title: true,
                    duration: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' },
      skip,
      take: limit
    })

    // Calcular progreso para cada inscripción
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalLessons = enrollment.course.modules.reduce(
          (acc, module) => acc + module.lessons.length,
          0
        )

        const completedLessons = await prisma.courseProgress.count({
          where: {
            userId: session.user.id,
            isCompleted: true,
            lesson: {
              module: {
                courseId: enrollment.courseId
              }
            }
          }
        })

        const progressPercentage = totalLessons > 0 
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0

        return {
          ...enrollment,
          progressPercentage,
          completedLessons,
          totalLessons
        }
      })
    )

    return NextResponse.json(enrollmentsWithProgress)
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/academy/enrollments - Nueva inscripción
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, enrollmentType = 'INDIVIDUAL', paymentMethod = 'CASH' } = body

    // Verificar que el curso existe
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Verificar que el usuario no esté ya inscrito
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 409 })
    }

    const totalLessons = course.modules.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    )

    // Crear inscripción
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: session.user.id,
        courseId,
        enrollmentType,
        amount: course.price,
        paymentStatus: 'COMPLETED', // Simplificado para MVP
        totalLessons,
        hasLifetimeAccess: true
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    // Actualizar estadísticas del curso
    await prisma.course.update({
      where: { id: courseId },
      data: {
        totalStudents: { increment: 1 },
        totalRevenue: { increment: course.price }
      }
    })

    // Otorgar puntos de gamificación
    await prisma.beautyPoints.create({
      data: {
        userId: session.user.id,
        points: 50,
        action: 'course_enrollment',
        description: `Enrolled in ${course.title}`
      }
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
