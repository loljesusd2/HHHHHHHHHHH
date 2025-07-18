
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/academy/courses - Lista de cursos con filtros
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const featured = searchParams.get('featured') === 'true'
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      isActive: true,
      publishedAt: { not: null }
    }

    if (category) {
      where.category = category
    }

    if (level) {
      where.level = level
    }

    if (featured) {
      where.isFeatured = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }

    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where,
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
                  averageRating: true,
                  totalStudents: true
                }
              }
            }
          },
          modules: {
            select: {
              id: true,
              title: true,
              order: true,
              duration: true,
              lessons: {
                select: {
                  id: true,
                  title: true,
                  duration: true,
                  isFree: true
                }
              }
            },
            orderBy: { order: 'asc' }
          },
          _count: {
            select: {
              enrollments: true,
              reviews: true
            }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.course.count({ where })
    ])

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/academy/courses - Crear nuevo curso (solo instructores)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      level,
      price,
      originalPrice,
      duration,
      thumbnailUrl,
      previewVideoUrl,
      syllabus,
      tags,
      badges,
      requirements,
      skillsYouWillLearn
    } = body

    // Verificar si el usuario es instructor
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!instructorProfile) {
      return NextResponse.json({ error: 'Instructor profile required' }, { status: 403 })
    }

    const course = await prisma.course.create({
      data: {
        instructorId: session.user.id,
        title,
        description,
        category,
        level,
        price,
        originalPrice,
        duration,
        thumbnailUrl,
        previewVideoUrl,
        syllabus,
        tags,
        badges,
        requirements,
        skillsYouWillLearn,
        publishedAt: new Date()
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

    // Actualizar stats del instructor
    await prisma.instructorProfile.update({
      where: { userId: session.user.id },
      data: {
        totalCourses: { increment: 1 }
      }
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
