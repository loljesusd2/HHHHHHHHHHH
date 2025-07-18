
'use client'

import { useEffect, useState } from 'react'
import { Calendar, DollarSign, Star, Users, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { AuthGuard } from '@/components/auth-guard'
import { Booking, BOOKING_STATUS_LABELS } from '@/lib/types'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    totalBookings: 0,
    averageRating: 0,
    totalReviews: 0,
    pendingBookings: 0
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, bookingsResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/bookings?limit=5')
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        setRecentBookings(bookingsData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'CONFIRMED':
        return 'default'
      case 'COMPLETED':
        return 'success'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  return (
    <AuthGuard allowedRoles={['PROFESSIONAL']}>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Panel Profesional</h1>
          <p className="text-gray-600">Gestiona tus servicios de belleza y citas</p>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="beauty-gradient p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ganancias Totales</p>
                  <p className="text-xl font-bold text-gray-800">
                    ${stats.totalEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Este Mes</p>
                  <p className="text-xl font-bold text-gray-800">
                    ${stats.monthlyEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Citas</p>
                  <p className="text-xl font-bold text-gray-800">{stats.totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 p-2 rounded-lg">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Calificación</p>
                  <p className="text-xl font-bold text-gray-800">
                    {stats.averageRating.toFixed(1)} ⭐
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-600 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reseñas</p>
                  <p className="text-xl font-bold text-gray-800">{stats.totalReviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-xl font-bold text-gray-800">{stats.pendingBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/services/manage">
                <Button variant="outline" className="w-full h-12">
                  Gestionar Servicios
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="outline" className="w-full h-12">
                  Ver Calendario
                </Button>
              </Link>
              <Link href="/earnings">
                <Button variant="outline" className="w-full h-12">
                  Reporte de Ganancias
                </Button>
              </Link>
              <Link href="/profile/edit">
                <Button variant="outline" className="w-full h-12">
                  Editar Perfil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Citas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay citas recientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={booking.client?.avatar} />
                      <AvatarFallback>
                        {booking.client?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">{booking.service?.name}</h4>
                      <p className="text-sm text-gray-600">{booking.client?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusColor(booking.status) as any}>
                        {BOOKING_STATUS_LABELS[booking.status as keyof typeof BOOKING_STATUS_LABELS]}
                      </Badge>
                      <p className="text-sm font-medium text-amber-700 mt-1">
                        ${booking.totalAmount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

          {/* Back to Profile */}
          <div className="mt-6 text-center">
            <Link href="/profile">
              <Button variant="outline">Back to Profile</Button>
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
