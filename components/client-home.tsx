
'use client'

import { useEffect, useState } from 'react'
import { Search, MapPin, Star, Heart, Calendar, ArrowRight, Clock, User, Trophy, Zap, Sparkles, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  EnhancedSkeleton, 
  ServiceCardSkeleton, 
  ProfessionalCardSkeleton,
  BookingCardSkeleton,
  ListSkeleton 
} from '@/components/ui/enhanced-skeleton'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslations } from '@/lib/i18n-client'
import { LanguageSelector } from '@/components/language-selector'
import { PointsDisplay } from '@/components/gamification/points-display'
import { FlashDealsGrid } from '@/components/gamification/flash-deal-timer'

interface ClientDashboardData {
  upcomingBookings: any[]
  favorites: any[]
  featuredServices: any[]
  nearbyProfessionals: any[]
}

export function ClientHome() {
  const [dashboardData, setDashboardData] = useState<ClientDashboardData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const t = useTranslations()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/client')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/explore?search=${encodeURIComponent(searchQuery)}`
    }
  }

  if (isLoading) {
    return <ClientHomeSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header with Search */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('home.appName')}</h1>
            <p className="text-amber-100 text-sm">{t('home.welcomeClient')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-amber-100">
              <MapPin size={16} />
              <span className="text-sm">Florida</span>
            </div>
            <LanguageSelector />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder={t('home.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 bg-white/90 border-0 h-12 text-gray-700"
          />
          <Button 
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-4 bg-amber-600 hover:bg-amber-700"
          >
            {t('common.search')}
          </Button>
        </div>
      </div>

      <div className="px-3 sm:px-4 -mt-4 space-y-4 sm:space-y-6">
        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-2 sm:gap-3"
        >
          <Link href="/style-match">
            <Card className="bg-gradient-to-r from-purple-100 to-pink-100 hover:shadow-lg transition-shadow cursor-pointer border-purple-200">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <p className="font-medium text-gray-800 text-sm sm:text-base">AI Style Match</p>
                <p className="text-xs text-gray-600 mt-1 hidden sm:block">Find your perfect style</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/explore">
            <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-3 sm:p-4 text-center">
                <Search className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 mx-auto mb-2" />
                <p className="font-medium text-gray-800 text-sm sm:text-base">{t('navigation.explore')}</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Secondary Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-2 sm:gap-3"
        >
          <Link href="/favorites">
            <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-3 sm:p-4 text-center">
                <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 mx-auto mb-2" />
                <p className="font-medium text-gray-800 text-sm sm:text-base">{t('navigation.favorites')}</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/academy">
            <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-3 sm:p-4 text-center">
                <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 mx-auto mb-2" />
                <p className="font-medium text-gray-800 text-sm sm:text-base">Beauty Academy</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Gamification Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {/* Points Display */}
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-600" />
                  Beauty Points
                </CardTitle>
                <Link href="/gamification">
                  <Button variant="ghost" size="sm" className="text-amber-600">
                    View All <ArrowRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <PointsDisplay compact />
            </CardContent>
          </Card>

          {/* Flash Deals */}
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-600" />
                  Flash Deals
                </CardTitle>
                <Link href="/flash-deals">
                  <Button variant="ghost" size="sm" className="text-red-600">
                    View All <ArrowRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <FlashDealsGrid limit={2} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Bookings */}
        {dashboardData?.upcomingBookings && dashboardData.upcomingBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-800">{t('home.upcomingBookings')}</CardTitle>
                  <Link href="/bookings">
                    <Button variant="ghost" size="sm" className="text-amber-600">
                      {t('home.viewAll')} <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.upcomingBookings.slice(0, 2).map((booking) => (
                  <div key={booking.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{booking.service?.name}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                      </p>
                      <p className="text-sm text-amber-600">{booking.service?.professional?.businessName}</p>
                    </div>
                    <Badge variant="outline" className="border-amber-200 text-amber-700">
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Featured Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-800">Featured Services</CardTitle>
                <Link href="/explore">
                  <Button variant="ghost" size="sm" className="text-amber-600">
                    View All <ArrowRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {dashboardData?.featuredServices?.slice(0, 4).map((service) => (
                  <Link key={service.id} href={`/services/${service.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-3">
                        <div className="relative w-full h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg overflow-hidden mb-2">
                          {service.images?.[0] ? (
                            <Image
                              src={service.images[0]}
                              alt={service.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Heart className="text-amber-400" size={20} />
                            </div>
                          )}
                        </div>
                        <h4 className="font-medium text-sm text-gray-800 line-clamp-1">{service.name}</h4>
                        <p className="text-xs text-gray-600 mb-1">{service.professional?.businessName}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-amber-600">${service.price}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{service.professional?.averageRating?.toFixed(1) || '5.0'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Favorite Professionals */}
        {dashboardData?.favorites && dashboardData.favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-800">Your Favorites</CardTitle>
                  <Link href="/favorites">
                    <Button variant="ghost" size="sm" className="text-amber-600">
                      View All <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.favorites.slice(0, 3).map((favorite) => (
                    <div key={favorite.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={favorite.professional?.user?.avatar} />
                        <AvatarFallback>
                          {favorite.professional?.user?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{favorite.professional?.businessName}</h4>
                        <p className="text-sm text-gray-600">{favorite.professional?.user?.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{favorite.professional?.averageRating?.toFixed(1) || '5.0'}</span>
                        </div>
                      </div>
                      <Link href={`/booking/${favorite.professional?.services?.[0]?.id}`}>
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Nearby Professionals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-800">Top Professionals Near You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {dashboardData?.nearbyProfessionals?.slice(0, 4).map((professional) => (
                  <Link key={professional.id} href={`/professionals/${professional.userId}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-3 text-center">
                        <Avatar className="w-16 h-16 mx-auto mb-2">
                          <AvatarImage src={professional.user?.avatar} />
                          <AvatarFallback>
                            {professional.user?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <h4 className="font-medium text-sm text-gray-800 line-clamp-1">{professional.businessName}</h4>
                        <p className="text-xs text-gray-600 mb-2">{professional.user?.name}</p>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{professional.averageRating?.toFixed(1) || '5.0'}</span>
                        </div>
                        <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-xs">
                          View Profile
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="h-24 sm:h-20"></div>
    </div>
  )
}

function ClientHomeSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Beauty GO</h1>
            <p className="text-amber-100 text-sm">Find your perfect beauty service</p>
          </div>
        </div>
        <EnhancedSkeleton className="h-12 w-full bg-white/20" />
      </div>
      
      <div className="px-4 -mt-4 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <EnhancedSkeleton className="h-20 bg-white rounded-lg" />
          <EnhancedSkeleton className="h-20 bg-white rounded-lg" />
        </div>
        
        {/* Upcoming Bookings */}
        <Card className="bg-white">
          <CardHeader className="pb-3">
            <EnhancedSkeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <ListSkeleton count={2} />
          </CardContent>
        </Card>
        
        {/* Featured Services */}
        <Card className="bg-white">
          <CardHeader className="pb-3">
            <EnhancedSkeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <ServiceCardSkeleton />
              <ServiceCardSkeleton />
              <ServiceCardSkeleton />
              <ServiceCardSkeleton />
            </div>
          </CardContent>
        </Card>
        
        {/* Nearby Professionals */}
        <Card className="bg-white">
          <CardHeader className="pb-3">
            <EnhancedSkeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <ProfessionalCardSkeleton />
              <ProfessionalCardSkeleton />
              <ProfessionalCardSkeleton />
              <ProfessionalCardSkeleton />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
