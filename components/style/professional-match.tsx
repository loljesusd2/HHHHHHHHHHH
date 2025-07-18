
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Star, MapPin, Clock, Award, Heart, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface ProfessionalMatchProps {
  match: {
    professional: {
      id: string
      userId: string
      businessName: string
      bio?: string
      city?: string
      averageRating: number
      totalReviews: number
      yearsExperience?: number
      styleSpecialties: string[]
      user?: {
        name: string
        avatar?: string
      }
      stylePortfolio: Array<{
        id: string
        afterImageUrl: string
        title: string
      }>
    }
    matchScore: number
    matchReasons: string[]
    relevantServices: Array<{
      id: string
      name: string
      price: number
      duration: number
    }>
  }
  onBook: (serviceId: string, professionalId: string) => void
  onViewPortfolio: (professionalId: string) => void
}

const reasonLabels = {
  style_expertise: '🎨 Style Expert',
  experienced: '⏰ Experienced',
  highly_rated: '⭐ Top Rated',
  strong_portfolio: '📸 Great Portfolio',
  local_professional: '📍 Local Pro',
  color_expertise: '🎨 Color Expert',
  technique_match: '✨ Technique Match'
}

export function ProfessionalMatch({ match, onBook, onViewPortfolio }: ProfessionalMatchProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const { professional, matchScore, matchReasons, relevantServices } = match

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header with match score */}
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <div className={`${getScoreColor(matchScore)} text-white px-3 py-1 rounded-full text-sm font-bold`}>
            {matchScore}% Match
          </div>
        </div>
        
        {/* Portfolio preview */}
        {professional.stylePortfolio.length > 0 && (
          <div className="grid grid-cols-3 gap-1 h-24 bg-gray-100">
            {professional.stylePortfolio.slice(0, 3).map((work, index) => (
              <div key={work.id} className="relative">
                <Image
                  src={work.afterImageUrl}
                  alt={work.title}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Professional info */}
        <div className="flex items-start space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={professional.user?.avatar} />
            <AvatarFallback className="bg-amber-100 text-amber-700">
              {getUserInitials(professional.user?.name || professional.businessName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {professional.businessName}
            </h3>
            <p className="text-sm text-gray-600">{professional.user?.name}</p>
            
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{professional.averageRating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({professional.totalReviews})</span>
              </div>
              
              {professional.city && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{professional.city}</span>
                </div>
              )}
              
              {professional.yearsExperience && (
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{professional.yearsExperience}y exp</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Match reasons */}
        <div className="flex flex-wrap gap-1">
          {matchReasons.map((reason, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {reasonLabels[reason as keyof typeof reasonLabels] || reason}
            </Badge>
          ))}
        </div>

        {/* Specialties */}
        {professional.styleSpecialties.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Specialties:</p>
            <div className="flex flex-wrap gap-1">
              {professional.styleSpecialties.slice(0, 4).map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {professional.styleSpecialties.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{professional.styleSpecialties.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Services */}
        {relevantServices.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Available Services:</p>
            <div className="space-y-2">
              {relevantServices.slice(0, 2).map((service) => (
                <div 
                  key={service.id}
                  className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                    selectedService === service.id 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{service.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{service.duration} min</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-600">${service.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewPortfolio(professional.id)}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Portfolio
          </Button>
          
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            disabled={!selectedService}
            onClick={() => selectedService && onBook(selectedService, professional.userId)}
          >
            <Heart className="h-4 w-4 mr-1" />
            Book Style
          </Button>
        </div>
      </div>
    </Card>
  )
}
