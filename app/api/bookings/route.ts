export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { PrismaTransaction } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const {
      serviceId,
      scheduledDate,
      scheduledTime,
      address,
      city,
      state,
      zipCode,
      notes
    } = await request.json()

    if (!serviceId || !scheduledDate || !scheduledTime || !address || !city || !zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { professional: true }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    const totalAmount = service.price
    const platformFee = totalAmount * 0.2
    const professionalAmount = totalAmount - platformFee

    // Create booking and payment in a transaction
    const result = await prisma.$transaction(async (tx: PrismaTransaction) => {
      // Create booking
      const booking = await tx.booking.create({
        data: {
          clientId: authUser.userId,
          professionalId: service.professional.userId,
          serviceId: service.id,
          scheduledDate: new Date(scheduledDate),
          scheduledTime,
          totalAmount,
          address,
          city,
          state,
          zipCode,
          notes: notes || '',
          status: 'CONFIRMED'
        }
      })

      // Create payment record (cash payment - to be collected in person)
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          userId: authUser.userId,
          amount: totalAmount,
          platformFee,
          professionalAmount,
          paymentMethod: 'CASH',
          status: 'PENDING' // Payment will be collected in person
        }
      })

      return { booking, payment }
    })

    // Create notifications
    await prisma.notification.create({
      data: {
        userId: service.professional.userId,
        title: 'New Booking Request',
        message: `You have a new booking for ${service.name}`,
        type: 'BOOKING_REQUEST'
      }
    })

    await prisma.notification.create({
      data: {
        userId: authUser.userId,
        title: 'Booking Confirmed',
        message: `Your booking for ${service.name} has been confirmed`,
        type: 'BOOKING_CONFIRMED'
      }
    })

    return NextResponse.json({
      message: 'Booking created successfully',
      booking: result.booking,
      payment: result.payment
    })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}
    
    if (authUser.role === 'CLIENT') {
      where.clientId = authUser.userId
    } else if (authUser.role === 'PROFESSIONAL') {
      where.professionalId = authUser.userId
    }

    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true
          }
        },
        professional: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true
          }
        },
        payment: true,
        review: true
      },
      orderBy: { scheduledDate: 'desc' }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Bookings fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
