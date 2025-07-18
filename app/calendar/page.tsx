
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, User, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { BottomNavigation } from '@/components/bottom-navigation'
import { AuthGuard } from '@/components/auth-guard'
import { useToast } from '@/hooks/use-toast'
import { BOOKING_STATUS_LABELS } from '@/lib/types'

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
  client?: {
    id: string
    name: string
    avatar?: string
    phone?: string
  }
  professional?: {
    id: string
    name: string
    avatar?: string
    professionalProfile: {
      businessName: string
    }
  }
  service: {
    id: string
    name: string
    duration: number
    category: string
  }
  payment?: {
    status: string
    cardLast4?: string
    cardBrand?: string
  }
}

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchBookings()
  }, [currentDate])

  const fetchBookings = async () => {
    try {
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      
      const response = await fetch(`/api/calendar?month=${month}&year=${year}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast({
        title: "Error",
        description: "Failed to load calendar data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return bookings.filter(booking => 
      booking.scheduledDate.split('T')[0] === dateStr
    )
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  const days = getDaysInMonth(currentDate)
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const selectedBookings = selectedDate ? getBookingsForDate(selectedDate) : []

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-4">
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
              <CalendarIcon className="w-6 h-6" />
              <h1 className="text-xl font-bold">Calendar</h1>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Calendar Navigation */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="text-amber-700 hover:bg-amber-50"
                >
                  <ChevronLeft size={20} />
                </Button>
                <CardTitle className="text-amber-800">{monthYear}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="text-amber-700 hover:bg-amber-50"
                >
                  <ChevronRight size={20} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="p-2"></div>
                  }
                  
                  const dayBookings = getBookingsForDate(day)
                  const isSelected = selectedDate?.toDateString() === day.toDateString()
                  const isToday = new Date().toDateString() === day.toDateString()
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        p-2 text-sm rounded-lg transition-colors relative
                        ${isSelected ? 'bg-amber-700 text-white' : 
                          isToday ? 'bg-amber-100 text-amber-800' : 
                          'hover:bg-amber-50 text-gray-700'}
                      `}
                    >
                      {day.getDate()}
                      {dayBookings.length > 0 && (
                        <div className={`
                          absolute bottom-1 right-1 w-2 h-2 rounded-full
                          ${isSelected ? 'bg-white' : 'bg-amber-600'}
                        `}></div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Bookings */}
          {selectedDate && (
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-amber-800">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No bookings for this date</p>
                ) : (
                  <div className="space-y-4">
                    {selectedBookings.map((booking) => (
                      <div key={booking.id} className="border border-amber-100 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-amber-700">
                              <Clock size={16} />
                              <span className="font-medium">{formatTime(booking.scheduledTime)}</span>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {BOOKING_STATUS_LABELS[booking.status as keyof typeof BOOKING_STATUS_LABELS]}
                            </Badge>
                          </div>
                          <span className="font-semibold text-amber-700">${booking.totalAmount}</span>
                        </div>

                        <h3 className="font-semibold text-gray-800 mb-2">{booking.service.name}</h3>
                        
                        {booking.client && (
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={booking.client.avatar} />
                              <AvatarFallback className="bg-amber-100 text-amber-700 text-sm">
                                {booking.client.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{booking.client.name}</p>
                              {booking.client.phone && (
                                <p className="text-xs text-gray-500">{booking.client.phone}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {booking.professional && (
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={booking.professional.avatar} />
                              <AvatarFallback className="bg-amber-100 text-amber-700 text-sm">
                                {booking.professional.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{booking.professional.professionalProfile.businessName}</p>
                              <p className="text-xs text-gray-500">{booking.professional.name}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPin size={14} />
                          <span>{booking.address}, {booking.city}, {booking.state}</span>
                        </div>

                        {booking.notes && (
                          <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                            {booking.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-700">
                  {bookings.filter(b => b.status === 'CONFIRMED').length}
                </div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-700">
                  {bookings.filter(b => b.status === 'PENDING').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}
