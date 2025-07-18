
'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Star, Clock, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

interface StyleGalleryProps {
  professionalId: string
  isOpen: boolean
  onClose: () => void
}

interface PortfolioItem {
  id: string
  title: string
  description?: string
  beforeImageUrl?: string
  afterImageUrl: string
  styleTags: string[]
  colorTags: string[]
  completionTime?: number
  difficulty: string
  clientSatisfaction?: number
  category: string
}

export function StyleGallery({ professionalId, isOpen, onClose }: StyleGalleryProps) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const fetchPortfolio = async () => {
    if (!isOpen || portfolio.length > 0) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/professionals/${professionalId}/portfolio`)
      if (response.ok) {
        const data = await response.json()
        setPortfolio(data)
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchPortfolio()
  }, [isOpen, professionalId])

  const filteredPortfolio = portfolio.filter(item => 
    filter === 'all' || item.category === filter
  )

  const categories = Array.from(new Set(portfolio.map(item => item.category)))

  const difficultyColors = {
    EASY: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HARD: 'bg-orange-100 text-orange-800',
    EXPERT: 'bg-red-100 text-red-800'
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Style Portfolio
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filters */}
              {categories.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={filter === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(category)}
                    >
                      {category.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              )}

              {/* Portfolio Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPortfolio.map((item) => (
                  <Card 
                    key={item.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="aspect-[4/3] relative bg-gray-100">
                      {item.beforeImageUrl ? (
                        <div className="grid grid-cols-2 h-full">
                          <div className="relative">
                            <Image
                              src={item.beforeImageUrl}
                              alt="Before"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="text-xs">Before</Badge>
                            </div>
                          </div>
                          <div className="relative">
                            <Image
                              src={item.afterImageUrl}
                              alt="After"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge className="text-xs bg-green-500">After</Badge>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={item.afterImageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="p-3 space-y-2">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      
                      <div className="flex items-center justify-between text-xs">
                        {item.completionTime && (
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{item.completionTime} min</span>
                          </div>
                        )}
                        
                        {item.clientSatisfaction && (
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span>{item.clientSatisfaction}/5</span>
                          </div>
                        )}
                        
                        <Badge 
                          className={`text-xs ${difficultyColors[item.difficulty as keyof typeof difficultyColors]}`}
                        >
                          {item.difficulty}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {item.styleTags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredPortfolio.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No portfolio items found
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedItem.title}</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="aspect-[4/3] relative bg-gray-100 rounded-lg overflow-hidden">
                {selectedItem.beforeImageUrl ? (
                  <div className="grid grid-cols-2 h-full">
                    <div className="relative">
                      <Image
                        src={selectedItem.beforeImageUrl}
                        alt="Before"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary">Before</Badge>
                      </div>
                    </div>
                    <div className="relative">
                      <Image
                        src={selectedItem.afterImageUrl}
                        alt="After"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-500">After</Badge>
                      </div>
                      <div className="absolute inset-y-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <ArrowRight className="h-6 w-6 text-white bg-black/50 rounded-full p-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={selectedItem.afterImageUrl}
                    alt={selectedItem.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              {selectedItem.description && (
                <p className="text-gray-600">{selectedItem.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedItem.completionTime && (
                  <div>
                    <span className="font-medium">Time taken:</span>
                    <span className="ml-2">{selectedItem.completionTime} minutes</span>
                  </div>
                )}
                
                {selectedItem.clientSatisfaction && (
                  <div>
                    <span className="font-medium">Client rating:</span>
                    <span className="ml-2">{selectedItem.clientSatisfaction}/5 ⭐</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="font-medium text-sm">Style Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {[...selectedItem.styleTags, ...selectedItem.colorTags].map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
