
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/academy/certifications - Certificaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const certifications = await prisma.academyCertification.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        earnedAt: 'desc'
      }
    })

    // Calcular progreso hacia próximas certificaciones
    const progressToNext = await calculateCertificationProgress(session.user.id)

    return NextResponse.json({
      certifications,
      progressToNext
    })
  } catch (error) {
    console.error('Error fetching certifications:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/academy/certifications - Generar certificación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { category } = body

    // Verificar elegibilidad para certificación
    const eligibility = await checkCertificationEligibility(session.user.id, category)

    if (!eligibility.eligible) {
      return NextResponse.json({ 
        error: 'Not eligible for certification',
        requirements: eligibility.requirements
      }, { status: 400 })
    }

    // Generar número de certificado único
    const certificateNumber = `BGA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const verificationCode = Math.random().toString(36).substr(2, 12).toUpperCase()

    // Crear certificación
    const certification = await prisma.academyCertification.create({
      data: {
        userId: session.user.id,
        level: eligibility.level as any,
        category,
        coursesCompleted: eligibility.coursesCompleted,
        averageScore: eligibility.averageScore,
        totalHours: eligibility.totalHours,
        certificateUrl: `https://certificates.beautygo.com/${certificateNumber}`,
        certificateNumber,
        verificationCode,
        isVerified: true
      }
    })

    // Otorgar puntos por certificación
    const pointsMap = {
      'BRONZE': 200,
      'SILVER': 500,
      'GOLD': 1000,
      'PLATINUM': 2000,
      'DIAMOND': 5000
    }

    await prisma.beautyPoints.create({
      data: {
        userId: session.user.id,
        points: pointsMap[eligibility.level as keyof typeof pointsMap] || 200,
        action: 'certification_earned',
        description: `Earned ${eligibility.level} certification in ${category}`
      }
    })

    // Crear badge correspondiente
    await prisma.userBadge.create({
      data: {
        userId: session.user.id,
        badgeType: 'academy_certified',
        level: eligibility.level
      }
    })

    return NextResponse.json(certification, { status: 201 })
  } catch (error) {
    console.error('Error creating certification:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Función auxiliar para verificar elegibilidad
async function checkCertificationEligibility(userId: string, category: string) {
  try {
    // Obtener cursos completados en la categoría
    const completedCourses = await prisma.courseEnrollment.findMany({
      where: {
        userId,
        isCompleted: true,
        course: {
          category: category as any
        }
      },
      include: {
        course: {
          select: {
            duration: true,
            title: true
          }
        }
      }
    })

    // Obtener promedios de quizzes
    const quizResults = await prisma.quizResult.findMany({
      where: {
        userId,
        isPassed: true,
        quiz: {
          lesson: {
            module: {
              course: {
                category: category as any
              }
            }
          }
        }
      }
    })

    const coursesCompleted = completedCourses.length
    const totalHours = Math.round(
      completedCourses.reduce((acc, enrollment) => acc + (enrollment.course as any).duration, 0) / 60
    )
    const averageScore = quizResults.length > 0 
      ? Math.round(quizResults.reduce((acc, result) => acc + result.score, 0) / quizResults.length)
      : 0

    // Determinar nivel de certificación
    let level = 'BRONZE'
    let eligible = false
    const requirements = {
      coursesCompleted: 0,
      averageScore: 0,
      totalHours: 0
    }

    if (coursesCompleted >= 10 && averageScore >= 90 && totalHours >= 80) {
      level = 'PLATINUM'
      eligible = true
    } else if (coursesCompleted >= 6 && averageScore >= 85 && totalHours >= 50) {
      level = 'GOLD'
      eligible = true
    } else if (coursesCompleted >= 3 && averageScore >= 80 && totalHours >= 25) {
      level = 'SILVER'
      eligible = true
    } else if (coursesCompleted >= 1 && averageScore >= 70 && totalHours >= 10) {
      level = 'BRONZE'
      eligible = true
    } else {
      // Calcular requisitos faltantes
      if (coursesCompleted < 1) requirements.coursesCompleted = 1 - coursesCompleted
      if (averageScore < 70) requirements.averageScore = 70 - averageScore
      if (totalHours < 10) requirements.totalHours = 10 - totalHours
    }

    return {
      eligible,
      level,
      coursesCompleted,
      averageScore,
      totalHours,
      requirements
    }
  } catch (error) {
    console.error('Error checking certification eligibility:', error)
    return { eligible: false, level: 'BRONZE', coursesCompleted: 0, averageScore: 0, totalHours: 0, requirements: {} }
  }
}

// Función auxiliar para calcular progreso hacia certificaciones
async function calculateCertificationProgress(userId: string) {
  try {
    const categories = ['HAIR_STYLING', 'MAKEUP', 'NAILS', 'BUSINESS_SKILLS']
    const progress = []

    for (const category of categories) {
      const eligibility = await checkCertificationEligibility(userId, category)
      const existing = await prisma.academyCertification.findFirst({
        where: {
          userId,
          category: category as any
        }
      })

      if (!existing) {
        progress.push({
          category,
          currentLevel: null,
          nextLevel: eligibility.level,
          progress: {
            coursesCompleted: eligibility.coursesCompleted,
            averageScore: eligibility.averageScore,
            totalHours: eligibility.totalHours
          },
          requirements: eligibility.requirements,
          eligible: eligibility.eligible
        })
      }
    }

    return progress
  } catch (error) {
    console.error('Error calculating certification progress:', error)
    return []
  }
}
