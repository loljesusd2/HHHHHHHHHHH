
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, BookOpen, Trophy, Target, Zap } from 'lucide-react'
import { LearningProgress } from '@/lib/types'

interface ProgressTrackerProps {
  progress: LearningProgress[]
  title?: string
  showStats?: boolean
  className?: string
}

export function ProgressTracker({ 
  progress, 
  title = "Learning Progress",
  showStats = true,
  className 
}: ProgressTrackerProps) {
  const totalCourses = progress.length
  const completedCourses = progress.filter(p => p.progressPercentage >= 100).length
  const inProgressCourses = progress.filter(p => p.progressPercentage > 0 && p.progressPercentage < 100).length
  const averageProgress = totalCourses > 0 
    ? Math.round(progress.reduce((acc, p) => acc + p.progressPercentage, 0) / totalCourses)
    : 0

  const totalLessons = progress.reduce((acc, p) => acc + p.totalLessons, 0)
  const completedLessons = progress.reduce((acc, p) => acc + p.completedLessons, 0)
  const totalTimeLeft = progress.reduce((acc, p) => acc + p.estimatedTimeLeft, 0)

  const formatTime = (minutes: number) => {
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

  const getProgressVariant = (percentage: number) => {
    if (percentage >= 100) return 'default'
    if (percentage >= 75) return 'secondary'
    if (percentage >= 50) return 'outline'
    return 'destructive'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Stats */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-700">{totalCourses}</p>
              <p className="text-sm text-gray-600">Total Courses</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">{completedCourses}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-700">{inProgressCourses}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-700">{formatTime(totalTimeLeft)}</p>
              <p className="text-sm text-gray-600">Time Left</p>
            </div>
          </motion.div>
        )}

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg">Overall Progress</h4>
            <Badge variant="secondary" className="text-sm">
              {averageProgress}% Complete
            </Badge>
          </div>
          <Progress value={averageProgress} className="h-3 bg-gray-200">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(averageProgress)}`}
              style={{ width: `${averageProgress}%` }}
            />
          </Progress>
          <p className="text-sm text-gray-600">
            {completedLessons} of {totalLessons} lessons completed
          </p>
        </motion.div>

        {/* Individual Course Progress */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Course Progress</h4>
          <div className="space-y-3">
            {progress.map((courseProgress, index) => (
              <motion.div
                key={courseProgress.courseId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900 flex-1 line-clamp-1">
                    {courseProgress.courseName}
                  </h5>
                  <Badge 
                    variant={getProgressVariant(courseProgress.progressPercentage)}
                    className="ml-2"
                  >
                    {courseProgress.progressPercentage}%
                  </Badge>
                </div>

                <Progress 
                  value={courseProgress.progressPercentage} 
                  className="h-2 bg-gray-200 mb-2"
                >
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(courseProgress.progressPercentage)}`}
                    style={{ width: `${courseProgress.progressPercentage}%` }}
                  />
                </Progress>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {courseProgress.completedLessons} of {courseProgress.totalLessons} lessons
                  </span>
                  <span>
                    {courseProgress.estimatedTimeLeft > 0 
                      ? `${formatTime(courseProgress.estimatedTimeLeft)} left`
                      : 'Complete!'
                    }
                  </span>
                </div>

                {courseProgress.progressPercentage >= 100 && (
                  <div className="flex items-center gap-2 mt-2 text-green-600">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm font-medium">Course Completed!</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {progress.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No courses enrolled yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Start your learning journey by enrolling in a course
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
