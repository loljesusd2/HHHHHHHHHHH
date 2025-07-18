
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { 
  Play, 
  Clock, 
  Users, 
  Star,
  BookOpen,
  Trophy,
  Download,
  Share2,
  CheckCircle,
  Lock,
  ArrowLeft,
  Heart,
  MessageCircle
} from 'lucide-react'
import { useAcademyCourse } from '@/hooks/use-academy-courses'
import { useAcademyEnrollments } from '@/hooks/use-academy-enrollment'
import { COURSE_CATEGORIES, COURSE_LEVELS } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface CourseDetailsProps {
  courseId: string
}

export function CourseDetails({ courseId }: CourseDetailsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEnrolling, setIsEnrolling] = useState(false)
  
  const { course, loading, isEnrolled, enrollInCourse } = useAcademyCourse(courseId)
  const { createEnrollment } = useAcademyEnrollments()

  const handleEnroll = async () => {
    setIsEnrolling(true)
    try {
      const success = await createEnrollment(courseId)
      if (success) {
        // Refresh course data
        window.location.reload()
      }
    } catch (error) {
      console.error('Enrollment failed:', error)
    } finally {
      setIsEnrolling(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course?.title,
        text: `Check out this course: ${course?.title}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="aspect-video bg-gray-200 rounded-lg" />
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded-lg" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h3>
          <p className="text-gray-600 mb-4">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/academy/courses">
            <Button>Browse All Courses</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm text-gray-600"
      >
        <Link href="/academy" className="hover:text-purple-600">Academy</Link>
        <span>/</span>
        <Link href="/academy/courses" className="hover:text-purple-600">Courses</Link>
        <span>/</span>
        <span className="text-gray-900">{course.title}</span>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Course Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gray-900">
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 backdrop-blur-sm"
                      >
                        <Play className="w-6 h-6 mr-2" />
                        {course.previewVideoUrl ? 'Watch Preview' : 'Course Preview'}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Course Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {COURSE_CATEGORIES[course.category as keyof typeof COURSE_CATEGORIES]}
              </Badge>
              <Badge variant="outline">
                {COURSE_LEVELS[course.level as keyof typeof COURSE_LEVELS]}
              </Badge>
              {course.badges?.map((badge, index) => (
                <Badge key={index} className="bg-purple-100 text-purple-800">
                  {badge}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            
            <p className="text-gray-600 text-lg">{course.description}</p>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{course.averageRating.toFixed(1)}</span>
                <span>({course.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.totalStudents} students</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(course.duration)}</span>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="w-12 h-12">
                <AvatarImage src={course.instructor?.avatar} />
                <AvatarFallback>
                  {course.instructor?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">{course.instructor?.name}</p>
                <p className="text-sm text-gray-600">
                  {course.instructor?.instructorProfile?.specializations?.join(', ')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">What You'll Learn</h3>
                    <ul className="space-y-2">
                      {course.skillsYouWillLearn.map((skill, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Requirements</h3>
                    <ul className="space-y-2">
                      {course.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-4">
                {course.modules?.map((module, index) => (
                  <Card key={module.id} className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{module.title}</h3>
                        <Badge variant="outline">
                          {module.lessons?.length || 0} lessons
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{module.description}</p>
                      
                      <div className="space-y-2">
                        {module.lessons?.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            {lesson.isFree ? (
                              <Play className="w-4 h-4 text-green-500" />
                            ) : (
                              <Lock className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="flex-1">{lesson.title}</span>
                            <span className="text-sm text-gray-500">
                              {formatDuration(lesson.duration)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {course.reviews?.map((review, index) => (
                  <Card key={review.id} className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.user?.avatar} />
                          <AvatarFallback>
                            {review.user?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{review.user?.name}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.title && (
                        <h4 className="font-semibold mb-2">{review.title}</h4>
                      )}
                      <p className="text-gray-600">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Right Column - Enrollment Card */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm sticky top-6">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Price */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(course.price)}
                    </div>
                    {course.originalPrice && course.originalPrice > course.price && (
                      <div className="text-lg text-gray-500 line-through">
                        {formatPrice(course.originalPrice)}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="space-y-3">
                    {isEnrolled ? (
                      <Link href={`/academy/learn/${courseId}`}>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <Play className="w-4 h-4 mr-2" />
                          Continue Learning
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={handleEnroll}
                        disabled={isEnrolling}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleShare} className="flex-1">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Heart className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-semibold">{formatDuration(course.duration)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Modules</span>
                      <span className="font-semibold">{course.modules?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Level</span>
                      <span className="font-semibold">
                        {COURSE_LEVELS[course.level as keyof typeof COURSE_LEVELS]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Language</span>
                      <span className="font-semibold">English</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Certificate</span>
                      <span className="font-semibold">Yes</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
