
export const dynamic = "force-dynamic";

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
      professionalId,
      styleAnalysisId,
      scheduledDate,
      scheduledTime,
      address,
      city,
      state,
      zipCode,
      notes,
      styleGuarantee = true
    } = await request.json()

    if (!serviceId || !professionalId || !styleAnalysisId || !scheduledDate || !scheduledTime || !address || !city || !zipCode) {
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

    // Get style analysis for match score
    const analysis = await prisma.styleAnalysis.findUnique({
      where: { id: styleAnalysisId }
    })

    if (!analysis) {
      return NextResponse.json(
        { error: 'Style analysis not found' },
        { status: 404 }
      )
    }

    // Calculate total amount with style guarantee fee (+15%)
    const baseAmount = service.price
    const guaranteeFee = styleGuarantee ? baseAmount * 0.15 : 0
    const totalAmount = baseAmount + guaranteeFee
    const platformFee = totalAmount * 0.2
    const professionalAmount = totalAmount - platformFee

    // Get match score from analysis top matches
    const topMatches = analysis.topMatches as any[]
    const matchData = topMatches?.find(m => m.professionalId === service.professionalId)
    const styleMatchScore = matchData?.score || 0

    // Create booking and payment in a transaction
    const result = await prisma.$transaction(async (tx: PrismaTransaction) => {
      // Create booking with style guarantee
      const booking = await tx.booking.create({
        data: {
          clientId: authUser.userId,
          professionalId: professionalId,
          serviceId: service.id,
          styleAnalysisId: styleAnalysisId,
          styleGuarantee: styleGuarantee,
          styleMatchScore: styleMatchScore,
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

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          userId: authUser.userId,
          amount: totalAmount,
          platformFee,
          professionalAmount,
          paymentMethod: 'CASH',
          status: 'PENDING'
        }
      })

      return { booking, payment }
    })

    // Create notifications
    await prisma.notification.create({
      data: {
        userId: professionalId,
        title: 'New Style Guarantee Booking',
        message: `New style guarantee booking for ${service.name} with ${styleMatchScore}% match score`,
        type: 'BOOKING_REQUEST'
      }
    })

    await prisma.notification.create({
      data: {
        userId: authUser.userId,
        title: 'Style Guarantee Booking Confirmed',
        message: `Your style guarantee booking has been confirmed. Total: $${totalAmount.toFixed(2)}`,
        type: 'BOOKING_CONFIRMED'
      }
    })

    return NextResponse.json({
      message: 'Style guarantee booking created successfully',
      booking: result.booking,
      payment: result.payment,
      guaranteeFee: guaranteeFee,
      matchScore: styleMatchScore
    })

  } catch (error) {
    console.error('Style guarantee booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
