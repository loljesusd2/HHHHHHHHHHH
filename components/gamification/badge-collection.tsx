
'use client'

import { motion } from 'framer-motion'
import { Award, Lock, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBadges } from '@/hooks/use-badges'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'

interface BadgeCollectionProps {
  userId?: string
  compact?: boolean
  showProgress?: boolean
}

export function BadgeCollection({ userId, compact = false, showProgress = true }: BadgeCollectionProps) {
  const { earned, available, total, recentlyEarned, loading, error } = useBadges(userId)

  if (loading) {
    return <BadgeCollectionSkeleton compact={compact} />
  }

  if (error) {
    return null
  }

  if (compact) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Badges ({total})
          </h3>
          {recentlyEarned.length > 0 && (
            <Badge variant="outline" className="text-green-600 border-green-200">
              {recentlyEarned.length} New!
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {earned.slice(0, 6).map((badge, index) => (
            <motion.div
              key={badge.badgeType}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-2 rounded-lg border-2 ${
                badge.isNew ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
              }`}
              title={badge.description}
            >
              <div className="text-2xl">{badge.icon}</div>
              {badge.isNew && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </motion.div>
          ))}
          {earned.length > 6 && (
            <div className="p-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
              <span className="text-sm text-gray-500">+{earned.length - 6}</span>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Award className="w-5 h-5 text-amber-600" />
            Badge Collection
            {recentlyEarned.length > 0 && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                {recentlyEarned.length} New!
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="earned" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="earned">Earned ({earned.length})</TabsTrigger>
              <TabsTrigger value="available">Available ({available.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="earned" className="space-y-4">
              {earned.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No badges earned yet</p>
                  <p className="text-sm text-gray-400">Complete activities to earn your first badge!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {earned.map((badge, index) => (
                    <motion.div
                      key={badge.badgeType}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative p-4 rounded-lg border-2 text-center ${
                        badge.isNew 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <h4 className="font-medium text-gray-800 text-sm">{badge.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                      
                      {badge.isNew && (
                        <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                          <Clock className="w-3 h-3" />
                          New!
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="available" className="space-y-4">
              {available.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">All badges earned!</p>
                  <p className="text-sm text-gray-400">You're a true Beauty GO champion!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {available.map((badge, index) => (
                    <motion.div
                      key={badge.badgeType}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative p-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-center opacity-60 hover:opacity-80 transition-opacity"
                    >
                      <div className="text-3xl mb-2 grayscale">{badge.icon}</div>
                      <h4 className="font-medium text-gray-600 text-sm">{badge.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                      
                      {showProgress && badge.progress !== undefined && badge.progress > 0 && (
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-gray-600">{badge.progress}%</span>
                          </div>
                          <Progress value={badge.progress} className="h-1" />
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function BadgeCollectionSkeleton({ compact }: { compact: boolean }) {
  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <EnhancedSkeleton className="h-4 w-20" />
          <EnhancedSkeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[...Array(6)].map((_, i) => (
            <EnhancedSkeleton key={i} className="w-12 h-12 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <EnhancedSkeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <EnhancedSkeleton className="h-10 rounded-lg" />
            <EnhancedSkeleton className="h-10 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <EnhancedSkeleton className="h-16 rounded-lg" />
                <EnhancedSkeleton className="h-4 w-full" />
                <EnhancedSkeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
