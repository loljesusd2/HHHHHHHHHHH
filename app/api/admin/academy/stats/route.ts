
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

    const [totalCourses, totalStudents, totalRevenue, averageRating] = await Promise.all([
      prisma.course.count(),
      prisma.courseEnrollment.count(),
      prisma.course.aggregate({
        _sum: {
          totalRevenue: true
        }
      }),
      prisma.course.aggregate({
        _avg: {
          averageRating: true
        }
      })
    ])

    const [coursesCompleted, certificationsEarned, activeSubscriptions] = await Promise.all([
      prisma.courseEnrollment.count({
        where: {
          isCompleted: true
        }
      }),
      prisma.academyCertification.count(),
      prisma.courseEnrollment.count({
        where: {
          paymentStatus: 'COMPLETED'
        }
      })
    ])

    return NextResponse.json({
      totalCourses,
      totalStudents,
      totalRevenue: totalRevenue._sum.totalRevenue || 0,
      averageRating: averageRating._avg.averageRating || 0,
      coursesCompleted,
      certificationsEarned,
      activeSubscriptions
    })
  } catch (error) {
    console.error('Error fetching academy stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
