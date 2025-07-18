
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Award, 
  Target, 
  Star,
  BookOpen,
  Clock,
  CheckCircle,
  Plus,
  Download,
  Share2,
  Eye,
  ArrowRight
} from 'lucide-react'
import { CertificationBadge } from '@/components/academy/certification-badge'
import { useAcademyCertifications } from '@/hooks/use-academy-certifications'
import { COURSE_CATEGORIES, CERTIFICATION_LEVELS } from '@/lib/types'

export function CertificationsDashboard() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  const { 
    certifications, 
    progressToNext, 
    loading, 
    createCertification, 
    getEligibleCategories 
  } = useAcademyCertifications()

  const handleGenerateCertification = async (category: string) => {
    setIsGenerating(true)
    try {
      const result = await createCertification(category)
      if (result) {
        // Success - certifications will be refreshed automatically
      }
    } catch (error) {
      console.error('Failed to generate certification:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getCertificationColor = (level: string) => {
    const colors = {
      'BRONZE': 'from-orange-400 to-orange-600',
      'SILVER': 'from-gray-400 to-gray-600',
      'GOLD': 'from-yellow-400 to-yellow-600',
      'PLATINUM': 'from-purple-400 to-purple-600',
      'DIAMOND': 'from-blue-400 to-blue-600'
    }
    return colors[level as keyof typeof colors] || 'from-gray-400 to-gray-600'
  }

  const eligibleCategories = getEligibleCategories()

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gray-900">Certifications</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Earn industry-recognized certifications and showcase your beauty expertise to advance your career.
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-purple-800">{certifications.length}</p>
            <p className="text-sm text-purple-600">Certifications Earned</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-blue-800">{eligibleCategories.length}</p>
            <p className="text-sm text-blue-600">Ready to Earn</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-green-800">{progressToNext.length}</p>
            <p className="text-sm text-green-600">In Progress</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-orange-800">
              {certifications.reduce((max, cert) => {
                const levels = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']
                const currentLevel = levels.indexOf(cert.level)
                return Math.max(max, currentLevel + 1)
              }, 0)}
            </p>
            <p className="text-sm text-orange-600">Highest Level</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Earned Certifications */}
      {certifications.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your Certifications</h2>
            <Badge variant="secondary" className="text-sm">
              {certifications.length} earned
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((certification, index) => (
              <motion.div
                key={certification.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <CertificationBadge 
                  certification={certification}
                  showDetails={true}
                  showActions={true}
                  className="bg-white/80 backdrop-blur-sm"
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Ready to Earn */}
      {eligibleCategories.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Ready to Earn</h2>
            <Badge className="bg-green-100 text-green-800">
              {eligibleCategories.length} available
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eligibleCategories.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {COURSE_CATEGORIES[category.category as keyof typeof COURSE_CATEGORIES]}
                      </CardTitle>
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getCertificationColor(category.nextLevel)} flex items-center justify-center`}>
                        <Award className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        {CERTIFICATION_LEVELS[category.nextLevel as keyof typeof CERTIFICATION_LEVELS]} Level
                      </p>
                      <p className="text-sm text-gray-600">
                        You've met all requirements for this certification
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{category.progress.coursesCompleted} courses completed</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{category.progress.averageScore}% average score</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{category.progress.totalHours} hours completed</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleGenerateCertification(category.category)}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Certificate'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* In Progress */}
      {progressToNext.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Certification Progress</h2>
            <Badge variant="outline" className="text-sm">
              {progressToNext.length} categories
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {progressToNext.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {COURSE_CATEGORIES[category.category as keyof typeof COURSE_CATEGORIES]}
                      </CardTitle>
                      <Badge variant="outline">
                        {CERTIFICATION_LEVELS[category.nextLevel as keyof typeof CERTIFICATION_LEVELS]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Courses Completed</span>
                        <span className="font-medium">
                          {category.progress.coursesCompleted} / {category.requirements.coursesCompleted || 1}
                        </span>
                      </div>
                      <Progress 
                        value={(category.progress.coursesCompleted / (category.requirements.coursesCompleted || 1)) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Average Score</span>
                        <span className="font-medium">
                          {category.progress.averageScore}% / {category.requirements.averageScore || 70}%
                        </span>
                      </div>
                      <Progress 
                        value={(category.progress.averageScore / (category.requirements.averageScore || 70)) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Study Hours</span>
                        <span className="font-medium">
                          {category.progress.totalHours}h / {category.requirements.totalHours || 10}h
                        </span>
                      </div>
                      <Progress 
                        value={(category.progress.totalHours / (category.requirements.totalHours || 10)) * 100} 
                        className="h-2"
                      />
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = `/academy/courses?category=${category.category}`}
                    >
                      Continue Learning
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Empty State */}
      {certifications.length === 0 && eligibleCategories.length === 0 && progressToNext.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16"
        >
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Start Your Certification Journey
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Complete courses and earn certifications to showcase your expertise and advance your career.
          </p>
          <Button
            onClick={() => window.location.href = '/academy/courses'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Browse Courses
          </Button>
        </motion.div>
      )}
    </div>
  )
}
