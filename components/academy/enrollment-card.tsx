
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { 
  PlayCircle, 
  Clock, 
  CheckCircle, 
  BookOpen, 
  Calendar,
  Trophy,
  Download,
  Share2,
  MoreHorizontal
} from 'lucide-react'
import { CourseEnrollment } from '@/lib/types'
import { COURSE_CATEGORIES } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface EnrollmentCardProps {
  enrollment: CourseEnrollment & {
    progressPercentage: number
    completedLessons: number
    totalLessons: number
    course: {
      id: string
      title: string
      thumbnailUrl: string
      category: string
      duration: number
      instructor?: {
        name: string
        avatar?: string
      }
    }
  }
  variant?: 'full' | 'compact'
  showActions?: boolean
  className?: string
}

export function EnrollmentCard({ 
  enrollment, 
  variant = 'full',
  showActions = true,
  className 
}: EnrollmentCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date))
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    if (percentage >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getStatusBadge = () => {
    if (enrollment.isCompleted) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <Trophy className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      )
    }
    if (enrollment.progressPercentage > 0) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <PlayCircle className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
        <BookOpen className="w-3 h-3 mr-1" />
        Not Started
      </Badge>
    )
  }

  const handleDownloadCertificate = () => {
    if (enrollment.certificateUrl) {
      window.open(enrollment.certificateUrl, '_blank')
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `I'm learning ${enrollment.course.title}`,
        text: `Check out this course I'm taking on Beauty Academy!`,
        url: window.location.href
      })
    }
  }

  if (variant === 'compact') {
    return (
      <Link href={`/academy/course/${enrollment.course.id}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          className={`p-4 bg-white rounded-lg border hover:shadow-md transition-all duration-200 ${className}`}
        >
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={enrollment.course.thumbnailUrl}
                alt={enrollment.course.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-sm line-clamp-1">{enrollment.course.title}</h3>
              <p className="text-xs text-gray-600 mb-2">
                {COURSE_CATEGORIES[enrollment.course.category as keyof typeof COURSE_CATEGORIES]}
              </p>
              
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge()}
                <span className="text-xs text-gray-500">
                  {enrollment.progressPercentage}% complete
                </span>
              </div>
              
              <Progress value={enrollment.progressPercentage} className="h-1" />
            </div>
          </div>
        </motion.div>
      </Link>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={className}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        <CardHeader className="p-0">
          <div className="relative aspect-video bg-gray-100">
            <Image
              src={enrollment.course.thumbnailUrl}
              alt={enrollment.course.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            
            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              {getStatusBadge()}
            </div>

            {/* Progress Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex items-center gap-2 text-white text-sm mb-2">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(enrollment.course.duration)}</span>
                <span>•</span>
                <span>{enrollment.completedLessons} / {enrollment.totalLessons} lessons</span>
              </div>
              <Progress value={enrollment.progressPercentage} className="h-2">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(enrollment.progressPercentage)}`}
                  style={{ width: `${enrollment.progressPercentage}%` }}
                />
              </Progress>
            </div>

            {/* Actions Menu */}
            {showActions && (
              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white bg-black/20 hover:bg-black/40">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Progress
                    </DropdownMenuItem>
                    {enrollment.certificateUrl && (
                      <DropdownMenuItem onClick={handleDownloadCertificate}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Certificate
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-4">
            <Badge variant="outline" className="mb-2">
              {COURSE_CATEGORIES[enrollment.course.category as keyof typeof COURSE_CATEGORIES]}
            </Badge>
            <CardTitle className="text-lg mb-2 line-clamp-2">
              {enrollment.course.title}
            </CardTitle>
            {enrollment.course.instructor && (
              <p className="text-sm text-gray-600">
                by {enrollment.course.instructor.name}
              </p>
            )}
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {enrollment.progressPercentage}%
              </p>
              <p className="text-xs text-gray-600">Complete</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {enrollment.completedLessons}
              </p>
              <p className="text-xs text-gray-600">Lessons Done</p>
            </div>
          </div>

          {/* Enrollment Info */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Enrolled {formatDate(enrollment.enrolledAt)}</span>
            </div>
            {enrollment.completedAt && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Completed {formatDate(enrollment.completedAt)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link href={`/academy/course/${enrollment.course.id}`} className="flex-1">
              <Button className="w-full">
                {enrollment.isCompleted ? (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Review Course
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {enrollment.progressPercentage > 0 ? 'Continue' : 'Start'} Learning
                  </>
                )}
              </Button>
            </Link>
            
            {enrollment.isCompleted && enrollment.certificateUrl && (
              <Button variant="outline" onClick={handleDownloadCertificate}>
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
