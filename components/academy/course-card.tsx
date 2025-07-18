
'use client'

import { Course } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Clock, Users, PlayCircle, BookOpen, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { COURSE_CATEGORIES, COURSE_LEVELS } from '@/lib/types'

interface CourseCardProps {
  course: Course
  showEnrollButton?: boolean
  onEnroll?: (courseId: string) => void
  isEnrolled?: boolean
  className?: string
}

export function CourseCard({ 
  course, 
  showEnrollButton = true, 
  onEnroll, 
  isEnrolled = false,
  className 
}: CourseCardProps) {
  const handleEnroll = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onEnroll) {
      onEnroll(course.id)
    }
  }

  const getBadgeColor = (badge: string) => {
    const colors = {
      'Bestseller': 'bg-orange-500',
      'New': 'bg-green-500',
      'Premium': 'bg-purple-500',
      'Trending': 'bg-pink-500',
      'Featured': 'bg-blue-500',
      'Limited': 'bg-red-500'
    }
    return colors[badge as keyof typeof colors] || 'bg-gray-500'
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <Link href={`/academy/course/${course.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 ring-1 ring-gray-200/50">
          <CardHeader className="p-0">
            <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-t-lg overflow-hidden">
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* Badges */}
              {course.badges?.length > 0 && (
                <div className="absolute top-3 left-3 flex gap-1">
                  {course.badges.slice(0, 2).map((badge, index) => (
                    <Badge
                      key={index}
                      className={`${getBadgeColor(badge)} text-white border-0 text-xs px-2 py-1 shadow-sm`}
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
                </motion.div>
              </div>

              {/* Duration */}
              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(course.duration)}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Category & Level */}
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {COURSE_CATEGORIES[course.category as keyof typeof COURSE_CATEGORIES]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {COURSE_LEVELS[course.level as keyof typeof COURSE_LEVELS]}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">
              {course.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {course.description}
            </p>

            {/* Instructor */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src={course.instructor?.avatar} />
                <AvatarFallback>
                  {course.instructor?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {course.instructor?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {course.instructor?.instructorProfile?.specializations?.join(', ')}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{course.averageRating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.totalStudents}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{course.modules?.length || 0} modules</span>
              </div>
            </div>

            {/* Price & Action */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(course.price)}
                </span>
                {course.originalPrice && course.originalPrice > course.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(course.originalPrice)}
                  </span>
                )}
              </div>

              {showEnrollButton && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isEnrolled ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      <Trophy className="w-4 h-4 mr-1" />
                      Enrolled
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleEnroll}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg"
                    >
                      Enroll Now
                    </Button>
                  )}
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}
