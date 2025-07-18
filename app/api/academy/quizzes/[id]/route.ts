
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/academy/quizzes/[id] - Obtener quiz
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        lesson: {
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
        }
      }
    })

    if (!quiz || !quiz.lesson.module.course.enrollments.length) {
      return NextResponse.json({ error: 'Quiz not found or not enrolled' }, { status: 404 })
    }

    // Obtener intentos previos
    const attempts = await prisma.quizResult.findMany({
      where: {
        userId: session.user.id,
        quizId: params.id
      },
      orderBy: { attemptNumber: 'desc' },
      take: 1
    })

    const lastAttempt = attempts[0]
    const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1

    // Verificar si puede tomar el quiz
    const canTakeQuiz = !lastAttempt || 
      (lastAttempt.attemptNumber < quiz.maxAttempts && !lastAttempt.isPassed)

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        timeLimit: quiz.timeLimit,
        showResults: quiz.showResults
      },
      canTakeQuiz,
      attemptNumber,
      lastAttempt: lastAttempt ? {
        score: lastAttempt.score,
        isPassed: lastAttempt.isPassed,
        attemptNumber: lastAttempt.attemptNumber,
        completedAt: lastAttempt.completedAt
      } : null
    })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/academy/quizzes/[id] - Enviar respuestas del quiz
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
    const { answers, startedAt } = body

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        lesson: {
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
        }
      }
    })

    if (!quiz || !quiz.lesson.module.course.enrollments.length) {
      return NextResponse.json({ error: 'Quiz not found or not enrolled' }, { status: 404 })
    }

    // Verificar intentos previos
    const attempts = await prisma.quizResult.findMany({
      where: {
        userId: session.user.id,
        quizId: params.id
      },
      orderBy: { attemptNumber: 'desc' }
    })

    const lastAttempt = attempts[0]
    const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1

    // Verificar si puede tomar el quiz
    if (lastAttempt && lastAttempt.attemptNumber >= quiz.maxAttempts) {
      return NextResponse.json({ error: 'Maximum attempts reached' }, { status: 400 })
    }

    // Calcular puntaje
    const questions = quiz.questions as any[]
    let correctAnswers = 0

    questions.forEach((question, index) => {
      const userAnswer = answers[index]
      if (userAnswer === question.correctAnswer) {
        correctAnswers++
      }
    })

    const score = Math.round((correctAnswers / questions.length) * 100)
    const isPassed = score >= quiz.passingScore

    // Crear resultado
    const result = await prisma.quizResult.create({
      data: {
        userId: session.user.id,
        quizId: params.id,
        score,
        answers,
        isPassed,
        attemptNumber,
        startedAt: new Date(startedAt),
        completedAt: new Date()
      }
    })

    // Si pasó el quiz, otorgar puntos
    if (isPassed) {
      await prisma.beautyPoints.create({
        data: {
          userId: session.user.id,
          points: 30,
          action: 'quiz_passed',
          description: `Passed quiz: ${quiz.title}`
        }
      })
    }

    return NextResponse.json({
      result: {
        id: result.id,
        score,
        isPassed,
        attemptNumber,
        correctAnswers,
        totalQuestions: questions.length,
        passingScore: quiz.passingScore
      },
      showResults: quiz.showResults
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
