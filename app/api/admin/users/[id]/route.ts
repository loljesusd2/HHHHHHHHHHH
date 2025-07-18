
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
    
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      )
    }

    const { verificationStatus, notes } = await request.json()

    if (!verificationStatus || !['UNVERIFIED', 'PENDING', 'APPROVED', 'REJECTED'].includes(verificationStatus)) {
      return NextResponse.json(
        { error: 'Estado de verificación inválido' },
        { status: 400 }
      )
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        verificationStatus,
        verificationNotes: notes,
        verifiedAt: verificationStatus === 'APPROVED' ? new Date() : null
      },
      include: {
        professionalProfile: true
      }
    })

    // Crear notificación para el usuario
    let notificationTitle = ''
    let notificationMessage = ''

    switch (verificationStatus) {
      case 'APPROVED':
        notificationTitle = 'Verificación Aprobada'
        notificationMessage = 'Tu cuenta profesional ha sido verificada exitosamente'
        break
      case 'REJECTED':
        notificationTitle = 'Verificación Rechazada'
        notificationMessage = `Tu verificación ha sido rechazada. ${notes ? `Razón: ${notes}` : ''}`
        break
      case 'PENDING':
        notificationTitle = 'Verificación en Revisión'
        notificationMessage = 'Tu verificación está siendo revisada por nuestro equipo'
        break
    }

    if (notificationTitle) {
      await prisma.notification.create({
        data: {
          userId: params.id,
          title: notificationTitle,
          message: notificationMessage,
          type: verificationStatus === 'APPROVED' 
            ? 'VERIFICATION_APPROVED' 
            : 'VERIFICATION_REJECTED'
        }
      })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser()
    
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      )
    }

    // Verificar que no se esté eliminando a sí mismo
    if (authUser.userId === params.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      )
    }

    // Eliminar usuario (las relaciones se eliminan en cascada según el schema)
    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Usuario eliminado exitosamente' })
  } catch (error) {
    console.error('Admin user delete error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
