
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { status } = await request.json()
    
    if (!status || !['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    // Verificar que el booking existe y pertenece al profesional
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        client: true,
        payment: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el usuario es el profesional de esta cita
    if (booking.professionalId !== authUser.userId) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar esta cita' },
        { status: 403 }
      )
    }

    // Actualizar el estado del booking
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
      include: {
        service: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        payment: true
      }
    })

    // Si se marca como completado, crear/actualizar el pago
    if (status === 'COMPLETED' && !booking.payment) {
      const platformFee = booking.totalAmount * 0.20 // 20% comisión
      const professionalAmount = booking.totalAmount - platformFee

      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          userId: booking.clientId,
          amount: booking.totalAmount,
          platformFee,
          professionalAmount,
          paymentMethod: 'CASH',
          status: 'COMPLETED'
        }
      })

      // Crear notificación para el cliente
      await prisma.notification.create({
        data: {
          userId: booking.clientId,
          title: 'Servicio Completado',
          message: `Tu servicio "${booking.service.name}" ha sido completado`,
          type: 'BOOKING_CONFIRMED'
        }
      })
    }

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
