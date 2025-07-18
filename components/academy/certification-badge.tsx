
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Trophy, Award, Star, Download, Share2, Shield, Calendar } from 'lucide-react'
import { AcademyCertification } from '@/lib/types'
import { CERTIFICATION_LEVELS, COURSE_CATEGORIES } from '@/lib/types'

interface CertificationBadgeProps {
  certification: AcademyCertification
  showDetails?: boolean
  showActions?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function CertificationBadge({ 
  certification, 
  showDetails = true,
  showActions = true,
  size = 'medium',
  className 
}: CertificationBadgeProps) {
  const getLevelColor = (level: string) => {
    const colors = {
      'BRONZE': 'from-orange-400 to-orange-600',
      'SILVER': 'from-gray-400 to-gray-600',
      'GOLD': 'from-yellow-400 to-yellow-600',
      'PLATINUM': 'from-purple-400 to-purple-600',
      'DIAMOND': 'from-blue-400 to-blue-600'
    }
    return colors[level as keyof typeof colors] || 'from-gray-400 to-gray-600'
  }

  const getLevelIcon = (level: string) => {
    const icons = {
      'BRONZE': Award,
      'SILVER': Trophy,
      'GOLD': Trophy,
      'PLATINUM': Trophy,
      'DIAMOND': Star
    }
    const Icon = icons[level as keyof typeof icons] || Award
    return <Icon className="w-6 h-6" />
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'p-3'
      case 'large':
        return 'p-8'
      default:
        return 'p-6'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date))
  }

  const handleDownload = () => {
    // Open certificate URL in new tab
    window.open(certification.certificateUrl, '_blank')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${certification.level} Certification in ${certification.category}`,
        text: `I've earned my ${certification.level} certification in ${certification.category} from Beauty Academy!`,
        url: certification.certificateUrl
      })
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(certification.certificateUrl)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:shadow-xl transition-all duration-300">
        <CardContent className={getSizeClasses()}>
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${getLevelColor(certification.level)} text-white mb-4 shadow-lg`}
            >
              {getLevelIcon(certification.level)}
            </motion.div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {CERTIFICATION_LEVELS[certification.level as keyof typeof CERTIFICATION_LEVELS]} Certificate
            </h3>

            <Badge 
              variant="outline" 
              className="text-sm px-3 py-1 border-gray-300"
            >
              {COURSE_CATEGORIES[certification.category as keyof typeof COURSE_CATEGORIES]}
            </Badge>
          </div>

          {/* Details */}
          {showDetails && (
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <p className="font-semibold text-gray-900">{certification.coursesCompleted}</p>
                  <p className="text-gray-600">Courses Completed</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <p className="font-semibold text-gray-900">{certification.averageScore}%</p>
                  <p className="text-gray-600">Average Score</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <p className="font-semibold text-gray-900">{certification.totalHours}h</p>
                  <p className="text-gray-600">Study Hours</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Shield className="w-4 h-4 text-green-600" />
                    <p className="font-semibold text-green-600">Verified</p>
                  </div>
                  <p className="text-gray-600">Certificate</p>
                </div>
              </div>

              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <p className="font-medium text-blue-900">Earned on</p>
                </div>
                <p className="text-blue-700">{formatDate(certification.earnedAt)}</p>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Certificate Number</p>
                <p className="font-mono text-sm font-medium text-gray-900">
                  {certification.certificateNumber}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              <Button 
                onClick={handleDownload}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button 
                onClick={handleShare}
                variant="outline"
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          )}

          {/* Verification Badge */}
          {certification.isVerified && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-4 right-4"
            >
              <div className="bg-green-500 text-white rounded-full p-2">
                <Shield className="w-4 h-4" />
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
