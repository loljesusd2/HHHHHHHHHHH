
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Target,
  PlayCircle,
  CheckCircle,
  Star,
  TrendingUp,
  Calendar,
  Search
} from 'lucide-react'
import { EnrollmentCard } from '@/components/academy/enrollment-card'
import { ProgressTracker } from '@/components/academy/progress-tracker'
import { AcademyStats } from '@/components/academy/academy-stats'
import { useAcademyEnrollments } from '@/hooks/use-academy-enrollment'
import { useAcademyProgress } from '@/hooks/use-academy-progress'
import { useUserAcademyStats } from '@/hooks/use-academy-stats'
import Link from 'next/link'

export function MyCoursesDashboard() {
  const [activeTab, setActiveTab] = useState('all')
  
  const { enrollments, loading } = useAcademyEnrollments('all')
  const { progress } = useAcademyProgress()
  const { stats } = useUserAcademyStats()

  const activeEnrollments = enrollments.filter(e => !e.isCompleted)
  const completedEnrollments = enrollments.filter(e => e.isCompleted)

  const getRecentActivity = () => {
    return enrollments
      .filter(e => e.progressPercentage > 0)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  }

  const getRecommendations = () => {
    // Mock recommendations based on user's progress
    return [
      {
        id: 'rec-1',
        title: 'Advanced Hair Coloring Techniques',
        reason: 'Complete your hair styling journey',
        category: 'HAIR_STYLING',
        price: 89,
        thumbnailUrl: 'https://i.ytimg.com/vi/ixlcA-AoYBU/maxresdefault.jpg'
      },
      {
        id: 'rec-2',
        title: 'Business Marketing for Beauty Professionals',
        reason: 'Based on your business courses',
        category: 'BUSINESS_SKILLS',
        price: 129,
        thumbnailUrl: 'https://i.ytimg.com/vi/RSYoUEbgyUI/maxresdefault.jpg'
      }
    ]
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date))
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gray-900">My Learning Journey</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Track your progress, continue learning, and achieve your beauty education goals.
        </p>
      </motion.div>

      {/* Stats Overview */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AcademyStats 
            stats={stats} 
            type="user" 
            title="Your Progress"
            className="bg-white/80 backdrop-blur-sm"
          />
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Find New Courses</h3>
            <p className="text-sm text-purple-600 mb-4">Discover new skills and advance your career</p>
            <Link href="/academy/courses">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Browse Courses
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Earn Certificates</h3>
            <p className="text-sm text-green-600 mb-4">Get recognized for your achievements</p>
            <Link href="/academy/certifications">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                View Certifications
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Track Progress</h3>
            <p className="text-sm text-blue-600 mb-4">Monitor your learning journey</p>
            <Button 
              onClick={() => setActiveTab('progress')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              View Progress
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="active">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="recommendations">Discover</TabsTrigger>
          </TabsList>

          {/* All Courses */}
          <TabsContent value="all" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">All My Courses</h2>
              <Badge variant="secondary" className="text-sm">
                {enrollments.length} courses
              </Badge>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : enrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enrollment, index) => (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <EnrollmentCard 
                      enrollment={enrollment as any}
                      className="bg-white/80 backdrop-blur-sm"
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
                <Link href="/academy/courses">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Active Courses */}
          <TabsContent value="active" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
              <Badge className="bg-blue-100 text-blue-800">
                {activeEnrollments.length} active
              </Badge>
            </div>

            {activeEnrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeEnrollments.map((enrollment, index) => (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <EnrollmentCard 
                      enrollment={enrollment as any}
                      className="bg-white/80 backdrop-blur-sm"
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No active courses</h3>
                <p className="text-gray-600 mb-6">
                  {enrollments.length > 0 
                    ? "All your courses are completed! Time to learn something new."
                    : "Start learning by enrolling in a course"
                  }
                </p>
                <Link href="/academy/courses">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Find Courses
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Completed Courses */}
          <TabsContent value="completed" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Completed Courses</h2>
              <Badge className="bg-green-100 text-green-800">
                {completedEnrollments.length} completed
              </Badge>
            </div>

            {completedEnrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedEnrollments.map((enrollment, index) => (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <EnrollmentCard 
                      enrollment={enrollment as any}
                      className="bg-white/80 backdrop-blur-sm"
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No completed courses yet</h3>
                <p className="text-gray-600 mb-6">Complete your first course to see it here</p>
                <Link href="/academy/courses">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Start Learning
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Progress */}
          <TabsContent value="progress" className="space-y-6">
            <ProgressTracker 
              progress={progress as any}
              title="Learning Progress"
              showStats={true}
              className="bg-white/80 backdrop-blur-sm"
            />
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
              <Badge variant="outline" className="text-sm">
                Based on your progress
              </Badge>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getRecentActivity().map((enrollment, index) => (
                    <div key={enrollment.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{enrollment.course.title}</p>
                        <p className="text-xs text-gray-500">
                          {enrollment.progressPercentage}% complete • Last accessed {formatDate(enrollment.updatedAt)}
                        </p>
                      </div>
                      <Link href={`/academy/learn/${enrollment.course.id}`}>
                        <Button size="sm" variant="outline">
                          Continue
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Recommendations */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Recommended Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getRecommendations().map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{course.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{course.reason}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              ${course.price}
                            </Badge>
                            <Link href={`/academy/course/${course.id}`}>
                              <Button size="sm" variant="outline">
                                View Course
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
