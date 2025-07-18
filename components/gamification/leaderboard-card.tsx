
'use client'

import { motion } from 'framer-motion'
import { Crown, Star, TrendingUp, MapPin, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'

interface LeaderboardCardProps {
  initialType?: 'all' | 'professionals' | 'clients'
  initialPeriod?: 'all' | 'weekly' | 'monthly'
  neighborhood?: string
  limit?: number
  compact?: boolean
}

export function LeaderboardCard({ 
  initialType = 'all', 
  initialPeriod = 'weekly', 
  neighborhood,
  limit = 10,
  compact = false 
}: LeaderboardCardProps) {
  const { leaderboard, loading, error, setFilters, filters } = useLeaderboard({
    type: initialType,
    period: initialPeriod,
    neighborhood,
    limit
  })

  if (loading) {
    return <LeaderboardCardSkeleton compact={compact} />
  }

  if (error) {
    return null
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />
      case 2: return <span className="text-gray-400 font-bold">2</span>
      case 3: return <span className="text-amber-600 font-bold">3</span>
      default: return <span className="text-gray-500 font-medium">{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 2: return 'bg-gray-100 text-gray-800 border-gray-200'
      case 3: return 'bg-amber-100 text-amber-800 border-amber-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  if (compact) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            Top Performers
          </h3>
          <Badge variant="outline" className="text-amber-600 border-amber-200">
            {filters.period === 'weekly' ? 'This Week' : filters.period === 'monthly' ? 'This Month' : 'All Time'}
          </Badge>
        </div>
        
        <div className="space-y-2">
          {leaderboard.slice(0, 5).map((entry, index) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-center w-8 h-8">
                {getRankIcon(entry.rank)}
              </div>
              <Avatar className="w-8 h-8">
                <AvatarImage src={entry.user.avatar} />
                <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {entry.professional?.businessName || entry.user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {entry.weeklyPoints} points this week
                </p>
              </div>
              <div className="flex items-center gap-1">
                {entry.badges.length > 0 && (
                  <Award className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-xs text-gray-500">{entry.badges.length}</span>
              </div>
            </motion.div>
          ))}
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Leaderboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filters.period} onValueChange={(value) => setFilters({ ...filters, period: value as any })}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value as any })}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="professionals">Professionals</SelectItem>
                  <SelectItem value="clients">Clients</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No leaderboard data available</p>
              <p className="text-sm text-gray-400">Start earning points to appear on the leaderboard!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    entry.rank <= 3 
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar */}
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={entry.user.avatar} />
                      <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">
                        {entry.professional?.businessName || entry.user.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {entry.professional && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {entry.professional.city}
                          </div>
                        )}
                        {entry.professional && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {entry.professional.averageRating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">
                        {entry.totalPoints.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {filters.period === 'weekly' ? `${entry.weeklyPoints} this week` : 
                         filters.period === 'monthly' ? `${entry.monthlyPoints} this month` : 
                         'total points'}
                      </div>
                    </div>

                    {/* Badges */}
                    {entry.badges.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-amber-500" />
                        <Badge variant="outline" className="text-amber-600 border-amber-200">
                          {entry.badges.length}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Top 3 Special Styling */}
                  {entry.rank <= 3 && (
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <Badge className={getRankBadge(entry.rank)}>
                        {entry.rank === 1 ? '🏆 Top Performer' : 
                         entry.rank === 2 ? '🥈 Runner Up' : 
                         '🥉 Third Place'}
                      </Badge>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function LeaderboardCardSkeleton({ compact }: { compact: boolean }) {
  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <EnhancedSkeleton className="h-4 w-24" />
          <EnhancedSkeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200">
              <EnhancedSkeleton className="w-8 h-8 rounded-full" />
              <EnhancedSkeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <EnhancedSkeleton className="h-4 w-24" />
                <EnhancedSkeleton className="h-3 w-16" />
              </div>
              <EnhancedSkeleton className="w-6 h-4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <EnhancedSkeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <EnhancedSkeleton className="h-10 w-32" />
            <EnhancedSkeleton className="h-10 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border-2 border-gray-200">
              <div className="flex items-center gap-4">
                <EnhancedSkeleton className="w-12 h-12 rounded-full" />
                <EnhancedSkeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <EnhancedSkeleton className="h-4 w-32" />
                  <EnhancedSkeleton className="h-3 w-24" />
                </div>
                <div className="text-right space-y-1">
                  <EnhancedSkeleton className="h-5 w-16" />
                  <EnhancedSkeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
