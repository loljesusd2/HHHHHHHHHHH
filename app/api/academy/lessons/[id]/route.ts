
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/academy/lessons/[id] - Obtener lección
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      include: {
        module: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: {
                    userId: session.user.id,
                    paymentStatus: 'COMPLETED'
                  }
                }
              }
            }
          }
        },
        quizzes: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            description: true,
            passingScore: true,
            maxAttempts: true,
            timeLimit: true
          }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Verificar acceso
    const hasAccess = lesson.isFree || lesson.module.course.enrollments.length > 0

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Obtener progreso del usuario
    const progress = await prisma.courseProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: params.id
        }
      }
    })

    // Obtener lecciones del mismo módulo para navegación
    const moduleLessons = await prisma.lesson.findMany({
      where: {
        moduleId: lesson.moduleId,
        isActive: true
      },
      select: {
        id: true,
        title: true,
        order: true,
        duration: true,
        isFree: true
      },
      orderBy: { order: 'asc' }
    })

    const currentIndex = moduleLessons.findIndex(l => l.id === params.id)
    const nextLesson = currentIndex < moduleLessons.length - 1 ? moduleLessons[currentIndex + 1] : null
    const previousLesson = currentIndex > 0 ? moduleLessons[currentIndex - 1] : null

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        duration: lesson.duration,
        videoUrl: lesson.videoUrl,
        videoThumbnail: lesson.videoThumbnail,
        pdfUrl: lesson.pdfUrl,
        downloadableResources: lesson.downloadableResources,
        isFree: lesson.isFree,
        module: {
          id: lesson.module.id,
          title: lesson.module.title,
          courseId: lesson.module.courseId
        },
        quizzes: lesson.quizzes
      },
      progress,
      navigation: {
        nextLesson,
        previousLesson,
        moduleLessons
      }
    })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/academy/lessons/[id] - Marcar lección como vista
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { watchTime, isCompleted } = body

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      include: {
        module: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: {
                    userId: session.user.id,
                    paymentStatus: 'COMPLETED'
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Verificar acceso
    const hasAccess = lesson.isFree || lesson.module.course.enrollments.length > 0

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const progressPercentage = lesson.duration > 0 
      ? Math.round((watchTime / lesson.duration) * 100)
      : 0

    // Actualizar progreso
    const progress = await prisma.courseProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: params.id
        }
      },
      update: {
        watchTime,
        progressPercentage,
        isCompleted: isCompleted || progressPercentage >= 90,
        lastWatchedAt: new Date(),
        completedAt: isCompleted ? new Date() : undefined
      },
      create: {
        userId: session.user.id,
        lessonId: params.id,
        watchTime,
        totalTime: lesson.duration,
        progressPercentage,
        isCompleted: isCompleted || progressPercentage >= 90,
        lastWatchedAt: new Date(),
        completedAt: isCompleted ? new Date() : undefined
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error updating lesson progress:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
