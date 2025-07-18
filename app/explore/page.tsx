
'use client'

import { useEffect, useState } from 'react'
import { Search, MapPin, Star, Heart, Filter, SlidersHorizontal, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { BottomNavigation } from '@/components/bottom-navigation'
import { AuthGuard } from '@/components/auth-guard'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslations } from '@/lib/i18n-client'
import { LanguageSelector } from '@/components/language-selector'

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
  images: string[]
  professional: {
    id: string
    name: string
    businessName: string
    avatar?: string
    rating: number
    reviewCount: number
    distance?: number
  }
  rating: number
  reviewCount: number
  isFavorite: boolean
}

interface Filters {
  category: string
  priceRange: [number, number]
  rating: number
  distance: number
  sortBy: string
}

export default function ExplorePage() {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    priceRange: [0, 500],
    rating: 0,
    distance: 50,
    sortBy: 'relevance'
  })
  const t = useTranslations()

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [services, searchQuery, filters])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...services]

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.professional.businessName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(service => service.category === filters.category)
    }

    // Price range filter
    filtered = filtered.filter(service =>
      service.price >= filters.priceRange[0] && service.price <= filters.priceRange[1]
    )

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(service => service.rating >= filters.rating)
    }

    // Distance filter (if available)
    if (filters.distance < 50) {
      filtered = filtered.filter(service =>
        !service.professional.distance || service.professional.distance <= filters.distance
      )
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'distance':
        filtered.sort((a, b) => (a.professional.distance || 0) - (b.professional.distance || 0))
        break
      default:
        // Keep original order for relevance
        break
    }

    setFilteredServices(filtered)
  }

  const toggleFavorite = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/favorites/${serviceId}`, {
        method: 'POST'
      })
      if (response.ok) {
        setServices(prev => prev.map(service =>
          service.id === serviceId
            ? { ...service, isFavorite: !service.isFavorite }
            : service
        ))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const categories = [
    { value: 'all', label: t('services.allCategories') },
    { value: 'HAIR_STYLING', label: t('services.hairStyling') },
    { value: 'NAILS', label: t('services.nails') },
    { value: 'SKINCARE', label: t('services.skincare') },
    { value: 'MAKEUP', label: t('services.makeup') },
    { value: 'MASSAGE', label: t('services.massage') },
    { value: 'EYEBROWS', label: t('services.eyebrows') },
    { value: 'OTHER', label: t('services.other') }
  ]

  if (isLoading) {
    return <ExplorePageSkeleton />
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">{t('navigation.explore')}</h1>
              <LanguageSelector />
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder={t('home.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/90 border-0 h-14 text-gray-700 rounded-xl"
              />
            </div>

            {/* Filter and View Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="default" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      {t('search.filters')}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>{t('search.filters')}</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-8 mt-8">
                      {/* Category Filter */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">{t('services.categories')}</label>
                        <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price Range */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">
                          {t('search.priceRange')}: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                        </label>
                        <Slider
                          value={filters.priceRange}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                          max={500}
                          step={10}
                          className="mt-4"
                        />
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">{t('search.sortBy')}</label>
                        <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="relevance">Relevance</SelectItem>
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                            <SelectItem value="rating">Highest Rated</SelectItem>
                            <SelectItem value="distance">Nearest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        onClick={() => setFilters({
                          category: 'all',
                          priceRange: [0, 500],
                          rating: 0,
                          distance: 50,
                          sortBy: 'relevance'
                        })}
                        variant="outline" 
                        className="w-full h-12"
                      >
                        {t('search.clearFilters')}
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <Badge variant="outline" className="bg-white/10 border-white/20 text-white px-3 py-2">
                  {filteredServices.length} {t('search.searchResults')}
                </Badge>
              </div>

              <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-10 w-10 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-10 w-10 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid/List */}
        <div className="max-w-6xl mx-auto px-4 -mt-4">
          {filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <p className="text-gray-500 text-xl">{t('search.noResults')}</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8' : 'space-y-6 mt-8'}>
              {filteredServices.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  index={index}
                  viewMode={viewMode}
                  onToggleFavorite={toggleFavorite}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>

        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}

function ServiceCard({ 
  service, 
  index, 
  viewMode, 
  onToggleFavorite, 
  t 
}: { 
  service: Service
  index: number
  viewMode: 'grid' | 'list'
  onToggleFavorite: (id: string) => void
  t: (key: string) => string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-white hover:shadow-lg transition-all duration-300 overflow-hidden border-0 rounded-xl">
        <div className={viewMode === 'list' ? 'flex' : ''}>
          {/* Service Image */}
          <div className={`relative ${viewMode === 'list' ? 'w-40 h-40' : 'h-52'}`}>
            <Image
              src={service.images[0] || "https://i.pinimg.com/originals/e0/4a/bf/e04abfbebfe7dbf4c6ce290e5b53a293.jpg"}
              alt={service.name}
              fill
              className="object-cover"
            />
            <button
              onClick={() => onToggleFavorite(service.id)}
              className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-sm"
            >
              <Heart
                className={`w-5 h-5 ${service.isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}`}
              />
            </button>
          </div>

          <CardContent className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">{service.name}</h3>
                <p className="text-gray-600 mb-3">{service.professional.businessName}</p>
              </div>
              <div className="text-right ml-4">
                <p className="text-xl font-bold text-amber-700">${service.price}</p>
                <p className="text-sm text-gray-500">{service.duration} {t('services.minutes')}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600 font-medium">{service.rating}</span>
                <span className="text-sm text-gray-400">({service.reviewCount})</span>
              </div>
              {service.professional.distance && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{service.professional.distance}km {t('professionals.away')}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 px-3 py-1">
                {service.category.replace('_', ' ')}
              </Badge>
              <Link href={`/services/${service.id}`}>
                <Button size="default" className="bg-amber-600 hover:bg-amber-700 px-6">
                  {t('home.bookNow')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  )
}

function ExplorePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 pb-24">
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 bg-white/20 mb-6" />
          <Skeleton className="h-14 w-full bg-white/20 mb-6" />
          <div className="flex justify-between">
            <Skeleton className="h-10 w-24 bg-white/20" />
            <Skeleton className="h-10 w-20 bg-white/20" />
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 -mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-80 w-full bg-white rounded-xl" />
        ))}
      </div>
    </div>
  )
}
