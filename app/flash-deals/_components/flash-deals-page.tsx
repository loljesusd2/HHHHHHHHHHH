
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Clock, MapPin, Filter, Plus, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FlashDealTimer, FlashDealsGrid } from '@/components/gamification/flash-deal-timer'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'
import { useFlashDeals } from '@/hooks/use-flash-deals'
import { SERVICE_CATEGORIES } from '@/lib/types'

export function FlashDealsPage() {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [userRole, setUserRole] = useState<string | null>(null)
  const { deals, loading, error } = useFlashDeals({ 
    neighborhood: selectedNeighborhood || undefined,
    category: selectedCategory || undefined
  })

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUserRole(userData.role)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
      }
    }
    fetchUserRole()
  }, [])

  const neighborhoods = [
    'Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 
    'St. Petersburg', 'Hialeah', 'Tallahassee', 'Port St. Lucie', 'Cape Coral'
  ]

  const isProfessional = userRole === 'PROFESSIONAL'

  if (loading) {
    return <FlashDealsPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
              <Zap className="w-8 h-8" />
              Flash Deals
            </h1>
            <p className="text-red-100">Limited time offers on beauty services in your area</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-4">
        <div className="space-y-6">
          {/* Filters and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-red-600" />
                    Filters
                  </CardTitle>
                  {isProfessional && (
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Flash Deal
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Neighborhood
                    </label>
                    <Select value={selectedNeighborhood} onValueChange={setSelectedNeighborhood}>
                      <SelectTrigger>
                        <SelectValue placeholder="All neighborhoods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All neighborhoods</SelectItem>
                        {neighborhoods.map((neighborhood) => (
                          <SelectItem key={neighborhood} value={neighborhood}>
                            {neighborhood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Service Category
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All categories</SelectItem>
                        {Object.entries(SERVICE_CATEGORIES).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedNeighborhood('')
                        setSelectedCategory('')
                      }}
                      className="w-full"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Flash Deals Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Flash deals are limited-time offers with limited availability. 
                When you see a deal you like, grab it quickly before it expires or runs out!
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Active Flash Deals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-600" />
                  Active Flash Deals ({deals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Error loading flash deals</p>
                    <p className="text-sm text-gray-400">Please try again later</p>
                  </div>
                ) : deals.length === 0 ? (
                  <div className="text-center py-12">
                    <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Active Flash Deals</h3>
                    <p className="text-gray-600 mb-4">
                      {selectedNeighborhood || selectedCategory 
                        ? 'No deals match your current filters. Try adjusting your search criteria.'
                        : 'No flash deals are currently active in your area. Check back later for amazing offers!'
                      }
                    </p>
                    {isProfessional && (
                      <Button className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Flash Deal
                      </Button>
                    )}
                  </div>
                ) : (
                  <FlashDealsGrid 
                    neighborhood={selectedNeighborhood || undefined}
                    category={selectedCategory || undefined}
                    limit={12}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* How Flash Deals Work */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-600" />
                  How Flash Deals Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">For Clients</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Find deals:</strong> Browse active flash deals in your area
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Limited time:</strong> Deals expire within hours, so act fast!
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Limited spots:</strong> Each deal has a maximum number of uses
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Instant savings:</strong> Discount applied automatically at booking
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">For Professionals</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Fill slots:</strong> Turn empty time slots into revenue
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Attract clients:</strong> Reach new customers with special offers
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>You control:</strong> Set your own discount and availability
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Boost visibility:</strong> Featured in the flash deals section
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="h-20"></div>
    </div>
  )
}

function FlashDealsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 pb-8">
        <div className="max-w-6xl mx-auto text-center">
          <EnhancedSkeleton className="h-8 w-64 mx-auto mb-2 bg-white/20" />
          <EnhancedSkeleton className="h-4 w-80 mx-auto bg-white/20" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-4 space-y-6">
        <EnhancedSkeleton className="h-32 bg-white" />
        <EnhancedSkeleton className="h-16 bg-white" />
        
        <Card>
          <CardHeader>
            <EnhancedSkeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <EnhancedSkeleton key={i} className="h-48 bg-white" />
              ))}
            </div>
          </CardContent>
        </Card>
        
        <EnhancedSkeleton className="h-64 bg-white" />
      </div>
    </div>
  )
}
