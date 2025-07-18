
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Zap, Star, MapPin, Users, Percent } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useFlashDeals } from '@/hooks/use-flash-deals'
import { FlashDealWithTimeRemaining } from '@/hooks/use-flash-deals'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'

interface FlashDealTimerProps {
  deal?: FlashDealWithTimeRemaining
  onUseDeal?: (dealId: string) => void
  compact?: boolean
  showExpired?: boolean
}

export function FlashDealTimer({ deal, onUseDeal, compact = false, showExpired = false }: FlashDealTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number
    minutes: number
    seconds: number
  }>({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!deal) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const endTime = new Date(deal.endTime).getTime()
      const difference = endTime - now

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ hours, minutes, seconds })
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)

    return () => clearInterval(timer)
  }, [deal])

  if (!deal) return null

  const isExpired = timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0
  const isAlmostExpired = timeLeft.hours === 0 && timeLeft.minutes < 30
  const usagePercentage = (deal.currentUses / deal.maxUses) * 100

  if (isExpired && !showExpired) return null

  if (compact) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative overflow-hidden rounded-lg border-2 ${
          isExpired ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50'
        }`}
      >
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <Badge className={`${isExpired ? 'bg-gray-400' : 'bg-red-500'} text-white`}>
              <Zap className="w-3 h-3 mr-1" />
              {deal.discount}% OFF
            </Badge>
            <div className="flex items-center gap-1 text-xs">
              <Clock className="w-3 h-3" />
              <span className={`font-mono ${isAlmostExpired ? 'text-red-600' : 'text-gray-600'}`}>
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
          
          <h4 className="font-medium text-gray-800 text-sm line-clamp-1">
            {deal.service.name}
          </h4>
          <p className="text-xs text-gray-500 line-clamp-1">
            {deal.service.professional?.businessName}
          </p>
          
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              {deal.usesRemaining} left
            </div>
            {!isExpired && onUseDeal && (
              <Button
                size="sm"
                onClick={() => onUseDeal(deal.id)}
                className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1 h-6"
              >
                Use Deal
              </Button>
            )}
          </div>
        </div>
        
        {!isExpired && (
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-red-500">
            <Zap className="w-3 h-3 text-white absolute -top-4 -right-4" />
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`relative overflow-hidden ${
        isExpired ? 'border-gray-200' : 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center gap-2 ${
              isExpired ? 'text-gray-600' : 'text-red-700'
            }`}>
              <Zap className="w-5 h-5" />
              Flash Deal {isExpired && '(Expired)'}
            </CardTitle>
            <Badge className={`${isExpired ? 'bg-gray-400' : 'bg-red-500'} text-white text-lg px-3 py-1`}>
              <Percent className="w-4 h-4 mr-1" />
              {deal.discount}% OFF
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Timer */}
          <div className={`text-center p-4 rounded-lg ${
            isExpired ? 'bg-gray-100' : 'bg-white/70'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className={`w-5 h-5 ${isExpired ? 'text-gray-400' : 'text-red-600'}`} />
              <span className={`text-sm font-medium ${
                isExpired ? 'text-gray-600' : 'text-red-700'
              }`}>
                {isExpired ? 'Expired' : 'Time Remaining'}
              </span>
            </div>
            
            {!isExpired && (
              <div className="flex items-center justify-center gap-2">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    isAlmostExpired ? 'text-red-600' : 'text-gray-800'
                  }`}>
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">hours</div>
                </div>
                <div className="text-2xl font-bold text-gray-400">:</div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    isAlmostExpired ? 'text-red-600' : 'text-gray-800'
                  }`}>
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">minutes</div>
                </div>
                <div className="text-2xl font-bold text-gray-400">:</div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    isAlmostExpired ? 'text-red-600' : 'text-gray-800'
                  }`}>
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">seconds</div>
                </div>
              </div>
            )}
          </div>

          {/* Service Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
              {deal.service.images?.[0] ? (
                <img
                  src={deal.service.images[0]}
                  alt={deal.service.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Zap className="w-8 h-8 text-amber-600" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 text-lg">{deal.service.name}</h4>
              <p className="text-gray-600">{deal.service.professional?.businessName}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {deal.neighborhood}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {deal.service.professional?.averageRating?.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between p-4 bg-white/70 rounded-lg">
            <div>
              <div className="text-sm text-gray-500">Regular Price</div>
              <div className="text-lg text-gray-400 line-through">${deal.service.price}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Flash Deal Price</div>
              <div className="text-2xl font-bold text-green-600">
                ${(deal.service.price * (1 - deal.discount / 100)).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Deal Usage</span>
              <span className="text-gray-800 font-medium">
                {deal.currentUses} of {deal.maxUses} used
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{deal.usesRemaining} spots remaining</span>
            </div>
          </div>

          {/* Action Button */}
          {!isExpired && onUseDeal && (
            <Button
              onClick={() => onUseDeal(deal.id)}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Use Flash Deal - Save ${(deal.service.price * (deal.discount / 100)).toFixed(2)}
            </Button>
          )}
        </CardContent>
        
        {!isExpired && (
          <div className="absolute top-0 right-0">
            <div className="w-0 h-0 border-l-[40px] border-l-transparent border-b-[40px] border-b-red-500" />
            <div className="absolute top-2 right-2 text-white">
              <Zap className="w-5 h-5" />
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

// Component to show all active flash deals
export function FlashDealsGrid({ neighborhood, category, limit = 6 }: {
  neighborhood?: string
  category?: string
  limit?: number
}) {
  const { deals, loading, error, useDeal } = useFlashDeals({ neighborhood, category })

  const handleUseDeal = async (dealId: string) => {
    try {
      await useDeal(dealId)
      // Show success message or redirect to booking
    } catch (error) {
      console.error('Error using flash deal:', error)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(limit)].map((_, i) => (
          <FlashDealTimerSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error || deals.length === 0) {
    return (
      <div className="text-center py-8">
        <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No active flash deals</p>
        <p className="text-sm text-gray-400">Check back later for amazing deals!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {deals.slice(0, limit).map((deal) => (
        <FlashDealTimer
          key={deal.id}
          deal={deal}
          onUseDeal={handleUseDeal}
          compact
        />
      ))}
    </div>
  )
}

function FlashDealTimerSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <EnhancedSkeleton className="h-6 w-20 rounded-full" />
          <EnhancedSkeleton className="h-4 w-16" />
        </div>
        <EnhancedSkeleton className="h-4 w-full mb-1" />
        <EnhancedSkeleton className="h-3 w-3/4 mb-2" />
        <div className="flex items-center justify-between">
          <EnhancedSkeleton className="h-3 w-16" />
          <EnhancedSkeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  )
}
