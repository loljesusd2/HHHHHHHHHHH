
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/academy/stats - Estadísticas de Academy
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'user' // 'user' | 'instructor' | 'global'

    if (type === 'user') {
      // Estadísticas del usuario
      const [enrollments, completedCourses, totalWatchTime, certifications] = await Promise.all([
        prisma.courseEnrollment.count({
          where: {
            userId: session.user.id,
            paymentStatus: 'COMPLETED'
          }
        }),
        prisma.courseEnrollment.count({
          where: {
            userId: session.user.id,
            paymentStatus: 'COMPLETED',
            isCompleted: true
          }
        }),
        prisma.courseProgress.aggregate({
          where: { userId: session.user.id },
          _sum: { watchTime: true }
        }),
        prisma.academyCertification.count({
          where: { userId: session.user.id }
        })
      ])

      const totalSpent = await prisma.courseEnrollment.aggregate({
        where: {
          userId: session.user.id,
          paymentStatus: 'COMPLETED'
        },
        _sum: { amount: true }
      })

      return NextResponse.json({
        totalEnrollments: enrollments,
        coursesCompleted: completedCourses,
        totalWatchTimeHours: Math.round((totalWatchTime._sum.watchTime || 0) / 3600),
        certificationsEarned: certifications,
        totalSpent: totalSpent._sum.amount || 0,
        completionRate: enrollments > 0 ? Math.round((completedCourses / enrollments) * 100) : 0
      })
    } else if (type === 'instructor') {
      // Estadísticas del instructor
      const instructorProfile = await prisma.instructorProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!instructorProfile) {
        return NextResponse.json({ error: 'Not an instructor' }, { status: 403 })
      }

      const [courses, totalStudents, totalRevenue, avgRating] = await Promise.all([
        prisma.course.count({
          where: {
            instructorId: session.user.id,
            isActive: true
          }
        }),
        prisma.courseEnrollment.count({
          where: {
            course: { instructorId: session.user.id },
            paymentStatus: 'COMPLETED'
          }
        }),
        prisma.courseEnrollment.aggregate({
          where: {
            course: { instructorId: session.user.id },
            paymentStatus: 'COMPLETED'
          },
          _sum: { amount: true }
        }),
        prisma.courseReview.aggregate({
          where: {
            course: { instructorId: session.user.id }
          },
          _avg: { rating: true }
        })
      ])

      return NextResponse.json({
        totalCourses: courses,
        totalStudents,
        totalRevenue: totalRevenue._sum.amount || 0,
        averageRating: avgRating._avg.rating || 0,
        totalEarnings: instructorProfile.totalEarnings
      })
    } else if (type === 'global') {
      // Estadísticas globales de Academy
      const [totalCourses, totalStudents, totalRevenue, avgRating] = await Promise.all([
        prisma.course.count({
          where: {
            isActive: true,
            publishedAt: { not: null }
          }
        }),
        prisma.courseEnrollment.count({
          where: { paymentStatus: 'COMPLETED' }
        }),
        prisma.courseEnrollment.aggregate({
          where: { paymentStatus: 'COMPLETED' },
          _sum: { amount: true }
        }),
        prisma.courseReview.aggregate({
          _avg: { rating: true }
        })
      ])

      const totalInstructors = await prisma.instructorProfile.count({
        where: { isActive: true }
      })

      const totalCertifications = await prisma.academyCertification.count()

      return NextResponse.json({
        totalCourses,
        totalStudents,
        totalInstructors,
        totalRevenue: totalRevenue._sum.amount || 0,
        averageRating: avgRating._avg.rating || 0,
        totalCertifications,
        conversionRate: totalCourses > 0 ? Math.round((totalStudents / totalCourses) * 100) : 0
      })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
