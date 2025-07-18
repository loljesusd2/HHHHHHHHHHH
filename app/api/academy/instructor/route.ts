
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/academy/instructor - Obtener perfil de instructor
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get('instructorId')

    const targetId = instructorId || session.user.id

    const instructor = await prisma.user.findUnique({
      where: { id: targetId },
      include: {
        instructorProfile: true,
        instructorCourses: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                enrollments: true,
                reviews: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!instructor?.instructorProfile) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 })
    }

    // Calcular estadísticas
    const stats = {
      totalCourses: instructor.instructorCourses.length,
      totalStudents: instructor.instructorCourses.reduce(
        (acc, course) => acc + course._count.enrollments,
        0
      ),
      totalReviews: instructor.instructorCourses.reduce(
        (acc, course) => acc + course._count.reviews,
        0
      ),
      averageRating: instructor.instructorProfile.averageRating,
      totalEarnings: instructor.instructorProfile.totalEarnings
    }

    return NextResponse.json({
      instructor: {
        id: instructor.id,
        name: instructor.name,
        email: instructor.email,
        avatar: instructor.avatar,
        profile: instructor.instructorProfile,
        courses: instructor.instructorCourses,
        stats
      }
    })
  } catch (error) {
    console.error('Error fetching instructor:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/academy/instructor - Crear/actualizar perfil de instructor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      bio,
      specializations,
      yearsExperience,
      certifications,
      portfolioImages,
      instagram,
      youtube,
      website
    } = body

    const instructorProfile = await prisma.instructorProfile.upsert({
      where: { userId: session.user.id },
      update: {
        bio,
        specializations,
        yearsExperience,
        certifications,
        portfolioImages,
        instagram,
        youtube,
        website,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        bio,
        specializations,
        yearsExperience,
        certifications,
        portfolioImages,
        instagram,
        youtube,
        website
      }
    })

    return NextResponse.json(instructorProfile)
  } catch (error) {
    console.error('Error updating instructor profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
