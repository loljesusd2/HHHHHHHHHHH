
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      )
    }

    if (!['CLIENT', 'PROFESSIONAL'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        role,
        ...(role === 'CLIENT' && {
          clientProfile: {
            create: {
              preferences: []
            }
          }
        }),
        ...(role === 'PROFESSIONAL' && {
          professionalProfile: {
            create: {
              businessName: name,
              address: '',
              city: '',
              state: 'FL',
              zipCode: '',
              certifications: [],
              portfolio: [],
              workingHours: {
                monday: { start: '09:00', end: '17:00', available: true },
                tuesday: { start: '09:00', end: '17:00', available: true },
                wednesday: { start: '09:00', end: '17:00', available: true },
                thursday: { start: '09:00', end: '17:00', available: true },
                friday: { start: '09:00', end: '17:00', available: true },
                saturday: { start: '10:00', end: '16:00', available: true },
                sunday: { start: '10:00', end: '16:00', available: false }
              }
            }
          }
        })
      },
      include: {
        clientProfile: true,
        professionalProfile: true,
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
