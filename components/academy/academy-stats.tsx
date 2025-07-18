
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  BookOpen, 
  Users, 
  Trophy, 
  Star,
  DollarSign,
  Clock,
  Award,
  Target,
  Zap,
  Calendar,
  CheckCircle
} from 'lucide-react'

interface AcademyStatsProps {
  stats: {
    totalEnrollments?: number
    coursesCompleted?: number
    totalWatchTimeHours?: number
    certificationsEarned?: number
    totalSpent?: number
    completionRate?: number
    totalCourses?: number
    totalStudents?: number
    totalInstructors?: number
    totalRevenue?: number
    averageRating?: number
    totalCertifications?: number
    conversionRate?: number
    totalEarnings?: number
  }
  type?: 'user' | 'instructor' | 'global'
  title?: string
  className?: string
}

export function AcademyStats({ 
  stats, 
  type = 'user',
  title,
  className 
}: AcademyStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getDefaultTitle = () => {
    switch (type) {
      case 'instructor':
        return 'Instructor Dashboard'
      case 'global':
        return 'Academy Overview'
      default:
        return 'My Learning Stats'
    }
  }

  const renderUserStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-700 mb-1">
              {stats.totalEnrollments || 0}
            </p>
            <p className="text-sm text-purple-600">Courses Enrolled</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-700 mb-1">
              {stats.coursesCompleted || 0}
            </p>
            <p className="text-sm text-green-600">Completed</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-700 mb-1">
              {stats.totalWatchTimeHours || 0}h
            </p>
            <p className="text-sm text-blue-600">Watch Time</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-700 mb-1">
              {stats.certificationsEarned || 0}
            </p>
            <p className="text-sm text-yellow-600">Certifications</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Target className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-700 mb-1">
              {stats.completionRate || 0}%
            </p>
            <p className="text-sm text-orange-600">Completion Rate</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <DollarSign className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-indigo-700 mb-1">
              {formatCurrency(stats.totalSpent || 0)}
            </p>
            <p className="text-sm text-indigo-600">Total Invested</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  const renderInstructorStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-700 mb-1">
              {stats.totalCourses || 0}
            </p>
            <p className="text-sm text-purple-600">Courses Created</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-700 mb-1">
              {formatNumber(stats.totalStudents || 0)}
            </p>
            <p className="text-sm text-blue-600">Total Students</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-700 mb-1">
              {formatCurrency(stats.totalEarnings || 0)}
            </p>
            <p className="text-sm text-green-600">Total Earnings</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-700 mb-1">
              {stats.averageRating?.toFixed(1) || 0}
            </p>
            <p className="text-sm text-yellow-600">Average Rating</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-700 mb-1">
              {formatCurrency(stats.totalRevenue || 0)}
            </p>
            <p className="text-sm text-orange-600">Total Revenue</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  const renderGlobalStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-700 mb-1">
              {formatNumber(stats.totalCourses || 0)}
            </p>
            <p className="text-sm text-purple-600">Total Courses</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-700 mb-1">
              {formatNumber(stats.totalStudents || 0)}
            </p>
            <p className="text-sm text-blue-600">Active Students</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-700 mb-1">
              {formatNumber(stats.totalInstructors || 0)}
            </p>
            <p className="text-sm text-green-600">Instructors</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-700 mb-1">
              {formatNumber(stats.totalCertifications || 0)}
            </p>
            <p className="text-sm text-yellow-600">Certifications</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="md:col-span-2"
      >
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <DollarSign className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-indigo-700 mb-1">
              {formatCurrency(stats.totalRevenue || 0)}
            </p>
            <p className="text-sm text-indigo-600">Total Revenue</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="md:col-span-2"
      >
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Zap className="w-8 h-8 text-pink-600" />
            </div>
            <p className="text-3xl font-bold text-pink-700 mb-1">
              {stats.averageRating?.toFixed(1) || 0}
            </p>
            <p className="text-sm text-pink-600">Average Rating</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          {title || getDefaultTitle()}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {type === 'user' && renderUserStats()}
        {type === 'instructor' && renderInstructorStats()}
        {type === 'global' && renderGlobalStats()}
      </CardContent>
    </Card>
  )
}
