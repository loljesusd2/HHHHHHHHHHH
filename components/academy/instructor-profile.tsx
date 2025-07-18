
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import { 
  Star, 
  Users, 
  BookOpen, 
  Award, 
  Instagram, 
  Youtube, 
  Globe,
  TrendingUp,
  Clock,
  DollarSign
} from 'lucide-react'
import { InstructorProfile, User } from '@/lib/types'
import { COURSE_CATEGORIES } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'

interface InstructorProfileProps {
  instructor: User & { instructorProfile?: InstructorProfile }
  showStats?: boolean
  showCourses?: boolean
  showSocials?: boolean
  variant?: 'full' | 'compact' | 'card'
  className?: string
}

export function InstructorProfileComponent({ 
  instructor, 
  showStats = true,
  showCourses = true,
  showSocials = true,
  variant = 'full',
  className 
}: InstructorProfileProps) {
  const profile = instructor.instructorProfile

  if (!profile) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Instructor profile not available</p>
        </CardContent>
      </Card>
    )
  }

  const formatEarnings = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getSpecializationColor = (specialization: string) => {
    const colors = {
      'Hair': 'bg-purple-100 text-purple-800',
      'Makeup': 'bg-pink-100 text-pink-800',
      'Nails': 'bg-blue-100 text-blue-800',
      'Business': 'bg-green-100 text-green-800',
      'Skincare': 'bg-yellow-100 text-yellow-800',
      'Eyebrows': 'bg-indigo-100 text-indigo-800'
    }
    return colors[specialization as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-4 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow ${className}`}
      >
        <Avatar className="w-16 h-16">
          <AvatarImage src={instructor.avatar} />
          <AvatarFallback className="text-lg">
            {instructor.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{instructor.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
          
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{profile.averageRating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{profile.totalStudents}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{profile.totalCourses}</span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={instructor.avatar} />
              <AvatarFallback className="text-2xl">
                {instructor.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="text-xl font-bold mb-2">{instructor.name}</h3>
            <p className="text-gray-600 text-sm line-clamp-3">{profile.bio}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-lg font-bold">{profile.averageRating.toFixed(1)}</p>
              <p className="text-xs text-gray-600">Rating</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-lg font-bold">{profile.totalStudents}</p>
              <p className="text-xs text-gray-600">Students</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {profile.specializations.map((spec, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className={`${getSpecializationColor(spec)} text-xs`}
              >
                {spec}
              </Badge>
            ))}
          </div>

          <Button className="w-full" variant="outline">
            View Profile
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Full variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-white/20">
              <AvatarImage src={instructor.avatar} />
              <AvatarFallback className="text-2xl bg-white/20">
                {instructor.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{instructor.name}</CardTitle>
              <p className="text-white/90 mb-4">{profile.bio}</p>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>{profile.yearsExperience} years experience</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Stats */}
          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg"
              >
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-yellow-600">{profile.averageRating.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg"
              >
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{profile.totalStudents}</p>
                <p className="text-sm text-gray-600">Students</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg"
              >
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-purple-600">{profile.totalCourses}</p>
                <p className="text-sm text-gray-600">Courses</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg"
              >
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">{formatEarnings(profile.totalEarnings)}</p>
                <p className="text-sm text-gray-600">Total Earnings</p>
              </motion.div>
            </div>
          )}

          {/* Specializations */}
          <div className="mb-8">
            <h4 className="font-semibold text-lg mb-4">Specializations</h4>
            <div className="flex flex-wrap gap-2">
              {profile.specializations.map((spec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge 
                    variant="secondary" 
                    className={`${getSpecializationColor(spec)} px-3 py-1`}
                  >
                    {spec}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          {profile.certifications.length > 0 && (
            <div className="mb-8">
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Certifications
              </h4>
              <div className="space-y-2">
                {profile.certifications.map((cert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm">{cert}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {profile.portfolioImages.length > 0 && (
            <div className="mb-8">
              <h4 className="font-semibold text-lg mb-4">Portfolio</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profile.portfolioImages.slice(0, 6).map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <Image
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {showSocials && (profile.instagram || profile.youtube || profile.website) && (
            <div className="mb-8">
              <h4 className="font-semibold text-lg mb-4">Connect</h4>
              <div className="flex gap-4">
                {profile.instagram && (
                  <Link href={profile.instagram} target="_blank">
                    <Button variant="outline" size="sm">
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </Button>
                  </Link>
                )}
                {profile.youtube && (
                  <Link href={profile.youtube} target="_blank">
                    <Button variant="outline" size="sm">
                      <Youtube className="w-4 h-4 mr-2" />
                      YouTube
                    </Button>
                  </Link>
                )}
                {profile.website && (
                  <Link href={profile.website} target="_blank">
                    <Button variant="outline" size="sm">
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
