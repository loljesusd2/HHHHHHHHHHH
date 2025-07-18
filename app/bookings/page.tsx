
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, User, MapPin, CheckCircle, XCircle, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BottomNavigation } from '@/components/bottom-navigation'
import { AuthGuard } from '@/components/auth-guard'
import { useToast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

interface Booking {
  id: string
  scheduledDate: string
  scheduledTime: string
  status: string
  totalAmount: number
  notes?: string
  address: string
  city: string
  state: string
  zipCode: string
  service: {
    name: string
    duration: number
    category: string
  }
  client: {
    name: string
    email: string
    phone?: string
    avatar?: string
  }
  professional: {
    name: string
    email: string
    phone?: string
    avatar?: string
  }
  payment?: {
    status: string
    professionalAmount: number
  }
}

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No Asistió'
}

const STATUS_COLORS = {
  PENDING: 'warning',
  CONFIRMED: 'default',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
  NO_SHOW: 'secondary'
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [userRole, setUserRole] = useState<string>('')
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchBookings()
    fetchUserRole()
  }, [])

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUserRole(userData.role)
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }

  useEffect(() => {
    filterBookings()
  }, [bookings, statusFilter])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las citas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterBookings = () => {
    if (statusFilter === 'all') {
      setFilteredBookings(bookings)
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === statusFilter))
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedBooking = await response.json()
        setBookings(prev => 
          prev.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: newStatus }
              : booking
          )
        )
        toast({
          title: "Estado actualizado",
          description: `Cita marcada como ${STATUS_LABELS[newStatus as keyof typeof STATUS_LABELS]}`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "No se pudo actualizar el estado",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getActionButtons = (booking: Booking) => {
    // Only professionals can change booking status
    if (userRole !== 'PROFESSIONAL') {
      return null
    }
    
    switch (booking.status) {
      case 'PENDING':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle size={16} className="mr-1" />
              Confirmar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                  <XCircle size={16} className="mr-1" />
                  Cancelar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cancelar cita?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. La cita será marcada como cancelada.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, mantener</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sí, cancelar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      case 'CONFIRMED':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => updateBookingStatus(booking.id, 'IN_PROGRESS')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play size={16} className="mr-1" />
              Iniciar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                  <XCircle size={16} className="mr-1" />
                  No asistió
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cliente no asistió?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Marca esta cita como "No asistió" si el cliente no se presentó.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => updateBookingStatus(booking.id, 'NO_SHOW')}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Marcar como no asistió
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      case 'IN_PROGRESS':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle size={16} className="mr-1" />
              Completar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
            >
              <Pause size={16} className="mr-1" />
              Pausar
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  return (
    <AuthGuard allowedRoles={['CLIENT', 'PROFESSIONAL']}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                <h1 className="text-xl font-bold">
                  {userRole === 'PROFESSIONAL' ? 'Gestión de Citas' : 'Mis Citas'}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Filter */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-amber-800">Filtrar por Estado</h3>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las citas</SelectItem>
                    <SelectItem value="PENDING">Pendientes</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmadas</SelectItem>
                    <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                    <SelectItem value="COMPLETED">Completadas</SelectItem>
                    <SelectItem value="CANCELLED">Canceladas</SelectItem>
                    <SelectItem value="NO_SHOW">No Asistieron</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <Card className="bg-white shadow-sm">
              <CardContent className="p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No hay citas {statusFilter !== 'all' ? STATUS_LABELS[statusFilter as keyof typeof STATUS_LABELS].toLowerCase() : ''}
                </h3>
                <p className="text-gray-500">
                  {statusFilter === 'all' 
                    ? 'Aún no tienes citas programadas'
                    : `No tienes citas ${STATUS_LABELS[statusFilter as keyof typeof STATUS_LABELS].toLowerCase()}`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={userRole === 'CLIENT' ? booking.professional.avatar : booking.client.avatar} />
                        <AvatarFallback className="bg-amber-100 text-amber-700">
                          {userRole === 'CLIENT' ? booking.professional.name.charAt(0) : booking.client.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {booking.service.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {booking.service.category} • {booking.service.duration} min
                            </p>
                          </div>
                          <Badge variant={STATUS_COLORS[booking.status as keyof typeof STATUS_COLORS] as any}>
                            {STATUS_LABELS[booking.status as keyof typeof STATUS_LABELS]}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User size={16} />
                            <span>
                              {userRole === 'CLIENT' 
                                ? `Profesional: ${booking.professional.name}` 
                                : `Cliente: ${booking.client.name}`
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={16} />
                            <span>{formatDate(booking.scheduledDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={16} />
                            <span>{booking.scheduledTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={16} />
                            <span>{booking.city}, {booking.state}</span>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mb-4 p-3 bg-amber-50 rounded-lg">
                            <p className="text-sm text-amber-800">
                              <strong>Notas:</strong> {booking.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold text-green-600">
                            ${booking.totalAmount.toFixed(2)}
                            {booking.payment && (
                              <span className="text-sm text-gray-500 ml-2">
                                (Tú recibes: ${booking.payment.professionalAmount.toFixed(2)})
                              </span>
                            )}
                          </div>
                          {getActionButtons(booking)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}
