
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Award, 
  Shield, 
  Heart,
  Calendar,
  DollarSign,
  User,
  Camera,
  CheckCircle,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface ProfessionalProfile {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  verificationStatus: string
  profile: {
    businessName: string
    bio?: string
    address: string
    city: string
    state: string
    zipCode: string
    latitude?: number
    longitude?: number
    formattedAddress?: string
    serviceRadius: number
    mobileProfessional: boolean
    hasStudio: boolean
    yearsExperience?: number
    certifications: string[]
    portfolio: string[]
    workingHours: any
    averageRating: number
    totalReviews: number
    isVerified: boolean
    isActive: boolean
  }
  services: Array<{
    id: string
    name: string
    description: string
    category: string
    price: number
    duration: number
    images: string[]
    isActive: boolean
  }>
  reviews: Array<{
    id: string
    rating: number
    comment?: string
    images: string[]
    createdAt: string
    reviewer: {
      id: string
      name: string
      avatar?: string
    }
    booking: {
      service: {
        name: string
      }
    }
  }>
  stats: {
    totalBookings: number
    totalEarnings: number
    averageRating: number
    totalReviews: number
  }
  upcomingBookings: Array<{
    date: string
    time: string
  }>
}

export default function ProfessionalProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [professional, setProfessional] = useState<ProfessionalProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchProfessionalProfile(params.id as string)
    }
  }, [params.id])

  const fetchProfessionalProfile = async (id: string) => {
    try {
      const response = await fetch(`/api/professionals/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProfessional(data)
      } else {
        console.error('Failed to fetch professional profile')
      }
    } catch (error) {
      console.error('Error fetching professional profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async () => {
    try {
      const response = await fetch('/api/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professionalId: professional?.id
        })
      })
      
      if (response.ok) {
        setIsFavorite(!isFavorite)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const formatWorkingHours = (workingHours: any) => {
    if (!workingHours) return 'Hours not specified'
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    return days.map((day, index) => {
      const hours = workingHours[day]
      if (!hours || !hours.available) {
        return `${dayNames[index]}: Closed`
      }
      return `${dayNames[index]}: ${hours.start} - ${hours.end}`
    }).join('\n')
  }

  if (isLoading) {
    return <ProfessionalProfileSkeleton />
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Professional Not Found</h2>
            <p className="text-gray-600 mb-4">The professional profile you're looking for doesn't exist.</p>
            <Button onClick={() => router.back()} className="bg-amber-600 hover:bg-amber-700">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFavorite}
            className="text-white hover:bg-white/20"
          >
            <Heart 
              size={20} 
              className={isFavorite ? "fill-current" : ""} 
            />
          </Button>
        </div>
      </div>

      <div className="px-4 pb-20">
        {/* Professional Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="-mt-8"
        >
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={professional.avatar} />
                    <AvatarFallback className="text-xl">
                      {professional.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {professional.profile.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-800">{professional.profile.businessName}</h1>
                  <p className="text-gray-600">{professional.name}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{professional.profile.averageRating.toFixed(1)}</span>
                      <span className="text-gray-500">({professional.profile.totalReviews} reviews)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1 text-gray-600">
                    <MapPin size={14} />
                    <span className="text-sm">{professional.profile.city}, {professional.profile.state}</span>
                  </div>
                  
                  {professional.profile.yearsExperience && (
                    <div className="flex items-center gap-1 mt-1 text-gray-600">
                      <Award size={14} />
                      <span className="text-sm">{professional.profile.yearsExperience} years experience</span>
                    </div>
                  )}
                </div>
              </div>

              {professional.profile.bio && (
                <div className="mt-4">
                  <p className="text-gray-700">{professional.profile.bio}</p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Badge variant="outline" className="border-green-200 text-green-700">
                  {professional.profile.mobileProfessional ? 'Mobile Service' : 'Studio Only'}
                </Badge>
                {professional.profile.hasStudio && (
                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                    Has Studio
                  </Badge>
                )}
                {professional.profile.isVerified && (
                  <Badge variant="outline" className="border-amber-200 text-amber-700">
                    <Shield size={12} className="mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mt-6"
        >
          {professional.services.length > 0 && (
            <Link href={`/booking/${professional.services[0].id}`}>
              <Button className="w-full bg-amber-600 hover:bg-amber-700">
                <Calendar size={16} className="mr-2" />
                Book Now
              </Button>
            </Link>
          )}
          {professional.phone && (
            <Button variant="outline" className="w-full" asChild>
              <a href={`tel:${professional.phone}`}>
                <Phone size={16} className="mr-2" />
                Call
              </a>
            </Button>
          )}
        </motion.div>

        {/* Tabs Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-4">
              {professional.services.map((service) => (
                <Card key={service.id} className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{service.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-amber-600">
                            <DollarSign size={16} />
                            <span className="font-semibold">{service.price}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock size={16} />
                            <span className="text-sm">{service.duration} min</span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/booking/${service.id}`}>
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                          Book
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="space-y-4">
              {professional.profile.portfolio.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {professional.profile.portfolio.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <Image
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="bg-white">
                  <CardContent className="p-8 text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No portfolio images available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4">
              {professional.reviews.length > 0 ? (
                professional.reviews.map((review) => (
                  <Card key={review.id} className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.reviewer.avatar} />
                          <AvatarFallback>
                            {review.reviewer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-800">{review.reviewer.name}</h4>
                            <span className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Service: {review.booking.service.name}
                          </p>
                          {review.comment && (
                            <p className="text-gray-700 mt-2">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white">
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No reviews yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {professional.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-gray-500" />
                      <span>{professional.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-500" />
                    <span>{professional.email}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-500 mt-1" />
                    <div>
                      <p>{professional.profile.address}</p>
                      <p>{professional.profile.city}, {professional.profile.state} {professional.profile.zipCode}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Working Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-gray-700 whitespace-pre-line">
                    {formatWorkingHours(professional.profile.workingHours)}
                  </pre>
                </CardContent>
              </Card>

              {professional.profile.certifications.length > 0 && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {professional.profile.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Award size={16} className="text-amber-600" />
                          <span className="text-gray-700">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

function ProfessionalProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-20 bg-white/20" />
          <Skeleton className="h-8 w-8 bg-white/20" />
        </div>
      </div>

      <div className="px-4 pb-20">
        <div className="-mt-8">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
              <Skeleton className="h-16 w-full mt-4" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>

        <div className="mt-6 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
}
