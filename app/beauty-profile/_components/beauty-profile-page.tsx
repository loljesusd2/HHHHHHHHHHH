
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Clock, Share2, Eye, EyeOff, Plus, Calendar, TrendingUp, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TimelinePhoto } from '@/components/gamification/timeline-photo'
import { ShareButton } from '@/components/gamification/share-button'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'
import { useBeautyTimeline } from '@/hooks/use-beauty-timeline'
import { SERVICE_CATEGORIES } from '@/lib/types'

export function BeautyProfilePage() {
  const { timeline, stats, loading, error } = useBeautyTimeline()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline')

  if (loading) {
    return <BeautyProfileSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Error Loading Profile</h3>
            <p className="text-gray-600">We couldn't load your beauty profile. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filter timeline by category
  const filteredTimeline = selectedCategory === 'all' 
    ? timeline 
    : Object.entries(timeline).reduce((acc, [month, entries]) => {
        const filtered = entries.filter(entry => 
          entry.serviceType === selectedCategory
        )
        if (filtered.length > 0) {
          acc[month] = filtered
        }
        return acc
      }, {} as typeof timeline)

  // Get all entries for stats
  const allEntries = Object.values(timeline).flat()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
              <Camera className="w-8 h-8" />
              My Beauty Profile
            </h1>
            <p className="text-amber-100">Your personal beauty journey timeline</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-4">
        <div className="space-y-6">
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
                <CardContent className="p-4 text-center">
                  <Camera className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-pink-700">{stats?.totalEntries || 0}</div>
                  <div className="text-sm text-pink-600">Total Entries</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <Eye className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">{stats?.publicEntries || 0}</div>
                  <div className="text-sm text-green-600">Public</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">{stats?.servicesUsed || 0}</div>
                  <div className="text-sm text-blue-600">Services</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <Heart className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-700">
                    {stats?.favoriteService ? SERVICE_CATEGORIES[stats.favoriteService as keyof typeof SERVICE_CATEGORIES]?.slice(0, 8) : 'N/A'}
                  </div>
                  <div className="text-sm text-purple-600">Favorite</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    Beauty Timeline
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <ShareButton
                      type="timeline_photo"
                      data={{}}
                      variant="outline"
                      size="sm"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Profile
                    </ShareButton>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Entry
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Filter by service:</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        {Object.entries(SERVICE_CATEGORIES).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">View:</label>
                    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        <TabsTrigger value="grid">Grid</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                {/* Timeline Content */}
                {Object.keys(filteredTimeline).length === 0 ? (
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No entries yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start documenting your beauty journey by adding your first transformation photos.
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Entry
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(filteredTimeline)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([month, entries]) => (
                        <motion.div
                          key={month}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-amber-600" />
                            <h3 className="text-lg font-medium text-gray-800">
                              {new Date(month + '-01').toLocaleDateString('en-US', { 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </h3>
                            <Badge variant="outline" className="text-amber-600 border-amber-200">
                              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                            </Badge>
                          </div>
                          
                          <div className={
                            viewMode === 'grid' 
                              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                              : 'space-y-4'
                          }>
                            {entries.map((entry, index) => (
                              <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <TimelinePhoto 
                                  entry={entry} 
                                  compact={viewMode === 'grid'}
                                />
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="h-20"></div>
    </div>
  )
}

function BeautyProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-6 pb-8">
        <div className="max-w-6xl mx-auto text-center">
          <EnhancedSkeleton className="h-8 w-64 mx-auto mb-2 bg-white/20" />
          <EnhancedSkeleton className="h-4 w-80 mx-auto bg-white/20" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-4 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <EnhancedSkeleton key={i} className="h-20 bg-white" />
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <EnhancedSkeleton className="h-6 w-32" />
              <div className="flex gap-2">
                <EnhancedSkeleton className="h-9 w-24" />
                <EnhancedSkeleton className="h-9 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <EnhancedSkeleton className="h-10 w-48" />
                <EnhancedSkeleton className="h-10 w-32" />
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <EnhancedSkeleton key={i} className="h-64 bg-white" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
