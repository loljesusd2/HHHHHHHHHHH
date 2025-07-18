
'use client'

import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Star, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useBeautyPoints } from '@/hooks/use-beauty-points'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'

interface PointsDisplayProps {
  userId?: string
  compact?: boolean
  showProgress?: boolean
}

export function PointsDisplay({ userId, compact = false, showProgress = true }: PointsDisplayProps) {
  const { stats, loading, error } = useBeautyPoints()

  if (loading) {
    return <PointsDisplaySkeleton compact={compact} />
  }

  if (error || !stats) {
    return null
  }

  const levelColors = {
    BRONZE: 'bg-amber-100 text-amber-800 border-amber-200',
    SILVER: 'bg-gray-100 text-gray-800 border-gray-200',
    GOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PLATINUM: 'bg-purple-100 text-purple-800 border-purple-200'
  }

  const levelIcons = {
    BRONZE: '🥉',
    SILVER: '🥈',
    GOLD: '🥇',
    PLATINUM: '💎'
  }

  if (compact) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{stats.totalPoints}</p>
            <p className="text-xs text-gray-500">Beauty Points</p>
          </div>
        </div>
        <Badge className={levelColors[stats.currentLevel as keyof typeof levelColors]}>
          {levelIcons[stats.currentLevel as keyof typeof levelIcons]} {stats.currentLevel}
        </Badge>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Trophy className="w-5 h-5 text-amber-600" />
            Beauty Points
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Points Display */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-4xl font-bold text-amber-600 mb-2"
            >
              {stats.totalPoints.toLocaleString()}
            </motion.div>
            <p className="text-sm text-gray-600">Total Points Earned</p>
          </div>

          {/* Level Badge */}
          <div className="flex justify-center">
            <Badge className={`${levelColors[stats.currentLevel as keyof typeof levelColors]} px-4 py-2 text-sm`}>
              {levelIcons[stats.currentLevel as keyof typeof levelIcons]} {stats.currentLevel} Level
            </Badge>
          </div>

          {/* Progress to Next Level */}
          {showProgress && stats.nextLevel && stats.pointsToNextLevel > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress to {stats.nextLevel}</span>
                <span className="text-amber-600 font-medium">{stats.pointsToNextLevel} points to go</span>
              </div>
              <Progress 
                value={((stats.totalPoints) / (stats.totalPoints + stats.pointsToNextLevel)) * 100} 
                className="h-2"
              />
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-lg font-semibold text-gray-800">{stats.badges.length}</span>
              </div>
              <p className="text-xs text-gray-600">Badges Earned</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-lg font-semibold text-gray-800">{stats.referralCount}</span>
              </div>
              <p className="text-xs text-gray-600">Referrals</p>
            </div>
          </div>

          {/* Recent Activity */}
          {stats.recentActivity.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Recent Activity
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {stats.recentActivity.slice(0, 3).map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-700">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      +{activity.points}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function PointsDisplaySkeleton({ compact }: { compact: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
        <EnhancedSkeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-1">
          <EnhancedSkeleton className="h-4 w-12" />
          <EnhancedSkeleton className="h-3 w-16" />
        </div>
        <EnhancedSkeleton className="h-6 w-20 rounded-full" />
      </div>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
      <CardHeader className="pb-3">
        <EnhancedSkeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <EnhancedSkeleton className="h-12 w-24 mx-auto mb-2" />
          <EnhancedSkeleton className="h-4 w-32 mx-auto" />
        </div>
        <div className="flex justify-center">
          <EnhancedSkeleton className="h-8 w-24 rounded-full" />
        </div>
        <div className="space-y-2">
          <EnhancedSkeleton className="h-4 w-full" />
          <EnhancedSkeleton className="h-2 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
