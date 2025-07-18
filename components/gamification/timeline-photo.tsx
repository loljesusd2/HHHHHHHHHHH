
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Heart, Share2, Eye, EyeOff, Camera, Edit3, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { EnhancedImage } from '@/components/ui/enhanced-image'
import { BeautyTimeline } from '@/lib/types'
import { SERVICE_CATEGORIES } from '@/lib/types'
import { useSocialShare } from '@/hooks/use-social-share'

interface TimelinePhotoProps {
  entry: BeautyTimeline
  onEdit?: (entry: BeautyTimeline) => void
  onDelete?: (entryId: string) => void
  onToggleVisibility?: (entryId: string, isPublic: boolean) => void
  showActions?: boolean
  compact?: boolean
}

export function TimelinePhoto({ 
  entry, 
  onEdit, 
  onDelete, 
  onToggleVisibility, 
  showActions = true,
  compact = false 
}: TimelinePhotoProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [showBeforeAfter, setShowBeforeAfter] = useState(false)
  const { generateShareContent, shareToSocial } = useSocialShare()

  const handleShare = async () => {
    try {
      const shareData = await generateShareContent('timeline_photo', {
        timelineId: entry.id
      })
      
      shareToSocial('twitter', shareData.shareData)
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const serviceCategory = entry.serviceType ? SERVICE_CATEGORIES[entry.serviceType as keyof typeof SERVICE_CATEGORIES] : 'Beauty Service'

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <Card className="overflow-hidden">
          <div className="relative aspect-square">
            <EnhancedImage
              src={entry.afterPhoto || entry.beforePhoto || '/placeholder-beauty.jpg'}
              alt="Beauty transformation"
              fill
              className="object-cover"
            />
            {entry.beforePhoto && entry.afterPhoto && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 text-xs"
                onClick={() => setShowBeforeAfter(!showBeforeAfter)}
              >
                {showBeforeAfter ? 'After' : 'Before'}
              </Button>
            )}
          </div>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {new Date(entry.createdAt).toLocaleDateString()}
            </div>
            <p className="text-sm font-medium text-gray-800 mt-1">{serviceCategory}</p>
            {entry.notes && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{entry.notes}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={entry.user?.avatar} />
                  <AvatarFallback>{entry.user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-gray-800">{entry.user?.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-amber-600 border-amber-200">
                  {serviceCategory}
                </Badge>
                {entry.isPublic ? (
                  <Eye className="w-4 h-4 text-green-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Image(s) */}
          <div className="relative">
            {entry.beforePhoto && entry.afterPhoto ? (
              <div className="grid grid-cols-2 gap-0">
                <div className="relative aspect-square">
                  <EnhancedImage
                    src={entry.beforePhoto}
                    alt="Before"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    Before
                  </div>
                </div>
                <div className="relative aspect-square">
                  <EnhancedImage
                    src={entry.afterPhoto}
                    alt="After"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    After
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative aspect-square">
                <EnhancedImage
                  src={entry.afterPhoto || entry.beforePhoto || '/placeholder-beauty.jpg'}
                  alt="Beauty transformation"
                  fill
                  className="object-cover"
                />
                {!(entry.beforePhoto && entry.afterPhoto) && (
                  <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    <Camera className="w-3 h-3 inline mr-1" />
                    {entry.afterPhoto ? 'After' : 'Before'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Service Info */}
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-amber-700 bg-amber-50">
                {serviceCategory}
              </Badge>
              {entry.booking?.service?.professional?.businessName && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-3 h-3" />
                  {entry.booking.service.professional.businessName}
                </div>
              )}
            </div>

            {/* Notes */}
            {entry.notes && (
              <p className="text-gray-700 mb-4">{entry.notes}</p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  Like
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2 text-gray-500"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>

              {showActions && (
                <div className="flex items-center gap-2">
                  {onToggleVisibility && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleVisibility(entry.id, !entry.isPublic)}
                      className="flex items-center gap-2 text-gray-500"
                    >
                      {entry.isPublic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {entry.isPublic ? 'Make Private' : 'Make Public'}
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(entry)}
                      className="flex items-center gap-2 text-gray-500"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(entry.id)}
                      className="flex items-center gap-2 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
