
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, DollarSign, Shield, Star } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface StyleBookingProps {
  serviceId: string
  professionalId: string
  analysisId: string
  matchScore: number
  service: {
    name: string
    price: number
    duration: number
  }
  professional: {
    name: string
    businessName: string
    city?: string
  }
  onBookingComplete: (booking: any) => void
  onCancel: () => void
}

export function StyleBooking({ 
  serviceId, 
  professionalId, 
  analysisId,
  matchScore,
  service, 
  professional, 
  onBookingComplete, 
  onCancel 
}: StyleBookingProps) {
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  })
  const [styleGuarantee, setStyleGuarantee] = useState(true)
  const [isBooking, setIsBooking] = useState(false)

  const basePrice = service.price
  const guaranteeFee = styleGuarantee ? basePrice * 0.15 : 0
  const totalPrice = basePrice + guaranteeFee

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBooking = async () => {
    // Validation
    if (!formData.scheduledDate || !formData.scheduledTime || !formData.address || !formData.city || !formData.zipCode) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsBooking(true)
    try {
      const response = await fetch('/api/bookings/style-guarantee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceId,
          professionalId,
          styleAnalysisId: analysisId,
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          notes: formData.notes,
          styleGuarantee
        })
      })

      if (!response.ok) {
        throw new Error('Booking failed')
      }

      const result = await response.json()
      toast.success('Style booking confirmed!')
      onBookingComplete(result)
    } catch (error) {
      toast.error('Booking failed. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  return (
    <div className="space-y-6">
      {/* Booking Header */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{service.name}</h3>
            <p className="text-sm text-gray-600">{professional.businessName}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={`${getScoreColor(matchScore)} text-white text-xs`}>
                {matchScore}% Style Match
              </Badge>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{service.duration} min</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-600">${totalPrice.toFixed(2)}</p>
            {styleGuarantee && (
              <p className="text-sm text-gray-500">includes ${guaranteeFee.toFixed(2)} guarantee</p>
            )}
          </div>
        </div>
      </Card>

      {/* Style Guarantee */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className={`h-5 w-5 ${styleGuarantee ? 'text-green-500' : 'text-gray-400'}`} />
            <div>
              <h4 className="font-medium">Style Guarantee (+15%)</h4>
              <p className="text-sm text-gray-600">
                Satisfaction guaranteed or get your money back
              </p>
            </div>
          </div>
          <Switch
            checked={styleGuarantee}
            onCheckedChange={setStyleGuarantee}
          />
        </div>
        
        {styleGuarantee && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ If the final result doesn't match your style expectations, we'll refund the full amount
            </p>
          </div>
        )}
      </Card>

      {/* Booking Form */}
      <Card className="p-4 space-y-4">
        <h4 className="font-medium flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Your Appointment
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
          <div>
            <Label htmlFor="time">Time *</Label>
            <Input
              id="time"
              type="time"
              value={formData.scheduledTime}
              onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
            />
          </div>
        </div>

        <h4 className="font-medium flex items-center pt-2">
          <MapPin className="h-4 w-4 mr-2" />
          Service Location
        </h4>

        <div className="space-y-3">
          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              placeholder="123 Main Street"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="Miami"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="FL"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                placeholder="33101"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Special Requests</Label>
          <Textarea
            id="notes"
            placeholder="Any special requests or notes for the professional..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </div>
      </Card>

      {/* Pricing Breakdown */}
      <Card className="p-4">
        <h4 className="font-medium flex items-center mb-3">
          <DollarSign className="h-4 w-4 mr-2" />
          Pricing Breakdown
        </h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{service.name}</span>
            <span>${basePrice.toFixed(2)}</span>
          </div>
          
          {styleGuarantee && (
            <div className="flex justify-between text-green-600">
              <span>Style Guarantee (15%)</span>
              <span>+${guaranteeFee.toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total Amount</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Payment will be collected in cash at the time of service
          </p>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleBooking}
          disabled={isBooking}
          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          {isBooking ? 'Booking...' : `Confirm Booking - $${totalPrice.toFixed(2)}`}
        </Button>
      </div>
    </div>
  )
}
