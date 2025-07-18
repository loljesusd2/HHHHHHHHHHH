
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart, Star, MapPin, Calendar, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { BottomNavigation } from '@/components/bottom-navigation'
import { AuthGuard } from '@/components/auth-guard'
import { useToast } from '@/hooks/use-toast'

interface Favorite {
  id: string
  professionalId: string
  createdAt: string
  professional: {
    id: string
    name: string
    avatar?: string
    professionalProfile: {
      businessName: string
      bio?: string
      city: string
      state: string
      averageRating: number
      totalReviews: number
      services: Array<{
        id: string
        name: string
        price: number
        category: string
      }>
    }
  }
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
      toast({
        title: "Error",
        description: "Failed to load favorites.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeFavorite = async (professionalId: string) => {
    try {
      const response = await fetch(`/api/favorites/${professionalId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.professionalId !== professionalId))
        toast({
          title: "Removed",
          description: "Professional removed from favorites.",
        })
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast({
        title: "Error",
        description: "Failed to remove from favorites.",
        variant: "destructive",
      })
    }
  }

  const handleBookService = (serviceId: string) => {
    router.push(`/booking/${serviceId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      </div>
    )
  }

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
              <Heart className="w-6 h-6" />
              <h1 className="text-xl font-bold">My Favorites</h1>
            </div>
          </div>
        </div>

        <div className="p-4">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No favorites yet</h2>
              <p className="text-gray-500 mb-6">Start adding professionals to your favorites to see them here.</p>
              <Button 
                onClick={() => router.push('/explore')}
                className="bg-amber-700 hover:bg-amber-800"
              >
                Explore Professionals
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((favorite) => (
                <Card key={favorite.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={favorite.professional.avatar} />
                        <AvatarFallback className="bg-amber-100 text-amber-700">
                          {favorite.professional.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {favorite.professional.professionalProfile.businessName}
                            </h3>
                            <p className="text-sm text-gray-600">{favorite.professional.name}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFavorite(favorite.professionalId)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {favorite.professional.professionalProfile.averageRating.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({favorite.professional.professionalProfile.totalReviews})
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">
                              {favorite.professional.professionalProfile.city}, {favorite.professional.professionalProfile.state}
                            </span>
                          </div>
                        </div>

                        {favorite.professional.professionalProfile.bio && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {favorite.professional.professionalProfile.bio}
                          </p>
                        )}

                        {/* Services */}
                        {favorite.professional.professionalProfile.services.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">Popular Services:</h4>
                            <div className="space-y-2">
                              {favorite.professional.professionalProfile.services.slice(0, 2).map((service) => (
                                <div key={service.id} className="flex items-center justify-between bg-amber-50 p-2 rounded-lg">
                                  <div>
                                    <span className="text-sm font-medium text-amber-800">{service.name}</span>
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      {service.category.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-amber-700">
                                      ${service.price}
                                    </span>
                                    <Button
                                      size="sm"
                                      onClick={() => handleBookService(service.id)}
                                      className="bg-amber-700 hover:bg-amber-800 text-white"
                                    >
                                      <Calendar className="w-4 h-4 mr-1" />
                                      Book
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
