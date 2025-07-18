
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/academy/progress - Progreso del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (courseId) {
      // Progreso específico de un curso
      const progress = await prisma.courseProgress.findMany({
        where: {
          userId: session.user.id,
          lesson: {
            module: {
              courseId
            }
          }
        },
        include: {
          lesson: {
            include: {
              module: {
                select: {
                  id: true,
                  title: true,
                  courseId: true
                }
              }
            }
          }
        },
        orderBy: {
          lesson: {
            order: 'asc'
          }
        }
      })

      return NextResponse.json(progress)
    } else {
      // Progreso general del usuario
      const enrollments = await prisma.courseEnrollment.findMany({
        where: {
          userId: session.user.id,
          paymentStatus: 'COMPLETED'
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
              duration: true,
              modules: {
                select: {
                  lessons: {
                    select: {
                      id: true,
                      duration: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      const progressSummary = await Promise.all(
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

          const totalWatchTime = await prisma.courseProgress.aggregate({
            where: {
              userId: session.user.id,
              lesson: {
                module: {
                  courseId: enrollment.courseId
                }
              }
            },
            _sum: {
              watchTime: true
            }
          })

          const progressPercentage = totalLessons > 0 
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0

          return {
            courseId: enrollment.courseId,
            courseName: enrollment.course.title,
            thumbnailUrl: enrollment.course.thumbnailUrl,
            progressPercentage,
            completedLessons,
            totalLessons,
            totalWatchTime: totalWatchTime._sum.watchTime || 0,
            estimatedTimeLeft: Math.max(0, enrollment.course.duration - (totalWatchTime._sum.watchTime || 0)),
            lastWatchedAt: enrollment.updatedAt
          }
        })
      )

      return NextResponse.json(progressSummary)
    }
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/academy/progress - Actualizar progreso
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lessonId, watchTime, isCompleted } = body

    // Verificar que el usuario está inscrito en el curso
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
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

    if (!lesson || lesson.module.course.enrollments.length === 0) {
      return NextResponse.json({ error: 'Not enrolled in course' }, { status: 403 })
    }

    const progressPercentage = lesson.duration > 0 
      ? Math.round((watchTime / lesson.duration) * 100)
      : 0

    // Actualizar o crear progreso
    const progress = await prisma.courseProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId
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
        lessonId,
        watchTime,
        totalTime: lesson.duration,
        progressPercentage,
        isCompleted: isCompleted || progressPercentage >= 90,
        lastWatchedAt: new Date(),
        completedAt: isCompleted ? new Date() : undefined
      }
    })

    // Si la lección se completó, otorgar puntos
    if (progress.isCompleted) {
      await prisma.beautyPoints.create({
        data: {
          userId: session.user.id,
          points: 25,
          action: 'lesson_completed',
          description: `Completed lesson: ${lesson.title}`
        }
      })
    }

    // Actualizar progreso general del curso
    await updateCourseProgress(session.user.id, lesson.module.courseId)

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Función auxiliar para actualizar progreso del curso
async function updateCourseProgress(userId: string, courseId: string) {
  try {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    })

    if (!enrollment) return

    const totalLessons = await prisma.lesson.count({
      where: {
        module: {
          courseId
        }
      }
    })

    const completedLessons = await prisma.courseProgress.count({
      where: {
        userId,
        isCompleted: true,
        lesson: {
          module: {
            courseId
          }
        }
      }
    })

    const progressPercentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

    const isCompleted = progressPercentage >= 100

    await prisma.courseEnrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: {
        progressPercentage,
        completedLessons,
        totalLessons,
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined
      }
    })

    // Si se completó el curso, otorgar puntos adicionales
    if (isCompleted && !enrollment.isCompleted) {
      await prisma.beautyPoints.create({
        data: {
          userId,
          points: 100,
          action: 'course_completed',
          description: 'Completed a full course'
        }
      })
    }
  } catch (error) {
    console.error('Error updating course progress:', error)
  }
}
