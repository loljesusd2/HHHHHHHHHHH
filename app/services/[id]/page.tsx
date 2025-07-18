
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Star, MapPin, Clock, Phone, Heart, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Service, Review } from '@/lib/types'
import Image from 'next/image'

interface ServiceWithReviews extends Service {
  reviews: (Review & {
    reviewer: {
      id: string
      name: string
      avatar?: string
    }
  })[]
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [service, setService] = useState<ServiceWithReviews | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchService(params.id as string)
    }
  }, [params.id])

  const fetchService = async (id: string) => {
    try {
      const response = await fetch(`/api/services/${id}`)
      if (response.ok) {
        const data = await response.json()
        setService(data)
      }
    } catch (error) {
      console.error('Error fetching service:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookNow = () => {
    router.push(`/booking/${service?.id}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="p-4 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Service not found</h2>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const images = service.images && service.images.length > 0 ? service.images : ['https://i.pinimg.com/originals/1d/4f/d5/1d4fd563760f4009512a009e0e138f60.jpg']

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      {/* Header */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm"
        >
          <ArrowLeft size={20} />
        </Button>
        
        {/* Image Gallery */}
        <div className="relative h-64 bg-gray-200">
          <Image
            src={images[selectedImageIndex]}
            alt={service.name}
            fill
            className="object-cover"
          />
          
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Service Info */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{service.name}</h1>
                <div className="flex items-center gap-4 mb-3">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    ${service.price}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Clock size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">{service.duration} min</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Heart size={20} className="text-gray-400" />
              </Button>
            </div>
            
            <p className="text-gray-600 mb-4">{service.description}</p>
            
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">
                {service.professional?.averageRating?.toFixed(1) || '5.0'}
              </span>
              <span className="text-gray-500">
                ({service.professional?.totalReviews || 0} reviews)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Professional Info */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={service.professional?.user?.avatar} />
                <AvatarFallback className="text-lg">
                  {service.professional?.user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{service.professional?.businessName}</h3>
                <p className="text-gray-600">{service.professional?.user?.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {service.professional?.city}, {service.professional?.state}
                  </span>
                </div>
              </div>
            </div>
            
            {service.professional?.bio && (
              <p className="text-gray-600 mb-4">{service.professional.bio}</p>
            )}
            
            <div className="flex gap-2">
              {service.professional?.user?.phone && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${service.professional.user.phone}`}>
                    <Phone size={16} className="mr-2" />
                    Contact
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <a href={`/professionals/${service.professional?.userId}`}>
                  View Profile
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        {service.reviews && service.reviews.length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Reviews</h3>
              <div className="space-y-4">
                {service.reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={review.reviewer.avatar} />
                        <AvatarFallback className="text-xs">
                          {review.reviewer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{review.reviewer.name}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other Services - Commented out for now due to type issues */}
        {/* Future enhancement: Add other services from the same professional */}
      </div>

      {/* Book Now Button */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[428px] p-4 bg-white border-t">
        <Button
          onClick={handleBookNow}
          variant="gradient"
          className="w-full h-12 text-lg"
        >
          <Calendar className="mr-2" size={20} />
          Book Now - ${service.price}
        </Button>
      </div>

      <div className="h-20"></div>
    </div>
  )
}
