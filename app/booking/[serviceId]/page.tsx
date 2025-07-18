
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Service } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [service, setService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [bookingData, setBookingData] = useState({
    address: '',
    city: '',
    state: 'FL',
    zipCode: '',
    notes: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (params.serviceId) {
      fetchService(params.serviceId as string)
    }
  }, [params.serviceId])

  const fetchService = async (id: string) => {
    try {
      const response = await fetch(`/api/services/${id}`)
      if (response.ok) {
        const data = await response.json()
        setService(data)
      }
    } catch (error) {
      console.error('Error fetching service:', error)
    }
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  const generateDateOptions = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !bookingData.address || !bookingData.city || !bookingData.zipCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service?.id,
          scheduledDate: selectedDate,
          scheduledTime: selectedTime,
          address: bookingData.address,
          city: bookingData.city,
          state: bookingData.state,
          zipCode: bookingData.zipCode,
          notes: bookingData.notes
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Booking Confirmed!",
          description: "Your appointment has been successfully booked. Payment will be collected in cash at the time of service.",
        })
        router.push(`/bookings`)
      } else {
        toast({
          title: "Booking Failed",
          description: data.error || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  const platformFee = service.price * 0.2
  const totalAmount = service.price

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-semibold">Book Appointment</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Service Summary */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={service.professional?.user?.avatar} />
                <AvatarFallback>
                  {service.professional?.user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.professional?.businessName}</p>
                <div className="flex items-center gap-4 mt-1">
                  <Badge variant="secondary">${service.price}</Badge>
                  <span className="text-sm text-gray-500">{service.duration} min</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time Selection */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              Select Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a date</option>
                {generateDateOptions().map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Time</label>
              <div className="grid grid-cols-3 gap-2">
                {generateTimeSlots().map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                    className="text-sm"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin size={20} />
              Service Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Street Address</label>
              <Input
                placeholder="Enter your street address"
                value={bookingData.address}
                onChange={(e) => setBookingData({...bookingData, address: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">City</label>
                <Input
                  placeholder="City"
                  value={bookingData.city}
                  onChange={(e) => setBookingData({...bookingData, city: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">ZIP Code</label>
                <Input
                  placeholder="ZIP Code"
                  value={bookingData.zipCode}
                  onChange={(e) => setBookingData({...bookingData, zipCode: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">State</label>
              <select
                value={bookingData.state}
                onChange={(e) => setBookingData({...bookingData, state: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="FL">Florida</option>
                <option value="NY">New York</option>
                <option value="CA">California</option>
                <option value="TX">Texas</option>
                <option value="IL">Illinois</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Notes (Optional)</label>
              <Input
                placeholder="Any special requests or notes"
                value={bookingData.notes}
                onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={20} />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Service Fee</span>
                <span>${service.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Platform Fee (included)</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total (Cash)</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-700 bg-amber-50 p-3 rounded-md border border-amber-200">
              <div className="font-medium text-amber-800 mb-2">💰 Cash Payment</div>
              <p>✓ Payment will be collected in cash at the time of service</p>
              <p>✓ Please have exact amount ready</p>
              <p>✓ No credit card required - book now, pay later</p>
              <p>✓ Secure booking confirmation</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Book Button */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[428px] p-4 bg-white border-t">
        <Button
          onClick={handleBooking}
          className="w-full h-12 text-lg bg-amber-600 hover:bg-amber-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Booking..." : `Book Appointment - $${totalAmount.toFixed(2)} Cash`}
        </Button>
      </div>
    </div>
  )
}
